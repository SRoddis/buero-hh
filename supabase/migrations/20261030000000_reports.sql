-- =============================================================================
-- Monitoring-Report „Import & Qualität“ (Supabase-Dashboard → Reports)
--
-- Eine View je Report-Block; im Dashboard genügt je Block: select * from reports.<name>;
-- Schema „reports“ ist NICHT über die API freigegeben (config: schemas = public, graphql_public) und
-- für anon/authenticated gesperrt – die Views laufen als Owner und umgehen RLS, das ist hier gewollt.
-- Änderungen: neue Migration mit create or replace view (geänderte Spalten: drop view + create).
-- Beschreibung: claude/features/monitoring.md
-- =============================================================================

create schema if not exists reports;
revoke all on schema reports from public, anon, authenticated;

-- Importer · Letzter Lauf
-- Läuft der Abgleich? Takt alle 10 Minuten – „minuten_her“ über 20 heißt: der Import hängt.
create or replace view reports.letzter_lauf as
select
  status,
  to_char(started_at at time zone 'Europe/Berlin', 'DD.MM. HH24:MI')  as start,
  round(extract(epoch from now() - started_at) / 60)                  as minuten_her,
  round(extract(epoch from finished_at - started_at))                 as dauer_s,
  (stats->>'listed')::int                                             as gelistet,
  (stats->>'created')::int                                            as neu,
  (stats->>'updated')::int                                            as geaendert,
  (stats->>'archived')::int                                           as archiviert,
  (stats->>'failed')::int                                             as fehler,
  jsonb_array_length(coalesce(stats->'warnings', '[]'))               as warnungen,
  error
from sync_runs
where mode = 'sync'
order by started_at desc
limit 1;
comment on view reports.letzter_lauf is 'Importer · Letzter Lauf';

-- Importer · Letzte 10 Läufe
-- Verlauf der jüngsten Abgleiche: Dauer, Änderungen, Fehler. Zeigt, ob Probleme einmalig oder anhaltend sind.
create or replace view reports.letzte_10_laeufe as
select
  to_char(started_at at time zone 'Europe/Berlin', 'DD.MM. HH24:MI')  as start,
  status,
  round(extract(epoch from finished_at - started_at))                 as dauer_s,
  (stats->>'listed')::int                                             as gelistet,
  (stats->>'created')::int                                            as neu,
  (stats->>'updated')::int                                            as geaendert,
  (stats->>'unchanged')::int                                          as unveraendert,
  (stats->>'rechecked')::int                                          as nachgeprueft,
  (stats->>'archived')::int                                           as archiviert,
  (stats->>'restored')::int                                           as reaktiviert,
  (stats->>'failed')::int                                             as fehler,
  (stats->>'imagesQueued')::int                                       as bilder_neu,
  jsonb_array_length(coalesce(stats->'warnings', '[]'))               as warnungen,
  left(coalesce(error, stats->>'skippedArchive', ''), 120)            as hinweis
from sync_runs
where mode = 'sync'
order by started_at desc
limit 10;
comment on view reports.letzte_10_laeufe is 'Importer · Letzte 10 Läufe';

-- Importer · Zusammenfassung der letzten 10 Läufe
-- Eine Zeile als Kennzahlen-Kachel: Erfolgsquote, Dauer, Summe der Änderungen und Fehler.
create or replace view reports.letzte_10_laeufe_zusammenfassung as
with letzte as (
  select *
  from sync_runs
  where mode = 'sync' and status <> 'running'
  order by started_at desc
  limit 10
)
select
  count(*)                                                                     as laeufe,
  round(100.0 * count(*) filter (where status = 'succeeded') / nullif(count(*), 0)) as erfolg_prozent,
  round(avg(extract(epoch from finished_at - started_at)))                     as dauer_avg_s,
  round(max(extract(epoch from finished_at - started_at)))                     as dauer_max_s,
  coalesce(sum((stats->>'created')::int), 0)                                   as neu,
  coalesce(sum((stats->>'updated')::int), 0)                                   as geaendert,
  coalesce(sum((stats->>'archived')::int), 0)                                  as archiviert,
  coalesce(sum((stats->>'failed')::int), 0)                                    as fehler,
  coalesce(sum(jsonb_array_length(coalesce(stats->'warnings', '[]'))), 0)      as warnungen,
  to_char(min(started_at) at time zone 'Europe/Berlin', 'DD.MM. HH24:MI')      as seit
