-- =============================================================================
-- Datenmodell an den echten Objektbestand von BüroHamburg anpassen
-- (Quelle: FileMaker, aktuell über die Website-API von buerohamburg.de übernommen).
--
-- Bisher lagen nur Mock-Daten in der Datenbank – das Schema wird daher neu aufgebaut.
--
--   districts ─┐
--              └─ buildings ── properties ──┬─ rental_units
--   contacts ──────────────────┘            └─ property_images
-- =============================================================================

drop function if exists search_properties cascade;
drop view if exists property_listings cascade;
drop table if exists property_images, rental_units, inquiries, properties, buildings, contacts, districts cascade;
drop type if exists property_category, property_type, location_class cascade;

-- Kategorien entsprechen den Objektarten in FileMaker:
--   Büro/Praxis → buero-praxis · Laden → laden-gastro · Halle/Lager/Prod. → lager-logistik
create type property_category as enum ('buero-praxis', 'laden-gastro', 'lager-logistik');
create type property_type as enum ('buero', 'laden', 'lager');
-- Lagen (Teilmärkte) wie auf buerohamburg.de
create type market_area as enum ('hh-city', 'hh-city-sued', 'hh-alster', 'hh-west', 'hh-nord', 'hh-ost', 'hh-sued');
-- Preisangabe: Miete pro m² oder Pauschalmiete pro Monat
create type price_type as enum ('qm', 'monat');

-- -----------------------------------------------------------------------------
-- Stammdaten
-- -----------------------------------------------------------------------------
create table districts (
  slug           text primary key,
  name           text not null,
  market_area    market_area not null,
  center_lng     double precision,
  center_lat     double precision
);

create table contacts (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  role         text not null default '',
  email        text not null,
  phone        text not null default '',
  image_url    text,
  source       record_source not null default 'manual',
  external_id  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (source, external_id)
);

-- -----------------------------------------------------------------------------
-- Gebäude (aus gleicher Adresse zusammengefasst)
-- -----------------------------------------------------------------------------
create table buildings (
  id                   uuid primary key default gen_random_uuid(),
  name                 text,
  street               text not null,
  house_number         text not null default '',
  postal_code          text not null,
  city                 text not null default 'Hamburg',
  district_slug        text not null references districts (slug),
  market_area          market_area not null,
  -- null, solange keine Koordinaten vorliegen (Objekt erscheint dann nur in der Liste)
  location             extensions.geography(point, 4326),
  features             text[] not null default '{}',
  source               record_source not null default 'manual',
  external_id          text,
  synced_at            timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (source, external_id)
);

create index buildings_location_idx on buildings using gist (location);
create index buildings_district_idx on buildings (district_slug);

-- -----------------------------------------------------------------------------
-- Immobilien (ein Angebot = ein Objekt in FileMaker)
-- -----------------------------------------------------------------------------
create table properties (
  id                   uuid primary key default gen_random_uuid(),
  building_id          uuid not null references buildings (id) on delete cascade,
  contact_id           uuid references contacts (id) on delete set null,
  reference_number     text not null unique,              -- Objektnummer (fester Schlüssel)
  slug                 text not null unique,
  title                text not null,
  teaser               text not null default '',
  description          text not null default '',
  category             property_category not null,         -- Hauptkategorie
  categories           property_category[] not null,       -- alle Objektarten (für Filter)
  property_type        property_type not null,
  status               property_status not null default 'draft',
  price_type           price_type not null default 'qm',
  price_note           text,                               -- z. B. „zzgl. NK u. MwSt.“
  commission_free      boolean not null default false,
  commission_months    numeric(4, 2),                      -- Courtage in Monatsmieten
  commission_note      text,
  features             text[] not null default '{}',
  -- weitere Flächen im Objekt („ab ca. … qm“ / „bis ca. … qm“)
  area_range_min_sqm   numeric(10, 2),
  area_range_max_sqm   numeric(10, 2),
  expose_pdf_url       text,
  featured_rank        smallint,                           -- Hervorhebung auf der Startseite (1 = oben)
  published_at         timestamptz,
  source               record_source not null default 'manual',
  external_id          text,
  synced_at            timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (source, external_id),
  constraint properties_category_in_categories check (category = any (categories))
);

create index properties_status_idx on properties (status);
create index properties_building_idx on properties (building_id);
create index properties_features_idx on properties using gin (features);
create index properties_categories_idx on properties using gin (categories);

