-- =============================================================================
-- BüroHamburg – Immobiliensuche: initiales Datenmodell
--
--   districts ─┐
--              └─ buildings ── properties ──┬─ rental_units
--   contacts ──────────────────┘            └─ property_images
--   inquiries (Kontaktanfragen), sync_runs (FileMaker-Sync-Protokoll)
--
-- Alle vom FileMaker-Sync befüllten Tabellen tragen (source, external_id) als
-- natürlichen Schlüssel für idempotente Upserts.
-- =============================================================================

create extension if not exists postgis with schema extensions;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type property_category as enum ('buero-praxis', 'laden-gastro', 'lager-logistik');
create type property_type as enum ('buero', 'praxis', 'laden', 'gastro', 'lager');
create type location_class as enum ('city', 'citynah', 'buerozentrum', 'peripherie');
create type property_status as enum ('draft', 'published', 'reserved', 'rented', 'archived');
create type record_source as enum ('manual', 'filemaker');

-- -----------------------------------------------------------------------------
-- Hilfsfunktion: updated_at automatisch pflegen
-- -----------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Stammdaten
-- -----------------------------------------------------------------------------
create table districts (
  slug           text primary key,
  name           text not null,
  borough        text not null,
  center_lng     double precision not null,
  center_lat     double precision not null,
  location_class location_class not null
);

create table contacts (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  role                 text not null default '',
  email                text not null,
  phone                text not null default '',
  image_url            text,
  source               record_source not null default 'manual',
  external_id          text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (source, external_id)
);

-- -----------------------------------------------------------------------------
-- Gebäude
-- -----------------------------------------------------------------------------
create table buildings (
  id                   uuid primary key default gen_random_uuid(),
  name                 text,
  street               text not null,
  house_number         text not null default '',
  postal_code          text not null,
  city                 text not null default 'Hamburg',
  district_slug        text not null references districts (slug),
  location             extensions.geography(point, 4326) not null,
  location_class       location_class not null,
  year_built           smallint,
  year_renovated       smallint,
  floors               smallint,
  -- Gebäudemerkmale, z. B. aufzug, stellplaetze, neubau, denkmalschutz
  features             text[] not null default '{}',
  source               record_source not null default 'manual',
  external_id          text,
  external_modified_at timestamptz,
  synced_at            timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (source, external_id)
);

create index buildings_location_idx on buildings using gist (location);
create index buildings_district_idx on buildings (district_slug);

-- -----------------------------------------------------------------------------
-- Immobilien (Vermarktungsobjekt / Exposé)
-- -----------------------------------------------------------------------------
create table properties (
  id                   uuid primary key default gen_random_uuid(),
  building_id          uuid not null references buildings (id) on delete cascade,
  contact_id           uuid references contacts (id) on delete set null,
  slug                 text not null unique,
  reference_number     text,
  title                text not null,
  teaser               text not null default '',
  description          text not null default '',
  category             property_category not null,
  property_type        property_type not null,
  status               property_status not null default 'draft',
  commission_free      boolean not null default false,
  -- Objektmerkmale, z. B. klimatisiert, teekueche, schaufenster
  features             text[] not null default '{}',
  published_at         timestamptz,
  source               record_source not null default 'manual',
  external_id          text,
  external_modified_at timestamptz,
  synced_at            timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (source, external_id),
  constraint properties_type_matches_category check (
    (category = 'buero-praxis' and property_type in ('buero', 'praxis')) or
    (category = 'laden-gastro' and property_type in ('laden', 'gastro')) or
    (category = 'lager-logistik' and property_type = 'lager')
  )
);

create index properties_status_idx on properties (status);
create index properties_building_idx on properties (building_id);
create index properties_features_idx on properties using gin (features);

-- -----------------------------------------------------------------------------
-- Mietflächen (einzelne vermietbare Einheiten einer Immobilie)
-- -----------------------------------------------------------------------------
create table rental_units (
  id                      uuid primary key default gen_random_uuid(),
  property_id             uuid not null references properties (id) on delete cascade,
  label                   text not null,
  floor                   smallint not null default 0,
  area_sqm                numeric(10, 2) not null check (area_sqm > 0),
  rent_per_sqm            numeric(8, 2) check (rent_per_sqm >= 0),          -- null = auf Anfrage
  service_charge_per_sqm  numeric(8, 2) check (service_charge_per_sqm >= 0),
  available_from          date,                                             -- null = sofort
  rooms                   smallint,
  divisible               boolean not null default false,
  min_divisible_area_sqm  numeric(10, 2),
  sort_order              smallint not null default 0,
  source                  record_source not null default 'manual',
  external_id             text,
  external_modified_at    timestamptz,
  synced_at               timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (source, external_id)
);