from letzte;
comment on view reports.letzte_10_laeufe_zusammenfassung is 'Importer · Zusammenfassung der letzten 10 Läufe';

-- Importer · Erfolgsquote der letzten 24 Stunden (als Balkendiagramm: x = stunde)
create or replace view reports.erfolgsquote_24h as
select
  date_trunc('hour', started_at at time zone 'Europe/Berlin')  as stunde,
  count(*) filter (where status = 'succeeded')                 as erfolgreich,
  count(*) filter (where status = 'failed')                    as fehlgeschlagen
from sync_runs
where mode = 'sync' and started_at > now() - interval '24 hours'
group by 1
order by 1;
comment on view reports.erfolgsquote_24h is 'Importer · Erfolgsquote der letzten 24 Stunden (als Balkendiagramm: x = stunde)';

-- Importer · Änderungen pro Tag, letzte 30 Tage (als Balkendiagramm: x = tag)
-- Ein plötzlicher Ausschlag (z. B. hunderte „archiviert“) deutet eher auf einen Fehler als auf echte Änderungen hin.
create or replace view reports.aenderungen_pro_tag as
select
  date_trunc('day', started_at at time zone 'Europe/Berlin')::date  as tag,
  coalesce(sum((stats->>'created')::int), 0)                        as neu,
  coalesce(sum((stats->>'updated')::int), 0)                        as geaendert,
  coalesce(sum((stats->>'archived')::int), 0)                       as archiviert
from sync_runs
where mode = 'sync' and status = 'succeeded' and started_at > now() - interval '30 days'
group by 1
order by 1;
comment on view reports.aenderungen_pro_tag is 'Importer · Änderungen pro Tag, letzte 30 Tage (als Balkendiagramm: x = tag)';

-- Importer · Bild-Warteschlange
-- Staut sich „pending“ oder steigt „failed“, fehlen Bilder auf der Website.
create or replace view reports.bild_warteschlange as
select
  status,
  count(*)                                                                   as bilder,
  count(distinct property_id)                                                as objekte,
  to_char(max(processed_at) at time zone 'Europe/Berlin', 'DD.MM. HH24:MI')  as zuletzt_verarbeitet,
  (array_agg(left(last_error, 100) order by processed_at desc nulls last)
     filter (where last_error is not null))[1]                               as letzter_fehler
from property_images
group by status
order by array_position(array['pending', 'processing', 'failed', 'done'], status);
comment on view reports.bild_warteschlange is 'Importer · Bild-Warteschlange';

-- Importer · Warnungen der letzten 24 Stunden
-- Unbekannte Objektarten oder Lagen in den Quelldaten – meist neue Werte in FileMaker, die der Import noch nicht kennt.
create or replace view reports.warnungen_24h as
select
  w.warnung,
  count(*)                                                                as anzahl_laeufe,
  to_char(max(r.started_at) at time zone 'Europe/Berlin', 'DD.MM. HH24:MI') as zuletzt
from sync_runs r
cross join lateral jsonb_array_elements_text(coalesce(r.stats->'warnings', '[]')) as w(warnung)
where r.mode = 'sync' and r.started_at > now() - interval '24 hours'
group by w.warnung
order by max(r.started_at) desc;
comment on view reports.warnungen_24h is 'Importer · Warnungen der letzten 24 Stunden';

-- Bestand · Kennzahlen
create or replace view reports.bestand_kennzahlen as
select
  count(*) filter (where status = 'published' and archived_at is null)                          as aktiv,
  count(*) filter (where status = 'published' and archived_at is null
                     and created_at > now() - interval '7 days')                                 as neu_7_tage,
  count(*) filter (where archived_at > now() - interval '7 days')                                as archiviert_7_tage,
  count(*) filter (where status = 'published' and archived_at is null and commission_free)       as provisionsfrei
