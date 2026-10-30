-- Report: „Ansprechpartner“ aus Score und Problemliste entfernen.
-- Die Objekt-API von buerohamburg.de liefert keinen Ansprechpartner (contact_id ist bei allen Objekten leer) – das
-- Kriterium drückte den Score und setzte jedes Objekt auf die Problemliste. Wieder aufnehmen, sobald der Import
-- Ansprechpartner liefert (z. B. direkter FileMaker-Import).
-- Spalten ändern sich → drop + create statt create or replace.

drop view if exists reports.qualitaets_score;
drop view if exists reports.problemliste;

create view reports.qualitaets_score as
with o as (
  select
    exists (select 1 from property_images i where i.property_id = p.id and i.status = 'done')        as hat_bild,
    b.location is not null                                                                           as hat_koordinaten,
    exists (select 1 from rental_units u where u.property_id = p.id
            and (u.rent_per_sqm is not null or u.rent_total_monthly is not null))                     as hat_preis,
    length(p.description) > 200                                                                      as hat_beschreibung,
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
  round(100.0 * avg(hat_expose::int), 1)                  as expose_prozent,
  round(100.0 * avg((hat_bild::int + hat_koordinaten::int + hat_preis::int + hat_beschreibung::int
                     + hat_expose::int) / 5.0), 1) as gesamt_prozent
from o;
comment on view reports.qualitaets_score is 'Qualität · Score der aktiven Objekte';

create view reports.problemliste as
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

revoke all on all tables in schema reports from public, anon, authenticated;