create index rental_units_property_idx on rental_units (property_id);

-- -----------------------------------------------------------------------------
-- Bilder (Dateien liegen in Supabase Storage, Bucket "property-images")
-- -----------------------------------------------------------------------------
create table property_images (
  id                   uuid primary key default gen_random_uuid(),
  property_id          uuid not null references properties (id) on delete cascade,
  url                  text not null,
  storage_path         text,
  alt                  text not null default '',
  sort_order           smallint not null default 0,
  source               record_source not null default 'manual',
  external_id          text,
  checksum             text,                 -- erkennt geänderte Dateien beim Sync
  synced_at            timestamptz,
  created_at           timestamptz not null default now(),
  unique (source, external_id)
);

create index property_images_property_idx on property_images (property_id, sort_order);

-- -----------------------------------------------------------------------------
-- Kontaktanfragen aus dem Exposé
-- -----------------------------------------------------------------------------
create table inquiries (
  id                   uuid primary key default gen_random_uuid(),
  property_id          uuid references properties (id) on delete set null,
  name                 text not null check (char_length(name) between 2 and 200),
  company              text check (char_length(company) <= 200),
  email                text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone                text check (char_length(phone) <= 50),
  message              text not null check (char_length(message) between 10 and 4000),
  -- Übergabe an FileMaker (Sync-Service setzt exported_at nach erfolgreichem Export)
  exported_at          timestamptz,
  external_id          text,
  created_at           timestamptz not null default now()
);

create index inquiries_not_exported_idx on inquiries (created_at) where exported_at is null;

-- -----------------------------------------------------------------------------
-- Protokoll des FileMaker-Sync-Services
-- -----------------------------------------------------------------------------
create table sync_runs (
  id                   uuid primary key default gen_random_uuid(),
  source               record_source not null default 'filemaker',
  started_at           timestamptz not null default now(),
  finished_at          timestamptz,
  status               text not null default 'running' check (status in ('running', 'succeeded', 'failed')),
  -- höchster FileMaker-Änderungszeitstempel dieses Laufs → Startpunkt für den nächsten Delta-Sync
  watermark            timestamptz,
  stats                jsonb not null default '{}',
  error                text
);

-- -----------------------------------------------------------------------------
-- updated_at-Trigger
-- -----------------------------------------------------------------------------
create trigger contacts_updated_at before update on contacts for each row execute function set_updated_at();
create trigger buildings_updated_at before update on buildings for each row execute function set_updated_at();
create trigger properties_updated_at before update on properties for each row execute function set_updated_at();
create trigger rental_units_updated_at before update on rental_units for each row execute function set_updated_at();

-- =============================================================================
-- Lesemodell für das Frontend
-- =============================================================================
create view property_listings with (security_invoker = true) as
select
  p.id,
  p.slug,
  p.title,
  p.teaser,
  p.description,
  p.category,
  p.property_type,
  p.status,
  p.commission_free,
  p.published_at,
  b.location,
  b.location_class,
  b.district_slug,
  d.name                                            as district_name,
  concat_ws(' ', b.street, b.house_number) || ', ' || b.postal_code || ' ' || b.city as address,
  extensions.st_y(b.location::extensions.geometry)  as lat,
  extensions.st_x(b.location::extensions.geometry)  as lng,
  u.area_min,
  u.area_max,
  u.rent_min,
  u.rent_max,
  u.rooms,
  u.floor_min,
  u.floor_max,
  u.unit_count,
  u.available_from,
  -- Objekt- und Gebäudemerkmale plus abgeleitete Merkmale
  array(
    select distinct f from unnest(
      p.features || b.features
      || case when p.commission_free then array['provisionsfrei'] else '{}'::text[] end
      || case when u.immediately_available then array['sofort-verfuegbar'] else '{}'::text[] end
      || case when u.any_divisible then array['teilbar'] else '{}'::text[] end
    ) as f
  )                                                 as features,
  coalesce(i.images, '[]'::jsonb)                   as images,
  coalesce(u.units, '[]'::jsonb)                    as units,
  jsonb_build_object(
    'id', b.id, 'name', b.name, 'street', b.street, 'houseNumber', b.house_number,
    'postalCode', b.postal_code, 'city', b.city, 'yearBuilt', b.year_built,
    'yearRenovated', b.year_renovated, 'floors', b.floors, 'features', b.features
  )                                                 as building,
  case when c.id is null then null else jsonb_build_object(
    'id', c.id, 'name', c.name, 'role', c.role, 'email', c.email, 'phone', c.phone, 'imageUrl', c.image_url
  ) end                                             as contact