from properties;
comment on view reports.bestand_kennzahlen is 'Bestand · Kennzahlen';

-- Bestand · Objektart × Lage (aktive Objekte)
create or replace view reports.bestand_objektart_lage as
select
  b.market_area                                                    as lage,
  count(*) filter (where p.category = 'buero-praxis')              as buero_praxis,
  count(*) filter (where p.category = 'laden-gastro')              as laden,
  count(*) filter (where p.category = 'lager-logistik')            as halle_lager,
  count(*)                                                         as gesamt
from properties p
join buildings b on b.id = p.building_id
where p.status = 'published' and p.archived_at is null
group by b.market_area
order by gesamt desc;
comment on view reports.bestand_objektart_lage is 'Bestand · Objektart × Lage (aktive Objekte)';

-- Bestand · Miete €/m² je Lage (aktive Objekte, Mietflächen mit Quadratmeterpreis)
create or replace view reports.miete_je_lage as
select
  b.market_area                                  as lage,
  count(*)                                       as mietflaechen,
  round(avg(u.rent_per_sqm), 2)                  as miete_avg,
  round(percentile_cont(0.5) within group (order by u.rent_per_sqm)::numeric, 2) as miete_median,
  min(u.rent_per_sqm)                            as miete_min,
  max(u.rent_per_sqm)                            as miete_max
from rental_units u
join properties p on p.id = u.property_id
join buildings b on b.id = p.building_id
where p.status = 'published' and p.archived_at is null and u.rent_per_sqm > 0
group by b.market_area
order by miete_avg desc;
comment on view reports.miete_je_lage is 'Bestand · Miete €/m² je Lage (aktive Objekte, Mietflächen mit Quadratmeterpreis)';

-- Bestand · Flächenverteilung (größte Mietfläche je aktivem Objekt, Stufen wie auf „Für Vermieter“)
create or replace view reports.flaechenverteilung as
with flaeche as (
  select p.id, max(u.area_sqm) as qm
  from properties p
  join rental_units u on u.property_id = p.id
  where p.status = 'published' and p.archived_at is null
  group by p.id
)
select stufe, count(*) as objekte
from (
  select case
           when qm < 300  then '1 · bis 300 m²'
           when qm < 500  then '2 · 300–500 m²'
           when qm < 1000 then '3 · 500–1.000 m²'
           else                '4 · ab 1.000 m²'
         end as stufe
  from flaeche
) s
group by stufe
order by stufe;
comment on view reports.flaechenverteilung is 'Bestand · Flächenverteilung (größte Mietfläche je aktivem Objekt, Stufen wie auf „Für Vermieter“)';

-- Qualität · Score der aktiven Objekte
-- Anteil der Objekte, die das jeweilige Kriterium erfüllen; „gesamt“ = Durchschnitt aller Kriterien.
create or replace view reports.qualitaets_score as
with o as (
  select
    exists (select 1 from property_images i where i.property_id = p.id and i.status = 'done')        as hat_bild,
    b.location is not null                                                                           as hat_koordinaten,
    exists (select 1 from rental_units u where u.property_id = p.id
            and (u.rent_per_sqm is not null or u.rent_total_monthly is not null))                     as hat_preis,
    length(p.description) > 200                                                                      as hat_beschreibung,
    p.contact_id is not null                                                                         as hat_ansprechpartner,
    p.expose_pdf_url is not null                                                                     as hat_expose
  from properties p
  join buildings b on b.id = p.building_id
  where p.status = 'published' and p.archived_at is null
)
select
  count(*)                                                as objekte,
  round(100.0 * avg(hat_bild::int), 1)                    as bild_prozent,
  round(100.0 * avg(hat_koordinaten::int), 1)             as koordinaten_prozent,
  round(100.0 * avg(hat_preis::int), 1)                   as preis_prozent,
  round(100.0 * avg(hat_beschreibung::int), 1)            as beschreibung_prozent,
  round(100.0 * avg(hat_ansprechpartner::int), 1)         as ansprechpartner_prozent,
  round(100.0 * avg(hat_expose::int), 1)                  as expose_prozent,
  round(100.0 * avg((hat_bild::int + hat_koordinaten::int + hat_preis::int + hat_beschreibung::int
                     + hat_ansprechpartner::int + hat_expose::int) / 6.0), 1) as gesamt_prozent