-- -----------------------------------------------------------------------------
-- Mietflächen
-- -----------------------------------------------------------------------------
create table rental_units (
  id                      uuid primary key default gen_random_uuid(),
  property_id             uuid not null references properties (id) on delete cascade,
  label                   text not null default 'Mietfläche',
  floor                   smallint,
  area_sqm                numeric(10, 2) not null check (area_sqm > 0),
  rent_per_sqm            numeric(8, 2) check (rent_per_sqm >= 0),        -- null = auf Anfrage
  rent_total_monthly      numeric(12, 2) check (rent_total_monthly >= 0), -- bei Pauschalmiete
  service_charge_per_sqm  numeric(8, 2),
  available_from          date,                                           -- null = keine Angabe
  rooms                   smallint,
  divisible               boolean not null default false,
  sort_order              smallint not null default 0,
  source                  record_source not null default 'manual',
  external_id             text,
  synced_at               timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (source, external_id)
);

create index rental_units_property_idx on rental_units (property_id);

create table property_images (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references properties (id) on delete cascade,
  url           text not null,
  storage_path  text,
  alt           text not null default '',
  sort_order    smallint not null default 0,
  source        record_source not null default 'manual',
  external_id   text,
  checksum      text,
  synced_at     timestamptz,
  created_at    timestamptz not null default now(),
  unique (source, external_id)
);

create index property_images_property_idx on property_images (property_id, sort_order);

create table inquiries (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid references properties (id) on delete set null,
  name         text not null check (char_length(name) between 2 and 200),
  company      text check (char_length(company) <= 200),
  email        text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone        text check (char_length(phone) <= 50),
  message      text not null check (char_length(message) between 10 and 4000),
  exported_at  timestamptz,
  external_id  text,
  created_at   timestamptz not null default now()
);

create index inquiries_not_exported_idx on inquiries (created_at) where exported_at is null;

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
  -- Gesamtspanne für die Flächensuche: angebotene Fläche plus weitere Flächen im Objekt
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
  select jsonb_agg(jsonb_build_object('id', im.id, 'url', im.url, 'alt', im.alt) order by im.sort_order) as images
  from property_images im
  where im.property_id = p.id
) i on true
where u.unit_count > 0;

-- =============================================================================
-- Suche (RPC) – Sortierung/Paginierung über PostgREST, Ausschnitt über GiST-Index
-- =============================================================================
create or replace function search_properties(
  p_districts     text[]        default null,
  p_category      property_category default null,
  p_market_area   market_area   default null,
  p_area_min      numeric       default null,
  p_area_max      numeric       default null,
  p_rent_min      numeric       default null,
  p_rent_max      numeric       default null,
  p_features      text[]        default null,
  p_bbox          float8[]      default null      -- [west, south, east, north]
)
returns setof property_listings
language sql stable
set search_path = public, extensions
as $$
  select *
  from property_listings l
  where l.status = 'published'
    and (p_districts is null or cardinality(p_districts) = 0 or l.district_slug = any (p_districts))
    and (p_category is null or p_category = any (l.categories))
    and (p_market_area is null or l.market_area = p_market_area)
    and (p_area_min is null or l.area_search_max >= p_area_min)
    and (p_area_max is null or l.area_search_min <= p_area_max)
    and (p_rent_min is null or (l.rent_per_sqm is not null and l.rent_per_sqm >= p_rent_min))
    and (p_rent_max is null or (l.rent_per_sqm is not null and l.rent_per_sqm <= p_rent_max))
    and (p_features is null or l.features @> p_features)
    and (
      p_bbox is null
      or l.location && st_makeenvelope(p_bbox[1], p_bbox[2], p_bbox[3], p_bbox[4], 4326)::geography
    );
$$;

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table districts       enable row level security;
alter table contacts        enable row level security;
alter table buildings       enable row level security;
alter table properties      enable row level security;
alter table rental_units    enable row level security;
alter table property_images enable row level security;
alter table inquiries       enable row level security;

create policy "districts are public" on districts for select using (true);
create policy "contacts are public" on contacts for select using (true);
create policy "buildings are public" on buildings for select using (true);
create policy "published properties are public" on properties for select using (status = 'published');
create policy "units of published properties are public" on rental_units
  for select using (exists (select 1 from properties p where p.id = rental_units.property_id and p.status = 'published'));
create policy "images of published properties are public" on property_images
  for select using (exists (select 1 from properties p where p.id = property_images.property_id and p.status = 'published'));
create policy "anyone can send an inquiry" on inquiries
  for insert to anon, authenticated with check (exported_at is null and external_id is null);

grant select on property_listings to anon, authenticated;
grant execute on function search_properties to anon, authenticated;
