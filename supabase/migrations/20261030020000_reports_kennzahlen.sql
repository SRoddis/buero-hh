-- Report: kompakte Kennzahlen-Liste (eine Zeile je Kennzahl, mit Ampel)
-- Supabase-Report-Blöcke zeigen SQL nur als Tabelle oder Balkendiagramm – diese View liefert daher „Kennzahl · Wert · Ampel“,
-- damit ein Block wie eine KPI-Übersicht liest. Je Bereich ein Block: … where bereich = 'Import' usw.
-- Ampel: ✅ in Ordnung · ⚠️ beobachten · ❌ handeln. Schwellwerte siehe die einzelnen case-Ausdrücke.

create view reports.kennzahlen as
with
  laeufe as (
    select * from sync_runs where mode = 'sync' and status <> 'running' order by started_at desc limit 10
  ),
  -- letzter abgeschlossener Lauf (ein gerade laufender hätte noch keine Zahlen; hängende bricht der Import nach 15 Min. ab)
  letzter as (
    select * from sync_runs where mode = 'sync' and status <> 'running' order by started_at desc limit 1
  ),
  aktiv as (
    select p.*, b.location
    from properties p join buildings b on b.id = p.building_id
    where p.status = 'published' and p.archived_at is null
  ),
  qualitaet as (
    select
      count(*) as objekte,
      count(*) filter (where
        not exists (select 1 from property_images i where i.property_id = a.id and i.status = 'done')
        or a.location is null
        or not exists (select 1 from rental_units u where u.property_id = a.id
                       and (u.rent_per_sqm is not null or u.rent_total_monthly is not null))
        or length(a.description) <= 200
        or a.expose_pdf_url is null) as mit_problemen,
      count(*) filter (where a.synced_at is null or a.synced_at < now() - interval '24 hours') as veraltet
    from aktiv a
  ),
  werte as (
    select
      (select round(extract(epoch from now() - started_at) / 60) from letzter)                        as minuten_seit_lauf,
      (select status from letzter)                                                                    as status_letzter,
      (select (stats->>'failed')::int from letzter)                                                   as fehler_letzter,
      (select round(100.0 * count(*) filter (where status = 'succeeded') / nullif(count(*), 0)) from laeufe) as erfolg_10,
      (select round(avg(extract(epoch from finished_at - started_at))) from laeufe)                   as dauer_10,
      (select count(*) from property_images where status in ('pending', 'processing'))               as bilder_offen,
      (select count(*) from property_images where status = 'failed')                                 as bilder_fehler,
      (select count(*) from aktiv)                                                                    as aktiv,
      (select count(*) from aktiv where created_at > now() - interval '7 days')                       as neu_7,
      (select count(*) from properties where archived_at > now() - interval '7 days')                 as archiviert_7,
      (select count(*) from rental_units u join aktiv a on a.id = u.property_id
        where (u.rent_per_sqm is not null and (u.rent_per_sqm < 5 or u.rent_per_sqm > 60))
           or u.area_sqm > 20000 or u.area_sqm < 10)                                                  as ausreisser,
      (select coalesce(sum(jsonb_array_length(coalesce(stats->'warnings', '[]'))), 0) from sync_runs
        where mode = 'sync' and started_at > now() - interval '24 hours')                            as warnungen_24h,
      q.objekte, q.mit_problemen, q.veraltet
    from qualitaet q
  )
select bereich, kennzahl, wert, ampel
from werte w
cross join lateral (values
  (1,  'Import',   'Letzter Lauf vor',           w.minuten_seit_lauf || ' Min.',
       case when w.minuten_seit_lauf <= 20 then '✅' when w.minuten_seit_lauf <= 60 then '⚠️' else '❌' end),
  (2,  'Import',   'Status letzter Lauf',        case w.status_letzter when 'succeeded' then 'erfolgreich' else 'fehlgeschlagen' end,
       case w.status_letzter when 'failed' then '❌' else '✅' end),
  (3,  'Import',   'Erfolgsquote letzte 10',     w.erfolg_10 || ' %',
       case when w.erfolg_10 >= 90 then '✅' when w.erfolg_10 >= 70 then '⚠️' else '❌' end),
  (4,  'Import',   'Ø Dauer letzte 10',          w.dauer_10 || ' s',
       case when w.dauer_10 <= 300 then '✅' else '⚠️' end),
  (5,  'Import',   'Fehler im letzten Lauf',     w.fehler_letzter::text,
       case when coalesce(w.fehler_letzter, 0) <= 10 then '✅' else '⚠️' end),
  (6,  'Import',   'Warnungen (24 h)',           w.warnungen_24h::text,
       case when w.warnungen_24h = 0 then '✅' else '⚠️' end),
  (7,  'Import',   'Bilder in Warteschlange',    w.bilder_offen::text,
       case when w.bilder_offen <= 100 then '✅' else '⚠️' end),
  (8,  'Import',   'Bilder fehlgeschlagen',      w.bilder_fehler::text,
       case when w.bilder_fehler = 0 then '✅' else '⚠️' end),
  (9,  'Bestand',  'Aktive Objekte',             w.aktiv::text,                                  ''),
  (10, 'Bestand',  'Neu (7 Tage)',               w.neu_7::text,                                  ''),
  (11, 'Bestand',  'Archiviert (7 Tage)',        w.archiviert_7::text,                           ''),
  (12, 'Qualität', 'Qualität (vollständig)',
       replace(round(100.0 * (w.objekte - w.mit_problemen) / nullif(w.objekte, 0), 1)::text, '.', ',') || ' %',
       case when w.mit_problemen <= 0.02 * w.objekte then '✅' else '⚠️' end),
  (13, 'Qualität', 'Objekte mit fehlenden Angaben', w.mit_problemen::text,
       case when w.mit_problemen = 0 then '✅' else '⚠️' end),
  (14, 'Qualität', 'Unplausible Werte',          w.ausreisser::text,
       case when w.ausreisser = 0 then '✅' else '⚠️' end),
  (15, 'Qualität', 'Länger als 24 h ungeprüft',  w.veraltet::text,
       case when w.veraltet = 0 then '✅' else '⚠️' end)
) as k(nr, bereich, kennzahl, wert, ampel)
order by k.nr;

comment on view reports.kennzahlen is 'Kennzahlen · Import, Bestand und Qualität als Liste mit Ampel';

revoke all on all tables in schema reports from public, anon, authenticated;