from o;
comment on view reports.qualitaets_score is 'Qualität · Score der aktiven Objekte';

-- Qualität · Problemliste – aktive Objekte mit fehlenden Angaben, zum Nachpflegen in FileMaker
create or replace view reports.problemliste as
with o as (
  select
    p.reference_number,
    p.title,
    array_remove(array[
      case when not exists (select 1 from property_images i where i.property_id = p.id and i.status = 'done')
           then 'kein Bild' end,
      case when b.location is null then 'keine Koordinaten' end,
      case when not exists (select 1 from rental_units u where u.property_id = p.id
                            and (u.rent_per_sqm is not null or u.rent_total_monthly is not null))
           then 'kein Preis' end,
      case when length(p.description) <= 200 then 'Beschreibung kurz' end,
      case when p.contact_id is null then 'kein Ansprechpartner' end,
      case when p.expose_pdf_url is null then 'kein Exposé' end
    ], null) as fehlt
  from properties p
  join buildings b on b.id = p.building_id
  where p.status = 'published' and p.archived_at is null
)
select reference_number as objektnummer, title as titel, array_to_string(fehlt, ', ') as fehlt, cardinality(fehlt) as anzahl
from o
where cardinality(fehlt) > 0
order by anzahl desc, reference_number;
comment on view reports.problemliste is 'Qualität · Problemliste – aktive Objekte mit fehlenden Angaben, zum Nachpflegen in FileMaker';

-- Qualität · Ausreißer – unplausible Werte, meist Tippfehler in den Quelldaten
create or replace view reports.ausreisser as
select p.reference_number as objektnummer, p.title as titel, u.label as mietflaeche,
       u.area_sqm as qm, u.rent_per_sqm as miete_qm, u.rent_total_monthly as miete_monat,
       case
         when u.rent_per_sqm is not null and u.rent_per_sqm < 5   then 'Miete unter 5 €/m²'
         when u.rent_per_sqm is not null and u.rent_per_sqm > 60  then 'Miete über 60 €/m²'
         when u.area_sqm > 20000                                  then 'Fläche über 20.000 m²'
         when u.area_sqm < 10                                     then 'Fläche unter 10 m²'
       end as auffaelligkeit
from rental_units u
join properties p on p.id = u.property_id
where p.status = 'published' and p.archived_at is null
  and (   (u.rent_per_sqm is not null and (u.rent_per_sqm < 5 or u.rent_per_sqm > 60))
       or u.area_sqm > 20000 or u.area_sqm < 10)
order by auffaelligkeit, p.reference_number;
comment on view reports.ausreisser is 'Qualität · Ausreißer – unplausible Werte, meist Tippfehler in den Quelldaten';

-- Qualität · Frische – wann wurden die Details der aktiven Objekte zuletzt geprüft?
-- Der Import prüft reihum 60 Objekte je Lauf (alle 10 Min.) → jedes Objekt etwa alle 3–4 Stunden.
-- Objekte in „älter als 24 h“ deuten auf einen hängenden Import oder dauerhaft fehlschlagende Abrufe hin.
create or replace view reports.frische as
select
  case
    when synced_at is null                         then '5 · nie'
    when synced_at > now() - interval '6 hours'    then '1 · unter 6 h'
    when synced_at > now() - interval '24 hours'   then '2 · 6–24 h'
    when synced_at > now() - interval '7 days'     then '3 · 1–7 Tage'
    else                                                '4 · älter als 7 Tage'
  end      as zuletzt_geprueft,
  count(*) as objekte
from properties
where status = 'published' and archived_at is null
group by 1
order by 1;
comment on view reports.frische is 'Qualität · Frische – wann wurden die Details der aktiven Objekte zuletzt geprüft?';

revoke all on all tables in schema reports from public, anon, authenticated;
