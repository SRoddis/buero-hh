-- =============================================================================
-- Suche beschleunigen: vorberechnetes Lesemodell (Materialized View)
--
-- Die View property_listings setzt bei jeder Abfrage für alle Objekte Flächen, Merkmale und
-- Bildlisten neu zusammen (~130 ms Grundkosten, unter Last mehrere Sekunden → Timeout 57014).
-- Die Suche liest jetzt aus property_listings_mv; der Sync aktualisiert sie nach Änderungen.
-- Detailseite und Merkliste lesen weiterhin direkt aus der View (immer tagesaktuell, je 1 Zeile).
-- =============================================================================

create materialized view property_listings_mv as
select * from property_listings;

-- Eindeutiger Index ist Voraussetzung für REFRESH ... CONCURRENTLY (Suche bleibt währenddessen lesbar)
create unique index property_listings_mv_id_idx on property_listings_mv (id);

-- Indexe für Filter und Sortierung der Suche
create index property_listings_mv_status_idx    on property_listings_mv (status);
create index property_listings_mv_district_idx  on property_listings_mv (district_slug);
create index property_listings_mv_market_idx    on property_listings_mv (market_area);
create index property_listings_mv_categories_idx on property_listings_mv using gin (categories);
create index property_listings_mv_features_idx  on property_listings_mv using gin (features);
create index property_listings_mv_location_idx  on property_listings_mv using gist (location);
create index property_listings_mv_rent_idx      on property_listings_mv (rent_per_sqm);
create index property_listings_mv_area_idx      on property_listings_mv (area);
create index property_listings_mv_relevance_idx on property_listings_mv (featured_rank, reference_sort desc);

-- Nicht direkt über die API lesbar (Materialized Views kennen kein RLS) – Zugriff nur über search_properties
revoke all on property_listings_mv from anon, authenticated;

-- -----------------------------------------------------------------------------
-- Suche liest aus der Materialized View (security definer, filtert selbst auf „published“)
-- -----------------------------------------------------------------------------
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
security definer
set search_path = public, extensions
as $$
  select *
  from property_listings_mv l
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

grant execute on function search_properties to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Aktualisierung – aufgerufen vom Sync (Edge Function) nach Änderungen
-- -----------------------------------------------------------------------------
create or replace function public.refresh_property_listings()
returns void
language sql
security definer
set search_path = public
as $$
  refresh materialized view concurrently property_listings_mv;
$$;

revoke all on function public.refresh_property_listings() from public, anon, authenticated;
grant execute on function public.refresh_property_listings() to service_role;