from properties p
join buildings b on b.id = p.building_id
join districts d on d.slug = b.district_slug
left join contacts c on c.id = p.contact_id
left join lateral (
  select
    min(r.area_sqm)                                       as area_min,
    sum(r.area_sqm)                                       as area_max,
    min(r.rent_per_sqm)                                   as rent_min,
    max(r.rent_per_sqm)                                   as rent_max,
    case when bool_and(r.rooms is not null) then sum(r.rooms)::int end as rooms,
    min(r.floor)                                          as floor_min,
    max(r.floor)                                          as floor_max,
    count(*)::int                                         as unit_count,
    case when bool_or(r.available_from is null or r.available_from <= current_date)
      then null else min(r.available_from) end            as available_from,
    bool_or(r.available_from is null or r.available_from <= current_date) as immediately_available,
    bool_or(r.divisible)                                  as any_divisible,
    jsonb_agg(jsonb_build_object(
      'id', r.id, 'label', r.label, 'floor', r.floor, 'areaSqm', r.area_sqm,
      'rentPerSqm', r.rent_per_sqm, 'serviceChargePerSqm', r.service_charge_per_sqm,
      'availableFrom', r.available_from, 'rooms', r.rooms, 'divisible', r.divisible
    ) order by r.sort_order, r.floor)                     as units
  from rental_units r
  where r.property_id = p.id
) u on true
left join lateral (
  select jsonb_agg(jsonb_build_object('id', im.id, 'url', im.url, 'alt', im.alt) order by im.sort_order) as images
  from property_images im
  where im.property_id = p.id
) i on true
where u.unit_count > 0;

-- =============================================================================
-- Suchfunktion (RPC) – Sortierung und Paginierung erfolgen über PostgREST
-- (.order() / .range()), räumliche Filterung über den GiST-Index.
-- =============================================================================
create or replace function search_properties(
  p_districts       text[]  default null,
  p_category        property_category default null,
  p_types           property_type[] default null,
  p_location_class  location_class default null,
  p_area_min        numeric default null,
  p_area_max        numeric default null,
  p_rent_min        numeric default null,
  p_rent_max        numeric default null,
  p_features        text[]  default null,
  p_bbox            float8[] default null      -- [west, south, east, north]
)
returns setof property_listings
language sql stable
set search_path = public, extensions
as $$
  select *
  from property_listings l
  where l.status = 'published'
    and (p_districts is null or cardinality(p_districts) = 0 or l.district_slug = any (p_districts))
    and (p_category is null or l.category = p_category)
    and (p_types is null or cardinality(p_types) = 0 or l.property_type = any (p_types))
    and (p_location_class is null or l.location_class = p_location_class)
    and (p_area_min is null or l.area_max >= p_area_min)
    and (p_area_max is null or l.area_min <= p_area_max)
    and (p_rent_min is null or (l.rent_min is not null and coalesce(l.rent_max, l.rent_min) >= p_rent_min))
    and (p_rent_max is null or (l.rent_min is not null and l.rent_min <= p_rent_max))
    and (p_features is null or l.features @> p_features)
    and (
      p_bbox is null
      or l.location && st_makeenvelope(p_bbox[1], p_bbox[2], p_bbox[3], p_bbox[4], 4326)::geography
    );
$$;

-- =============================================================================
-- Row Level Security: öffentliches Lesen veröffentlichter Objekte,
-- anonymes Anlegen von Anfragen. Schreiben nur via service_role (Sync-Service).
-- =============================================================================
alter table districts       enable row level security;
alter table contacts        enable row level security;
alter table buildings       enable row level security;
alter table properties      enable row level security;
alter table rental_units    enable row level security;
alter table property_images enable row level security;
alter table inquiries       enable row level security;
alter table sync_runs       enable row level security;

create policy "districts are public" on districts for select using (true);
create policy "contacts are public" on contacts for select using (true);
create policy "buildings are public" on buildings for select using (true);

create policy "published properties are public" on properties
  for select using (status = 'published');

create policy "units of published properties are public" on rental_units
  for select using (exists (
    select 1 from properties p where p.id = rental_units.property_id and p.status = 'published'
  ));

create policy "images of published properties are public" on property_images
  for select using (exists (
    select 1 from properties p where p.id = property_images.property_id and p.status = 'published'
  ));

create policy "anyone can send an inquiry" on inquiries
  for insert to anon, authenticated with check (exported_at is null and external_id is null);

grant select on property_listings to anon, authenticated;
grant execute on function search_properties to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Storage-Bucket für Objektbilder (öffentlich lesbar)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;
