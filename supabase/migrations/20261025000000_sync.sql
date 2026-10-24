-- =============================================================================
-- Laufender Abgleich mit buerohamburg.de (Edge Function sync-buerohamburg)
--   * Hash je Objekt erkennt Änderungen, last_seen_at/archived_at erkennen Löschungen
--   * Bilder werden als WebP (1280 px + 640 px) in Supabase Storage abgelegt (Warteschlange)
--   * pg_cron ruft die Function regelmäßig auf
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Sync-Zustand an den Objekten
-- -----------------------------------------------------------------------------
alter table properties
  add column source_hash  text,        -- Hash des Listeneintrags (/api/objects/search)
  add column detail_hash  text,        -- Hash der Detaildaten (/api/objects/<nr>)
  add column last_seen_at timestamptz, -- zuletzt in der Liste von buerohamburg.de gesehen
  add column archived_at  timestamptz; -- nicht mehr in der Liste → archiviert, später gelöscht

create index properties_archived_idx on properties (archived_at) where archived_at is not null;

-- -----------------------------------------------------------------------------
-- Bilder: Original-URL, Prüfsumme und Verarbeitungsstatus
-- -----------------------------------------------------------------------------
alter table property_images
  add column source_url    text,
  add column thumb_url     text,                       -- 640 px (Listen, Kartenpopups)
  add column storage_paths text[] not null default '{}',
  add column status        text not null default 'pending'
    check (status in ('pending', 'processing', 'done', 'failed')),
  add column attempts      smallint not null default 0,
  add column last_error    text,
  add column processed_at  timestamptz;

-- Vorhandene Bilder (aus dem Seed) zeigen noch auf buerohamburg.de → in die Warteschlange
update property_images set source_url = url where source_url is null;

create index property_images_queue_idx on property_images (status, attempts) where status in ('pending', 'processing');

-- -----------------------------------------------------------------------------
-- Lesemodell: thumbUrl ergänzen (gleiche Spalten → create or replace genügt)
-- -----------------------------------------------------------------------------
create or replace view property_listings with (security_invoker = true) as
select
  p.id,
  p.reference_number,
  nullif(regexp_replace(p.reference_number, '\D', '', 'g'), '')::bigint as reference_sort,
  p.slug,
  p.title,
  p.teaser,
  p.description,
  p.category,
  p.categories,
  p.property_type,
  p.status,
  p.price_type,
  p.price_note,
  p.commission_free,
  p.commission_months,
  p.commission_note,
  p.expose_pdf_url,
  p.featured_rank,
  p.published_at,
  b.location,
  b.market_area,
  b.district_slug,
  d.name                                                       as district_name,
  concat_ws(' ', b.street, nullif(b.house_number, '')) || ', ' || b.postal_code || ' ' || b.city as address,
  extensions.st_y(b.location::extensions.geometry)             as lat,
  extensions.st_x(b.location::extensions.geometry)             as lng,
  u.area,
  p.area_range_min_sqm                                         as area_range_min,
  p.area_range_max_sqm                                         as area_range_max,
  least(u.area, coalesce(p.area_range_min_sqm, u.area))        as area_search_min,
  greatest(u.area, coalesce(p.area_range_max_sqm, u.area))     as area_search_max,
  u.rent_per_sqm,
  u.rent_total_monthly,
  array(
    select distinct f from unnest(
      p.features || b.features
      || case when p.commission_free then array['provisionsfrei'] else '{}'::text[] end
    ) as f
  )                                                            as features,
  coalesce(i.images, '[]'::jsonb)                              as images,
  coalesce(u.units, '[]'::jsonb)                               as units,
  jsonb_build_object(
    'id', b.id, 'name', b.name, 'street', b.street, 'houseNumber', b.house_number,
    'postalCode', b.postal_code, 'city', b.city, 'features', b.features
  )                                                            as building,
  case when c.id is null then null else jsonb_build_object(
    'id', c.id, 'name', c.name, 'role', c.role, 'email', c.email, 'phone', c.phone, 'imageUrl', c.image_url
  ) end                                                        as contact
from properties p
join buildings b on b.id = p.building_id
join districts d on d.slug = b.district_slug
left join contacts c on c.id = p.contact_id
left join lateral (
  select
    sum(r.area_sqm)            as area,
    min(r.rent_per_sqm)        as rent_per_sqm,
    min(r.rent_total_monthly)  as rent_total_monthly,
    count(*)::int              as unit_count,
    jsonb_agg(jsonb_build_object(
      'id', r.id, 'label', r.label, 'floor', r.floor, 'areaSqm', r.area_sqm,
      'rentPerSqm', r.rent_per_sqm, 'rentTotalMonthly', r.rent_total_monthly,
      'serviceChargePerSqm', r.service_charge_per_sqm, 'availableFrom', r.available_from,
      'rooms', r.rooms, 'divisible', r.divisible
    ) order by r.sort_order) as units
  from rental_units r
  where r.property_id = p.id
) u on true
left join lateral (
  -- url: große Variante (bzw. Original, solange noch nicht umgewandelt), thumbUrl: 640 px
  select jsonb_agg(jsonb_build_object(
    'id', im.id, 'url', im.url, 'thumbUrl', coalesce(im.thumb_url, im.url), 'alt', im.alt
  ) order by im.sort_order) as images
  from property_images im
  where im.property_id = p.id
) i on true
where u.unit_count > 0;

-- -----------------------------------------------------------------------------
-- Sync-Protokoll: Laufart ergänzen
-- -----------------------------------------------------------------------------
alter table sync_runs add column mode text;

-- -----------------------------------------------------------------------------
-- Zeitplan: pg_cron ruft die Edge Function über pg_net auf.
-- Projekt-URL und Sync-Secret liegen im Vault (einmalig anlegen, siehe README):
--   select vault.create_secret('https://<projekt>.supabase.co', 'project_url');
--   select vault.create_secret('<zufälliger Wert>', 'sync_secret');
-- -----------------------------------------------------------------------------
create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.invoke_buerohamburg_sync(mode text)
returns bigint
language sql
security definer
set search_path = public
as $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/sync-buerohamburg',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-sync-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'sync_secret')
    ),
    body := jsonb_build_object('mode', mode),
    timeout_milliseconds := 300000
  );
$$;

revoke all on function public.invoke_buerohamburg_sync(text) from public, anon, authenticated;

-- Alle 10 Minuten: Liste abgleichen (+ reihum ein Teil der Objekte vollständig prüfen)
select cron.schedule('buerohamburg-sync',   '*/10 * * * *', $$select public.invoke_buerohamburg_sync('sync')$$);
-- Jede Minute: Bild-Warteschlange abarbeiten (WebP-Umwandlung)
select cron.schedule('buerohamburg-images', '* * * * *',    $$select public.invoke_buerohamburg_sync('images')$$);
