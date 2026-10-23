-- Automatisch generiert durch scripts/generate-seed.ts – nicht manuell bearbeiten.
begin;

insert into districts (slug, name, borough, center_lng, center_lat, location_class) values
  ('altstadt', 'Altstadt', 'Hamburg-Mitte', 10.0006, 53.5503, 'city'),
  ('neustadt', 'Neustadt', 'Hamburg-Mitte', 9.9837, 53.5517, 'city'),
  ('hafencity', 'HafenCity', 'Hamburg-Mitte', 9.9965, 53.5418, 'city'),
  ('st-georg', 'St. Georg', 'Hamburg-Mitte', 10.0128, 53.5556, 'city'),
  ('st-pauli', 'St. Pauli', 'Hamburg-Mitte', 9.964, 53.556, 'citynah'),
  ('hammerbrook', 'Hammerbrook', 'Hamburg-Mitte', 10.03, 53.5475, 'citynah'),
  ('hamm', 'Hamm', 'Hamburg-Mitte', 10.055, 53.5545, 'peripherie'),
  ('rothenburgsort', 'Rothenburgsort', 'Hamburg-Mitte', 10.042, 53.537, 'peripherie'),
  ('billbrook', 'Billbrook', 'Hamburg-Mitte', 10.089, 53.531, 'peripherie'),
  ('altona-altstadt', 'Altona-Altstadt', 'Altona', 9.937, 53.5495, 'citynah'),
  ('ottensen', 'Ottensen', 'Altona', 9.926, 53.554, 'citynah'),
  ('bahrenfeld', 'Bahrenfeld', 'Altona', 9.905, 53.565, 'buerozentrum'),
  ('othmarschen', 'Othmarschen', 'Altona', 9.896, 53.554, 'peripherie'),
  ('eimsbuettel', 'Eimsbüttel', 'Eimsbüttel', 9.955, 53.5745, 'citynah'),
  ('rotherbaum', 'Rotherbaum', 'Eimsbüttel', 9.988, 53.568, 'citynah'),
  ('harvestehude', 'Harvestehude', 'Eimsbüttel', 9.985, 53.58, 'citynah'),
  ('stellingen', 'Stellingen', 'Eimsbüttel', 9.93, 53.59, 'peripherie'),
  ('lokstedt', 'Lokstedt', 'Eimsbüttel', 9.95, 53.6, 'peripherie'),
  ('niendorf', 'Niendorf', 'Eimsbüttel', 9.95, 53.617, 'peripherie'),
  ('eppendorf', 'Eppendorf', 'Hamburg-Nord', 9.983, 53.592, 'citynah'),
  ('winterhude', 'Winterhude', 'Hamburg-Nord', 10.005, 53.59, 'citynah'),
  ('city-nord', 'City Nord', 'Hamburg-Nord', 10.023, 53.604, 'buerozentrum'),
  ('uhlenhorst', 'Uhlenhorst', 'Hamburg-Nord', 10.019, 53.57, 'citynah'),
  ('barmbek', 'Barmbek', 'Hamburg-Nord', 10.043, 53.585, 'peripherie'),
  ('alsterdorf', 'Alsterdorf', 'Hamburg-Nord', 10.008, 53.611, 'peripherie'),
  ('wandsbek', 'Wandsbek', 'Wandsbek', 10.076, 53.572, 'peripherie'),
  ('harburg', 'Harburg', 'Harburg', 9.984, 53.46, 'peripherie'),
  ('wilhelmsburg', 'Wilhelmsburg', 'Hamburg-Mitte', 10.009, 53.493, 'peripherie'),
  ('bergedorf', 'Bergedorf', 'Bergedorf', 10.214, 53.489, 'peripherie')
on conflict (slug) do nothing;

insert into contacts (id, name, role, email, phone) values
  (md5('contact-c-1')::uuid, 'Katrin Albers', 'Büroflächenvermietung City & HafenCity', 'k.albers@buerohamburg.de', '+49 40 300 865 10'),
  (md5('contact-c-2')::uuid, 'Jonas Petersen', 'Büroflächenvermietung Nord & West', 'j.petersen@buerohamburg.de', '+49 40 300 865 20'),
  (md5('contact-c-3')::uuid, 'Mira Hansen', 'Einzelhandel & Gastronomie', 'm.hansen@buerohamburg.de', '+49 40 300 865 30'),
  (md5('contact-c-4')::uuid, 'Tobias Krüger', 'Praxis-, Lager- & Logistikflächen', 't.krueger@buerohamburg.de', '+49 40 300 865 40')
on conflict (id) do nothing;

-- Moderne Bürofläche mit Elbblick
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1001')::uuid, 'Sandtorkai-Haus', 'Am Sandtorkai', '54', '20457', 'hafencity', extensions.st_setsrid(extensions.st_makepoint(9.993249, 53.544168), 4326)::extensions.geography, 'city', 2009, null, 7, array['aufzug', 'wasserblick', 'glasfaser', 'barrierefrei']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1001')::uuid, md5('building-bh-1001')::uuid, md5('contact-c-1')::uuid, 'moderne-bueroflaeche-mit-elbblick-bh-1001', 'BH-1001', 'Moderne Bürofläche mit Elbblick', 'Lichtdurchflutete Etage mit bodentiefen Fenstern und direktem Blick auf die Elbe.', 'Lichtdurchflutete Etage mit bodentiefen Fenstern und direktem Blick auf die Elbe. Die Bürofläche umfasst 520 m² im 4. OG.

Das Gebäude aus dem Jahr 2009 verfügt über 7 Geschosse.

Die HafenCity ist Europas größtes innerstädtisches Stadtentwicklungsprojekt und verbindet moderne Architektur, Wasserlage und eine exzellente Anbindung über die U4.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', true, array['klimatisiert']::text[], '2026-10-18T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1001-u1')::uuid, md5('property-bh-1001')::uuid, 'Gesamtfläche', 4, 520, 24.5, 4.5, null, 12, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1001-i1')::uuid, md5('property-bh-1001')::uuid, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=75', 'Moderne Bürofläche mit Elbblick – Bild 1', 0),
  (md5('image-bh-1001-i2')::uuid, md5('property-bh-1001')::uuid, 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=75', 'Moderne Bürofläche mit Elbblick – Bild 2', 1),
  (md5('image-bh-1001-i3')::uuid, md5('property-bh-1001')::uuid, 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?auto=format&fit=crop&w=1200&q=75', 'Moderne Bürofläche mit Elbblick – Bild 3', 2),
  (md5('image-bh-1001-i4')::uuid, md5('property-bh-1001')::uuid, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&w=1200&q=75', 'Moderne Bürofläche mit Elbblick – Bild 4', 3),
  (md5('image-bh-1001-i5')::uuid, md5('property-bh-1001')::uuid, 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=1200&q=75', 'Moderne Bürofläche mit Elbblick – Bild 5', 4);

-- Hochwertige Büroflächen im Bahrenfeld Office
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1002')::uuid, 'Bahrenfeld Office', 'Notkestraße', '9', '22607', 'bahrenfeld', extensions.st_setsrid(extensions.st_makepoint(9.903686, 53.565366), 4326)::extensions.geography, 'buerozentrum', 2025, null, 6, array['neubau', 'stellplaetze', 'aufzug', 'e-ladestation', 'kantine']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1002')::uuid, md5('building-bh-1002')::uuid, md5('contact-c-2')::uuid, 'hochwertige-bueroflaechen-im-bahrenfeld-office-bh-1002', 'BH-1002', 'Hochwertige Büroflächen im Bahrenfeld Office', 'Flexibel teilbare Neubauflächen nach ESG-Standard im Science-City-Umfeld.', 'Flexibel teilbare Neubauflächen nach ESG-Standard im Science-City-Umfeld. Insgesamt stehen 1.250 m² auf 3 Einheiten zur Verfügung (2. OG: 310 m², 3. OG: 470 m², 4. OG: 470 m²).

Das Gebäude aus dem Jahr 2025 verfügt über 6 Geschosse.

Bahrenfeld entwickelt sich mit der Science City zu einem der spannendsten Wissenschafts- und Bürostandorte Hamburgs.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, array['klimatisiert']::text[], '2026-10-19T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1002-u1')::uuid, md5('property-bh-1002')::uuid, 'Einheit A', 2, 310, null, null, '2027-02-01', null, true, 0),
  (md5('unit-bh-1002-u2')::uuid, md5('property-bh-1002')::uuid, 'Einheit B', 3, 470, null, null, '2027-02-01', null, true, 1),
  (md5('unit-bh-1002-u3')::uuid, md5('property-bh-1002')::uuid, 'Einheit C', 4, 470, null, null, null, null, true, 2);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1002-i1')::uuid, md5('property-bh-1002')::uuid, 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=75', 'Hochwertige Büroflächen im Bahrenfeld Office – Bild 1', 0),
  (md5('image-bh-1002-i2')::uuid, md5('property-bh-1002')::uuid, 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=75', 'Hochwertige Büroflächen im Bahrenfeld Office – Bild 2', 1),
  (md5('image-bh-1002-i3')::uuid, md5('property-bh-1002')::uuid, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=75', 'Hochwertige Büroflächen im Bahrenfeld Office – Bild 3', 2),
  (md5('image-bh-1002-i4')::uuid, md5('property-bh-1002')::uuid, 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=75', 'Hochwertige Büroflächen im Bahrenfeld Office – Bild 4', 3),
  (md5('image-bh-1002-i5')::uuid, md5('property-bh-1002')::uuid, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=75', 'Hochwertige Büroflächen im Bahrenfeld Office – Bild 5', 4);

-- Repräsentative Praxisfläche in Winterhude
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1003')::uuid, null, 'Mühlenkamp', '31', '22303', 'winterhude', extensions.st_setsrid(extensions.st_makepoint(10.001459, 53.589096), 4326)::extensions.geography, 'citynah', 1998, 2021, 5, array['barrierefrei', 'aufzug', 'oepnv-nah']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1003')::uuid, md5('building-bh-1003')::uuid, md5('contact-c-4')::uuid, 'repraesentative-praxisflaeche-in-winterhude-bh-1003', 'BH-1003', 'Repräsentative Praxisfläche in Winterhude', 'Gepflegte Praxisräume mit Empfangsbereich in beliebter Wohn- und Geschäftslage.', 'Gepflegte Praxisräume mit Empfangsbereich in beliebter Wohn- und Geschäftslage. Die Praxisfläche umfasst 185 m² im 1. OG.

Das 1998 errichtete Gebäude wurde 2021 umfassend modernisiert und verfügt über 5 Geschosse.

Winterhude überzeugt mit Stadtpark, Kanälen und einer hohen Aufenthaltsqualität – beliebt bei Mitarbeitenden wie Kundschaft.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'praxis', 'published', false, '{}'::text[], '2026-10-14T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1003-u1')::uuid, md5('property-bh-1003')::uuid, 'Gesamtfläche', 1, 185, 19, 3.5, null, 6, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1003-i1')::uuid, md5('property-bh-1003')::uuid, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=75', 'Repräsentative Praxisfläche in Winterhude – Bild 1', 0),
  (md5('image-bh-1003-i2')::uuid, md5('property-bh-1003')::uuid, 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=75', 'Repräsentative Praxisfläche in Winterhude – Bild 2', 1),
  (md5('image-bh-1003-i3')::uuid, md5('property-bh-1003')::uuid, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=75', 'Repräsentative Praxisfläche in Winterhude – Bild 3', 2),
  (md5('image-bh-1003-i4')::uuid, md5('property-bh-1003')::uuid, 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=1200&q=75', 'Repräsentative Praxisfläche in Winterhude – Bild 4', 3),
  (md5('image-bh-1003-i5')::uuid, md5('property-bh-1003')::uuid, 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=75', 'Repräsentative Praxisfläche in Winterhude – Bild 5', 4);

-- Attraktive Ladenfläche in Bestlage
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1004')::uuid, null, 'Osterstraße', '120', '20255', 'eimsbuettel', extensions.st_setsrid(extensions.st_makepoint(9.958090, 53.574625), 4326)::extensions.geography, 'citynah', 1905, 2016, 5, array['oepnv-nah']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1004')::uuid, md5('building-bh-1004')::uuid, md5('contact-c-3')::uuid, 'attraktive-ladenflaeche-in-bestlage-bh-1004', 'BH-1004', 'Attraktive Ladenfläche in Bestlage', 'Ladenlokal mit großer Schaufensterfront, auch für Gastronomie geeignet.', 'Ladenlokal mit großer Schaufensterfront, auch für Gastronomie geeignet. Die Ladenfläche umfasst 95 m² im EG.

Das 1905 errichtete Gebäude wurde 2016 umfassend modernisiert und verfügt über 5 Geschosse.

Eimsbüttel im Bezirk Eimsbüttel bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'laden-gastro', 'laden', 'published', true, array['schaufenster', 'abluft']::text[], '2026-10-16T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1004-u1')::uuid, md5('property-bh-1004')::uuid, 'Gesamtfläche', 0, 95, 28, 5, null, 1, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1004-i1')::uuid, md5('property-bh-1004')::uuid, 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=1200&q=75', 'Attraktive Ladenfläche in Bestlage – Bild 1', 0),
  (md5('image-bh-1004-i2')::uuid, md5('property-bh-1004')::uuid, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=75', 'Attraktive Ladenfläche in Bestlage – Bild 2', 1),
  (md5('image-bh-1004-i3')::uuid, md5('property-bh-1004')::uuid, 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=75', 'Attraktive Ladenfläche in Bestlage – Bild 3', 2),
  (md5('image-bh-1004-i4')::uuid, md5('property-bh-1004')::uuid, 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=1200&q=75', 'Attraktive Ladenfläche in Bestlage – Bild 4', 3);

-- Büroloft im Kontorhausviertel
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1005')::uuid, 'Kontorhaus am Burchardplatz', 'Burchardstraße', '14', '20095', 'altstadt', extensions.st_setsrid(extensions.st_makepoint(9.997466, 53.551737), 4326)::extensions.geography, 'city', 1926, 2018, 8, array['denkmalschutz', 'aufzug', 'glasfaser', 'oepnv-nah']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1005')::uuid, md5('building-bh-1005')::uuid, md5('contact-c-1')::uuid, 'bueroloft-im-kontorhausviertel-bh-1005', 'BH-1005', 'Büroloft im Kontorhausviertel', 'Historisches Kontorhaus mit hohen Decken, modern saniert – UNESCO-Welterbe.', 'Historisches Kontorhaus mit hohen Decken, modern saniert – UNESCO-Welterbe. Die Bürofläche umfasst 640 m² im 5. OG.

Das 1926 errichtete Gebäude wurde 2018 umfassend modernisiert und verfügt über 8 Geschosse.

Die Altstadt bildet das wirtschaftliche Herz Hamburgs – mit Rathaus, Binnenalster, Kontorhausviertel und einer hervorragenden ÖPNV-Anbindung.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, array['teekueche']::text[], '2026-10-11T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1005-u1')::uuid, md5('property-bh-1005')::uuid, 'Gesamtfläche', 5, 640, 27.5, 5, '2027-01-01', 14, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1005-i1')::uuid, md5('property-bh-1005')::uuid, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&w=1200&q=75', 'Büroloft im Kontorhausviertel – Bild 1', 0),
  (md5('image-bh-1005-i2')::uuid, md5('property-bh-1005')::uuid, 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=1200&q=75', 'Büroloft im Kontorhausviertel – Bild 2', 1),
  (md5('image-bh-1005-i3')::uuid, md5('property-bh-1005')::uuid, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=75', 'Büroloft im Kontorhausviertel – Bild 3', 2),
  (md5('image-bh-1005-i4')::uuid, md5('property-bh-1005')::uuid, 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1200&q=75', 'Büroloft im Kontorhausviertel – Bild 4', 3),
  (md5('image-bh-1005-i5')::uuid, md5('property-bh-1005')::uuid, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=75', 'Büroloft im Kontorhausviertel – Bild 5', 4);

-- Exklusive Büroetage am Neuen Wall
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1006')::uuid, null, 'Neuer Wall', '50', '20354', 'neustadt', extensions.st_setsrid(extensions.st_makepoint(9.983606, 53.553658), 4326)::extensions.geography, 'city', 1912, 2020, 6, array['aufzug', 'empfang', 'oepnv-nah']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1006')::uuid, md5('building-bh-1006')::uuid, md5('contact-c-1')::uuid, 'exklusive-bueroetage-am-neuen-wall-bh-1006', 'BH-1006', 'Exklusive Büroetage am Neuen Wall', 'Premium-Adresse an Hamburgs Luxusmeile mit Concierge-Service.', 'Premium-Adresse an Hamburgs Luxusmeile mit Concierge-Service. Insgesamt stehen 820 m² auf 2 Einheiten zur Verfügung (3. OG: 410 m², 4. OG: 410 m²).

Das 1912 errichtete Gebäude wurde 2020 umfassend modernisiert und verfügt über 6 Geschosse.

Zwischen Jungfernstieg und Gänsemarkt liegen hier Hamburgs exklusivste Geschäftsadressen, Banken und Kanzleien.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, array['klimatisiert']::text[], '2026-10-08T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1006-u1')::uuid, md5('property-bh-1006')::uuid, 'Einheit A', 3, 410, 32, 6, null, 9, true, 0),
  (md5('unit-bh-1006-u2')::uuid, md5('property-bh-1006')::uuid, 'Einheit B', 4, 410, 32, 6, null, 9, true, 1);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1006-i1')::uuid, md5('property-bh-1006')::uuid, 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=75', 'Exklusive Büroetage am Neuen Wall – Bild 1', 0),
  (md5('image-bh-1006-i2')::uuid, md5('property-bh-1006')::uuid, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=75', 'Exklusive Büroetage am Neuen Wall – Bild 2', 1),
  (md5('image-bh-1006-i3')::uuid, md5('property-bh-1006')::uuid, 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=1200&q=75', 'Exklusive Büroetage am Neuen Wall – Bild 3', 2),
  (md5('image-bh-1006-i4')::uuid, md5('property-bh-1006')::uuid, 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=75', 'Exklusive Büroetage am Neuen Wall – Bild 4', 3),
  (md5('image-bh-1006-i5')::uuid, md5('property-bh-1006')::uuid, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&w=1200&q=75', 'Exklusive Büroetage am Neuen Wall – Bild 5', 4);

-- Flexible Büroflächen am Hauptbahnhof
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1007')::uuid, null, 'Adenauerallee', '10', '20097', 'st-georg', extensions.st_setsrid(extensions.st_makepoint(10.012412, 53.556621), 4326)::extensions.geography, 'city', 1972, 2019, 8, array['aufzug', 'oepnv-nah', 'glasfaser']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1007')::uuid, md5('building-bh-1007')::uuid, md5('contact-c-1')::uuid, 'flexible-bueroflaechen-am-hauptbahnhof-bh-1007', 'BH-1007', 'Flexible Büroflächen am Hauptbahnhof', 'Bestens angebunden: wenige Gehminuten zum Hauptbahnhof und zur Alster.', 'Bestens angebunden: wenige Gehminuten zum Hauptbahnhof und zur Alster. Insgesamt stehen 940 m² auf 3 Einheiten zur Verfügung (2. OG: 230 m², 3. OG: 230 m², 6. OG: 480 m²).

Das 1972 errichtete Gebäude wurde 2019 umfassend modernisiert und verfügt über 8 Geschosse.

St. Georg punktet mit der Nähe zum Hauptbahnhof und zur Außenalster sowie einer lebendigen Gastronomieszene.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', true, '{}'::text[], '2026-10-05T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1007-u1')::uuid, md5('property-bh-1007')::uuid, 'Einheit A', 2, 230, 18.5, 3.5, null, 7, true, 0),
  (md5('unit-bh-1007-u2')::uuid, md5('property-bh-1007')::uuid, 'Einheit B', 3, 230, 18.5, 3.5, null, 7, true, 1),
  (md5('unit-bh-1007-u3')::uuid, md5('property-bh-1007')::uuid, 'Einheit C', 6, 480, 19.5, 3.5, '2027-04-01', null, false, 2);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1007-i1')::uuid, md5('property-bh-1007')::uuid, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=75', 'Flexible Büroflächen am Hauptbahnhof – Bild 1', 0),
  (md5('image-bh-1007-i2')::uuid, md5('property-bh-1007')::uuid, 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=75', 'Flexible Büroflächen am Hauptbahnhof – Bild 2', 1),
  (md5('image-bh-1007-i3')::uuid, md5('property-bh-1007')::uuid, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=75', 'Flexible Büroflächen am Hauptbahnhof – Bild 3', 2),
  (md5('image-bh-1007-i4')::uuid, md5('property-bh-1007')::uuid, 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=1200&q=75', 'Flexible Büroflächen am Hauptbahnhof – Bild 4', 3),
  (md5('image-bh-1007-i5')::uuid, md5('property-bh-1007')::uuid, 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=75', 'Flexible Büroflächen am Hauptbahnhof – Bild 5', 4);

-- Arztpraxis an der Langen Reihe
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1008')::uuid, null, 'Lange Reihe', '29', '20099', 'st-georg', extensions.st_setsrid(extensions.st_makepoint(10.008863, 53.555527), 4326)::extensions.geography, 'city', 1890, 2012, 5, array['aufzug', 'oepnv-nah']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1008')::uuid, md5('building-bh-1008')::uuid, md5('contact-c-4')::uuid, 'arztpraxis-an-der-langen-reihe-bh-1008', 'BH-1008', 'Arztpraxis an der Langen Reihe', 'Eingeführter Praxisstandort mit hoher Laufkundschaft im Szeneviertel.', 'Eingeführter Praxisstandort mit hoher Laufkundschaft im Szeneviertel. Die Praxisfläche umfasst 140 m² im 1. OG.

Das 1890 errichtete Gebäude wurde 2012 umfassend modernisiert und verfügt über 5 Geschosse.

St. Georg punktet mit der Nähe zum Hauptbahnhof und zur Außenalster sowie einer lebendigen Gastronomieszene.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'praxis', 'published', false, '{}'::text[], '2026-09-30T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1008-u1')::uuid, md5('property-bh-1008')::uuid, 'Gesamtfläche', 1, 140, 17.5, 3, null, 5, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1008-i1')::uuid, md5('property-bh-1008')::uuid, 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=75', 'Arztpraxis an der Langen Reihe – Bild 1', 0),
  (md5('image-bh-1008-i2')::uuid, md5('property-bh-1008')::uuid, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=75', 'Arztpraxis an der Langen Reihe – Bild 2', 1),
  (md5('image-bh-1008-i3')::uuid, md5('property-bh-1008')::uuid, 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&w=1200&q=75', 'Arztpraxis an der Langen Reihe – Bild 3', 2),
  (md5('image-bh-1008-i4')::uuid, md5('property-bh-1008')::uuid, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=75', 'Arztpraxis an der Langen Reihe – Bild 4', 3),
  (md5('image-bh-1008-i5')::uuid, md5('property-bh-1008')::uuid, 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=1200&q=75', 'Arztpraxis an der Langen Reihe – Bild 5', 4);

-- Kreativfläche mit Dachterrasse in St. Pauli
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1009')::uuid, null, 'Budapester Straße', '38', '20359', 'st-pauli', extensions.st_setsrid(extensions.st_makepoint(9.960272, 53.556866), 4326)::extensions.geography, 'citynah', 1958, 2022, 4, array['dachterrasse', 'glasfaser']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1009')::uuid, md5('building-bh-1009')::uuid, md5('contact-c-2')::uuid, 'kreativflaeche-mit-dachterrasse-in-st-pauli-bh-1009', 'BH-1009', 'Kreativfläche mit Dachterrasse in St. Pauli', 'Offene Loftfläche für Agenturen und Start-ups – mit Gemeinschaftsdachterrasse.', 'Offene Loftfläche für Agenturen und Start-ups – mit Gemeinschaftsdachterrasse. Die Bürofläche umfasst 280 m² im 2. OG.

Das 1958 errichtete Gebäude wurde 2022 umfassend modernisiert und verfügt über 4 Geschosse.

St. Pauli im Bezirk Hamburg-Mitte bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', true, array['teekueche']::text[], '2026-10-17T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1009-u1')::uuid, md5('property-bh-1009')::uuid, 'Gesamtfläche', 2, 280, 21, 4, null, null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1009-i1')::uuid, md5('property-bh-1009')::uuid, 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1200&q=75', 'Kreativfläche mit Dachterrasse in St. Pauli – Bild 1', 0),
  (md5('image-bh-1009-i2')::uuid, md5('property-bh-1009')::uuid, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=75', 'Kreativfläche mit Dachterrasse in St. Pauli – Bild 2', 1),
  (md5('image-bh-1009-i3')::uuid, md5('property-bh-1009')::uuid, 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?auto=format&fit=crop&w=1200&q=75', 'Kreativfläche mit Dachterrasse in St. Pauli – Bild 3', 2),
  (md5('image-bh-1009-i4')::uuid, md5('property-bh-1009')::uuid, 'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1200&q=75', 'Kreativfläche mit Dachterrasse in St. Pauli – Bild 4', 3),
  (md5('image-bh-1009-i5')::uuid, md5('property-bh-1009')::uuid, 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=75', 'Kreativfläche mit Dachterrasse in St. Pauli – Bild 5', 4);

-- Effiziente Büroflächen am Heidenkampsweg
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1010')::uuid, null, 'Heidenkampsweg', '58', '20097', 'hammerbrook', extensions.st_setsrid(extensions.st_makepoint(10.031765, 53.547719), 4326)::extensions.geography, 'citynah', 1994, 2017, 9, array['stellplaetze', 'aufzug', 'kantine']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1010')::uuid, md5('building-bh-1010')::uuid, md5('contact-c-2')::uuid, 'effiziente-bueroflaechen-am-heidenkampsweg-bh-1010', 'BH-1010', 'Effiziente Büroflächen am Heidenkampsweg', 'Wirtschaftliche Flächen in der City Süd, ab 250 m² teilbar.', 'Wirtschaftliche Flächen in der City Süd, ab 250 m² teilbar. Insgesamt stehen 2.250 m² auf 3 Einheiten zur Verfügung (3. OG: 750 m², 4. OG: 750 m², 5. OG: 750 m²).

Das 1994 errichtete Gebäude wurde 2017 umfassend modernisiert und verfügt über 9 Geschosse.

Hammerbrook (City Süd) bietet wirtschaftliche Großflächen in Citynähe und entwickelt sich am Wasser stark weiter.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, array['klimatisiert']::text[], '2026-09-25T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1010-u1')::uuid, md5('property-bh-1010')::uuid, 'Einheit A', 3, 750, 16.5, 3, null, null, true, 0),
  (md5('unit-bh-1010-u2')::uuid, md5('property-bh-1010')::uuid, 'Einheit B', 4, 750, 16.5, 3, null, null, true, 1),
  (md5('unit-bh-1010-u3')::uuid, md5('property-bh-1010')::uuid, 'Einheit C', 5, 750, 16.5, 3, '2027-01-01', null, true, 2);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1010-i1')::uuid, md5('property-bh-1010')::uuid, 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=75', 'Effiziente Büroflächen am Heidenkampsweg – Bild 1', 0),
  (md5('image-bh-1010-i2')::uuid, md5('property-bh-1010')::uuid, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&w=1200&q=75', 'Effiziente Büroflächen am Heidenkampsweg – Bild 2', 1),
  (md5('image-bh-1010-i3')::uuid, md5('property-bh-1010')::uuid, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=75', 'Effiziente Büroflächen am Heidenkampsweg – Bild 3', 2),
  (md5('image-bh-1010-i4')::uuid, md5('property-bh-1010')::uuid, 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=1200&q=75', 'Effiziente Büroflächen am Heidenkampsweg – Bild 4', 3),
  (md5('image-bh-1010-i5')::uuid, md5('property-bh-1010')::uuid, 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1200&q=75', 'Effiziente Büroflächen am Heidenkampsweg – Bild 5', 4);

-- Neubau-Büros im Hammerbrooklyn
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1011')::uuid, 'Stadtdeich Campus', 'Stadtdeich', '2', '20097', 'hammerbrook', extensions.st_setsrid(extensions.st_makepoint(10.032675, 53.545033), 4326)::extensions.geography, 'citynah', 2026, null, 10, array['neubau', 'dachterrasse', 'e-ladestation', 'wasserblick']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1011')::uuid, md5('building-bh-1011')::uuid, md5('contact-c-2')::uuid, 'neubau-bueros-im-hammerbrooklyn-bh-1011', 'BH-1011', 'Neubau-Büros im Hammerbrooklyn', 'Smart-Building am Wasser mit nachhaltigem Energiekonzept.', 'Smart-Building am Wasser mit nachhaltigem Energiekonzept. Die Bürofläche umfasst 1.200 m² im 4. OG.

Das Gebäude aus dem Jahr 2026 verfügt über 10 Geschosse.

Hammerbrook (City Süd) bietet wirtschaftliche Großflächen in Citynähe und entwickelt sich am Wasser stark weiter.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, array['klimatisiert']::text[], '2026-10-15T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1011-u1')::uuid, md5('property-bh-1011')::uuid, 'Gesamtfläche', 4, 1200, null, null, '2027-05-01', null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1011-i1')::uuid, md5('property-bh-1011')::uuid, 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=1200&q=75', 'Neubau-Büros im Hammerbrooklyn – Bild 1', 0),
  (md5('image-bh-1011-i2')::uuid, md5('property-bh-1011')::uuid, 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=75', 'Neubau-Büros im Hammerbrooklyn – Bild 2', 1),
  (md5('image-bh-1011-i3')::uuid, md5('property-bh-1011')::uuid, 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=75', 'Neubau-Büros im Hammerbrooklyn – Bild 3', 2),
  (md5('image-bh-1011-i4')::uuid, md5('property-bh-1011')::uuid, 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=75', 'Neubau-Büros im Hammerbrooklyn – Bild 4', 3),
  (md5('image-bh-1011-i5')::uuid, md5('property-bh-1011')::uuid, 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=75', 'Neubau-Büros im Hammerbrooklyn – Bild 5', 4);

-- Lagerfläche mit Büroanteil in Billbrook
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1012')::uuid, null, 'Halskestraße', '22', '22113', 'billbrook', extensions.st_setsrid(extensions.st_makepoint(10.092226, 53.530710), 4326)::extensions.geography, 'peripherie', 1988, 2015, 2, array['rampe', 'stellplaetze']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1012')::uuid, md5('building-bh-1012')::uuid, md5('contact-c-4')::uuid, 'lagerflaeche-mit-bueroanteil-in-billbrook-bh-1012', 'BH-1012', 'Lagerfläche mit Büroanteil in Billbrook', 'Ebenerdige Halle mit zwei Rampen und 180 m² Büro- und Sozialfläche.', 'Ebenerdige Halle mit zwei Rampen und 180 m² Büro- und Sozialfläche. Die Lagerfläche umfasst 1.850 m² im EG.

Das 1988 errichtete Gebäude wurde 2015 umfassend modernisiert und verfügt über 2 Geschosse.

Billbrook im Bezirk Hamburg-Mitte bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'lager-logistik', 'lager', 'published', false, '{}'::text[], '2026-09-20T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1012-u1')::uuid, md5('property-bh-1012')::uuid, 'Gesamtfläche', 0, 1850, 6.5, 1, null, null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1012-i1')::uuid, md5('property-bh-1012')::uuid, 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1200&q=75', 'Lagerfläche mit Büroanteil in Billbrook – Bild 1', 0),
  (md5('image-bh-1012-i2')::uuid, md5('property-bh-1012')::uuid, 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?auto=format&fit=crop&w=1200&q=75', 'Lagerfläche mit Büroanteil in Billbrook – Bild 2', 1),
  (md5('image-bh-1012-i3')::uuid, md5('property-bh-1012')::uuid, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=75', 'Lagerfläche mit Büroanteil in Billbrook – Bild 3', 2);

-- Moderne Logistikhalle in Rothenburgsort
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1013')::uuid, null, 'Billstraße', '80', '20539', 'rothenburgsort', extensions.st_setsrid(extensions.st_makepoint(10.042432, 53.536018), 4326)::extensions.geography, 'peripherie', 2019, null, 1, array['rampe', 'stellplaetze']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1013')::uuid, md5('building-bh-1013')::uuid, md5('contact-c-4')::uuid, 'moderne-logistikhalle-in-rothenburgsort-bh-1013', 'BH-1013', 'Moderne Logistikhalle in Rothenburgsort', '10 m Hallenhöhe, sechs Andockstationen, schnelle Anbindung an die A1.', '10 m Hallenhöhe, sechs Andockstationen, schnelle Anbindung an die A1. Die Lagerfläche umfasst 3.200 m² im EG.

Das Gebäude aus dem Jahr 2019 verfügt über 1 Geschosse.

Rothenburgsort im Bezirk Hamburg-Mitte bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'lager-logistik', 'lager', 'published', true, '{}'::text[], '2026-10-02T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1013-u1')::uuid, md5('property-bh-1013')::uuid, 'Gesamtfläche', 0, 3200, 7.2, 1.5, '2027-03-01', null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1013-i1')::uuid, md5('property-bh-1013')::uuid, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=75', 'Moderne Logistikhalle in Rothenburgsort – Bild 1', 0),
  (md5('image-bh-1013-i2')::uuid, md5('property-bh-1013')::uuid, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=75', 'Moderne Logistikhalle in Rothenburgsort – Bild 2', 1),
  (md5('image-bh-1013-i3')::uuid, md5('property-bh-1013')::uuid, 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=1200&q=75', 'Moderne Logistikhalle in Rothenburgsort – Bild 3', 2);

-- Loftbüro in Ottensen
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1014')::uuid, null, 'Friedensallee', '128', '22763', 'ottensen', extensions.st_setsrid(extensions.st_makepoint(9.927252, 53.553893), 4326)::extensions.geography, 'citynah', 1911, 2014, 4, array['denkmalschutz', 'glasfaser', 'oepnv-nah']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1014')::uuid, md5('building-bh-1014')::uuid, md5('contact-c-2')::uuid, 'loftbuero-in-ottensen-bh-1014', 'BH-1014', 'Loftbüro in Ottensen', 'Industriecharme mit Backsteinwänden und Stahlträgern in umgebauter Fabrik.', 'Industriecharme mit Backsteinwänden und Stahlträgern in umgebauter Fabrik. Die Bürofläche umfasst 360 m² im 1. OG.

Das 1911 errichtete Gebäude wurde 2014 umfassend modernisiert und verfügt über 4 Geschosse.

Ottensen steht für kreatives Arbeiten in umgebauten Fabriken, umgeben von Cafés, Läden und kurzen Wegen zur Elbe.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, array['teekueche']::text[], '2026-10-12T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1014-u1')::uuid, md5('property-bh-1014')::uuid, 'Gesamtfläche', 1, 360, 20.5, 3.5, null, 8, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1014-i1')::uuid, md5('property-bh-1014')::uuid, 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=1200&q=75', 'Loftbüro in Ottensen – Bild 1', 0),
  (md5('image-bh-1014-i2')::uuid, md5('property-bh-1014')::uuid, 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1200&q=75', 'Loftbüro in Ottensen – Bild 2', 1),
  (md5('image-bh-1014-i3')::uuid, md5('property-bh-1014')::uuid, 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=1200&q=75', 'Loftbüro in Ottensen – Bild 3', 2),
  (md5('image-bh-1014-i4')::uuid, md5('property-bh-1014')::uuid, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=75', 'Loftbüro in Ottensen – Bild 4', 3),
  (md5('image-bh-1014-i5')::uuid, md5('property-bh-1014')::uuid, 'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1200&q=75', 'Loftbüro in Ottensen – Bild 5', 4);

-- Büros mit Elbblick am Altonaer Hafen
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1015')::uuid, null, 'Große Elbstraße', '145', '22767', 'altona-altstadt', extensions.st_setsrid(extensions.st_makepoint(9.938473, 53.549768), 4326)::extensions.geography, 'citynah', 2003, null, 7, array['wasserblick', 'aufzug', 'stellplaetze', 'empfang']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1015')::uuid, md5('building-bh-1015')::uuid, md5('contact-c-2')::uuid, 'bueros-mit-elbblick-am-altonaer-hafen-bh-1015', 'BH-1015', 'Büros mit Elbblick am Altonaer Hafen', 'Zwei Panoramaetagen direkt an der Elbe – einzeln oder zusammen anmietbar.', 'Zwei Panoramaetagen direkt an der Elbe – einzeln oder zusammen anmietbar. Insgesamt stehen 1.780 m² auf 2 Einheiten zur Verfügung (5. OG: 890 m², 6. OG: 890 m²).

Das Gebäude aus dem Jahr 2003 verfügt über 7 Geschosse.

Altona-Altstadt im Bezirk Altona bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, array['klimatisiert']::text[], '2026-10-09T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1015-u1')::uuid, md5('property-bh-1015')::uuid, 'Einheit A', 5, 890, 26, 4.5, null, null, true, 0),
  (md5('unit-bh-1015-u2')::uuid, md5('property-bh-1015')::uuid, 'Einheit B', 6, 890, 26, 4.5, null, null, true, 1);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1015-i1')::uuid, md5('property-bh-1015')::uuid, 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=75', 'Büros mit Elbblick am Altonaer Hafen – Bild 1', 0),
  (md5('image-bh-1015-i2')::uuid, md5('property-bh-1015')::uuid, 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=75', 'Büros mit Elbblick am Altonaer Hafen – Bild 2', 1),
  (md5('image-bh-1015-i3')::uuid, md5('property-bh-1015')::uuid, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=75', 'Büros mit Elbblick am Altonaer Hafen – Bild 3', 2),
  (md5('image-bh-1015-i4')::uuid, md5('property-bh-1015')::uuid, 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=1200&q=75', 'Büros mit Elbblick am Altonaer Hafen – Bild 4', 3),
  (md5('image-bh-1015-i5')::uuid, md5('property-bh-1015')::uuid, 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=1200&q=75', 'Büros mit Elbblick am Altonaer Hafen – Bild 5', 4);

-- Gastronomiefläche mit Terrasse in Ottensen
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1016')::uuid, null, 'Bahrenfelder Straße', '201', '22765', 'ottensen', extensions.st_setsrid(extensions.st_makepoint(9.929568, 53.553192), 4326)::extensions.geography, 'citynah', 1898, 2010, 5, '{}'::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1016')::uuid, md5('building-bh-1016')::uuid, md5('contact-c-3')::uuid, 'gastronomieflaeche-mit-terrasse-in-ottensen-bh-1016', 'BH-1016', 'Gastronomiefläche mit Terrasse in Ottensen', 'Voll erschlossene Gastrofläche mit Außenterrasse in belebter Lage.', 'Voll erschlossene Gastrofläche mit Außenterrasse in belebter Lage. Die Gastrofläche umfasst 160 m² im EG.

Das 1898 errichtete Gebäude wurde 2010 umfassend modernisiert und verfügt über 5 Geschosse.

Ottensen steht für kreatives Arbeiten in umgebauten Fabriken, umgeben von Cafés, Läden und kurzen Wegen zur Elbe.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'laden-gastro', 'gastro', 'published', true, array['abluft', 'schaufenster']::text[], '2026-10-13T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1016-u1')::uuid, md5('property-bh-1016')::uuid, 'Gesamtfläche', 0, 160, 24, 4.5, null, null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1016-i1')::uuid, md5('property-bh-1016')::uuid, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=75', 'Gastronomiefläche mit Terrasse in Ottensen – Bild 1', 0),
  (md5('image-bh-1016-i2')::uuid, md5('property-bh-1016')::uuid, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=75', 'Gastronomiefläche mit Terrasse in Ottensen – Bild 2', 1),
  (md5('image-bh-1016-i3')::uuid, md5('property-bh-1016')::uuid, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=75', 'Gastronomiefläche mit Terrasse in Ottensen – Bild 3', 2),
  (md5('image-bh-1016-i4')::uuid, md5('property-bh-1016')::uuid, 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?auto=format&fit=crop&w=1200&q=75', 'Gastronomiefläche mit Terrasse in Ottensen – Bild 4', 3);

-- Restaurantfläche an der Außenalster
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1017')::uuid, null, 'Schöne Aussicht', '20', '22085', 'uhlenhorst', extensions.st_setsrid(extensions.st_makepoint(10.019687, 53.572370), 4326)::extensions.geography, 'citynah', 1925, 2008, 3, array['wasserblick']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1017')::uuid, md5('building-bh-1017')::uuid, md5('contact-c-3')::uuid, 'restaurantflaeche-an-der-aussenalster-bh-1017', 'BH-1017', 'Restaurantfläche an der Außenalster', 'Seltene Gelegenheit: Gastronomie mit Alsterblick und Steganlage.', 'Seltene Gelegenheit: Gastronomie mit Alsterblick und Steganlage. Die Gastrofläche umfasst 240 m² im EG.

Das 1925 errichtete Gebäude wurde 2008 umfassend modernisiert und verfügt über 3 Geschosse.

Uhlenhorst im Bezirk Hamburg-Nord bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'laden-gastro', 'gastro', 'published', false, array['abluft']::text[], '2026-10-06T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1017-u1')::uuid, md5('property-bh-1017')::uuid, 'Gesamtfläche', 0, 240, null, null, '2027-01-15', null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1017-i1')::uuid, md5('property-bh-1017')::uuid, 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1200&q=75', 'Restaurantfläche an der Außenalster – Bild 1', 0),
  (md5('image-bh-1017-i2')::uuid, md5('property-bh-1017')::uuid, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=75', 'Restaurantfläche an der Außenalster – Bild 2', 1),
  (md5('image-bh-1017-i3')::uuid, md5('property-bh-1017')::uuid, 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=1200&q=75', 'Restaurantfläche an der Außenalster – Bild 3', 2),
  (md5('image-bh-1017-i4')::uuid, md5('property-bh-1017')::uuid, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=75', 'Restaurantfläche an der Außenalster – Bild 4', 3);

-- Bürohaus in der City Nord
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1018')::uuid, null, 'Überseering', '30', '22297', 'city-nord', extensions.st_setsrid(extensions.st_makepoint(10.021067, 53.603080), 4326)::extensions.geography, 'buerozentrum', 1974, 2021, 6, array['stellplaetze', 'kantine', 'aufzug', 'e-ladestation']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1018')::uuid, md5('building-bh-1018')::uuid, md5('contact-c-2')::uuid, 'buerohaus-in-der-city-nord-bh-1018', 'BH-1018', 'Bürohaus in der City Nord', 'Großflächige Büroetagen im Grünen mit eigener Tiefgarage.', 'Großflächige Büroetagen im Grünen mit eigener Tiefgarage. Insgesamt stehen 2.940 m² auf 3 Einheiten zur Verfügung (1. OG: 980 m², 2. OG: 980 m², 3. OG: 980 m²).

Das 1974 errichtete Gebäude wurde 2021 umfassend modernisiert und verfügt über 6 Geschosse.

Die City Nord ist ein klassischer Bürostandort im Grünen mit großen Flächen, guter Parkplatzsituation und S-/U-Bahn-Anbindung.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', true, '{}'::text[], '2026-09-28T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1018-u1')::uuid, md5('property-bh-1018')::uuid, 'Einheit A', 1, 980, 14.5, 2.5, null, null, true, 0),
  (md5('unit-bh-1018-u2')::uuid, md5('property-bh-1018')::uuid, 'Einheit B', 2, 980, 14.5, 2.5, null, null, true, 1),
  (md5('unit-bh-1018-u3')::uuid, md5('property-bh-1018')::uuid, 'Einheit C', 3, 980, 14.5, 2.5, null, null, true, 2);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1018-i1')::uuid, md5('property-bh-1018')::uuid, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=75', 'Bürohaus in der City Nord – Bild 1', 0),
  (md5('image-bh-1018-i2')::uuid, md5('property-bh-1018')::uuid, 'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1200&q=75', 'Bürohaus in der City Nord – Bild 2', 1),
  (md5('image-bh-1018-i3')::uuid, md5('property-bh-1018')::uuid, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=75', 'Bürohaus in der City Nord – Bild 3', 2),
  (md5('image-bh-1018-i4')::uuid, md5('property-bh-1018')::uuid, 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=75', 'Bürohaus in der City Nord – Bild 4', 3),
  (md5('image-bh-1018-i5')::uuid, md5('property-bh-1018')::uuid, 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&w=1200&q=75', 'Bürohaus in der City Nord – Bild 5', 4);

-- Kompakte Büroeinheit am Kapstadtring
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1019')::uuid, null, 'Kapstadtring', '7', '22297', 'city-nord', extensions.st_setsrid(extensions.st_makepoint(10.019444, 53.601662), 4326)::extensions.geography, 'buerozentrum', 1978, 2016, 8, array['aufzug', 'stellplaetze']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1019')::uuid, md5('building-bh-1019')::uuid, md5('contact-c-2')::uuid, 'kompakte-bueroeinheit-am-kapstadtring-bh-1019', 'BH-1019', 'Kompakte Büroeinheit am Kapstadtring', 'Bezugsfertige Einheit mit fünf Räumen und Teeküche.', 'Bezugsfertige Einheit mit fünf Räumen und Teeküche. Die Bürofläche umfasst 165 m² im 4. OG.

Das 1978 errichtete Gebäude wurde 2016 umfassend modernisiert und verfügt über 8 Geschosse.

Die City Nord ist ein klassischer Bürostandort im Grünen mit großen Flächen, guter Parkplatzsituation und S-/U-Bahn-Anbindung.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', true, '{}'::text[], '2026-09-15T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1019-u1')::uuid, md5('property-bh-1019')::uuid, 'Gesamtfläche', 4, 165, 13.5, 2.5, null, 5, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1019-i1')::uuid, md5('property-bh-1019')::uuid, 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=1200&q=75', 'Kompakte Büroeinheit am Kapstadtring – Bild 1', 0),
  (md5('image-bh-1019-i2')::uuid, md5('property-bh-1019')::uuid, 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=1200&q=75', 'Kompakte Büroeinheit am Kapstadtring – Bild 2', 1),
  (md5('image-bh-1019-i3')::uuid, md5('property-bh-1019')::uuid, 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=75', 'Kompakte Büroeinheit am Kapstadtring – Bild 3', 2),
  (md5('image-bh-1019-i4')::uuid, md5('property-bh-1019')::uuid, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=75', 'Kompakte Büroeinheit am Kapstadtring – Bild 4', 3),
  (md5('image-bh-1019-i5')::uuid, md5('property-bh-1019')::uuid, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=75', 'Kompakte Büroeinheit am Kapstadtring – Bild 5', 4);

-- Praxisfläche in UKE-Nähe
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1020')::uuid, null, 'Martinistraße', '44', '20251', 'eppendorf', extensions.st_setsrid(extensions.st_makepoint(9.984345, 53.594051), 4326)::extensions.geography, 'citynah', 2001, null, 4, array['barrierefrei', 'stellplaetze']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1020')::uuid, md5('building-bh-1020')::uuid, md5('contact-c-4')::uuid, 'praxisflaeche-in-uke-naehe-bh-1020', 'BH-1020', 'Praxisfläche in UKE-Nähe', 'Ebenerdige, barrierefreie Praxis gegenüber dem Universitätsklinikum.', 'Ebenerdige, barrierefreie Praxis gegenüber dem Universitätsklinikum. Die Praxisfläche umfasst 220 m² im EG.

Das Gebäude aus dem Jahr 2001 verfügt über 4 Geschosse.

Eppendorf im Bezirk Hamburg-Nord bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'praxis', 'published', false, '{}'::text[], '2026-10-10T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1020-u1')::uuid, md5('property-bh-1020')::uuid, 'Gesamtfläche', 0, 220, 18, 3, null, 7, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1020-i1')::uuid, md5('property-bh-1020')::uuid, 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=75', 'Praxisfläche in UKE-Nähe – Bild 1', 0),
  (md5('image-bh-1020-i2')::uuid, md5('property-bh-1020')::uuid, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=75', 'Praxisfläche in UKE-Nähe – Bild 2', 1),
  (md5('image-bh-1020-i3')::uuid, md5('property-bh-1020')::uuid, 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=75', 'Praxisfläche in UKE-Nähe – Bild 3', 2),
  (md5('image-bh-1020-i4')::uuid, md5('property-bh-1020')::uuid, 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?auto=format&fit=crop&w=1200&q=75', 'Praxisfläche in UKE-Nähe – Bild 4', 3),
  (md5('image-bh-1020-i5')::uuid, md5('property-bh-1020')::uuid, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=75', 'Praxisfläche in UKE-Nähe – Bild 5', 4);

-- Ladenlokal am Eppendorfer Baum
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1021')::uuid, null, 'Eppendorfer Baum', '12', '20249', 'eppendorf', extensions.st_setsrid(extensions.st_makepoint(9.980306, 53.589836), 4326)::extensions.geography, 'citynah', 1903, 2011, 5, '{}'::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1021')::uuid, md5('building-bh-1021')::uuid, md5('contact-c-3')::uuid, 'ladenlokal-am-eppendorfer-baum-bh-1021', 'BH-1021', 'Ladenlokal am Eppendorfer Baum', 'Boutique-Fläche in einer der schönsten Einkaufsstraßen Hamburgs.', 'Boutique-Fläche in einer der schönsten Einkaufsstraßen Hamburgs. Die Ladenfläche umfasst 120 m² im EG.

Das 1903 errichtete Gebäude wurde 2011 umfassend modernisiert und verfügt über 5 Geschosse.

Eppendorf im Bezirk Hamburg-Nord bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'laden-gastro', 'laden', 'published', false, array['schaufenster']::text[], '2026-10-04T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1021-u1')::uuid, md5('property-bh-1021')::uuid, 'Gesamtfläche', 0, 120, 32, 6, null, null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1021-i1')::uuid, md5('property-bh-1021')::uuid, 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1200&q=75', 'Ladenlokal am Eppendorfer Baum – Bild 1', 0),
  (md5('image-bh-1021-i2')::uuid, md5('property-bh-1021')::uuid, 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=75', 'Ladenlokal am Eppendorfer Baum – Bild 2', 1),
  (md5('image-bh-1021-i3')::uuid, md5('property-bh-1021')::uuid, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=75', 'Ladenlokal am Eppendorfer Baum – Bild 3', 2),
  (md5('image-bh-1021-i4')::uuid, md5('property-bh-1021')::uuid, 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?auto=format&fit=crop&w=1200&q=75', 'Ladenlokal am Eppendorfer Baum – Bild 4', 3);

-- Villa-Büros in Harvestehude
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1022')::uuid, null, 'Harvestehuder Weg', '42', '20149', 'harvestehude', extensions.st_setsrid(extensions.st_makepoint(9.981761, 53.577811), 4326)::extensions.geography, 'citynah', 1897, 2019, 3, array['denkmalschutz', 'stellplaetze', 'wasserblick']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1022')::uuid, md5('building-bh-1022')::uuid, md5('contact-c-2')::uuid, 'villa-bueros-in-harvestehude-bh-1022', 'BH-1022', 'Villa-Büros in Harvestehude', 'Stilvolle Stadtvilla an der Alster – ideal für Kanzleien und Family Offices.', 'Stilvolle Stadtvilla an der Alster – ideal für Kanzleien und Family Offices. Insgesamt stehen 600 m² auf 2 Einheiten zur Verfügung (EG: 310 m², 1. OG: 290 m²).

Das 1897 errichtete Gebäude wurde 2019 umfassend modernisiert und verfügt über 3 Geschosse.

Harvestehude im Bezirk Eimsbüttel bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, '{}'::text[], '2026-09-23T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1022-u1')::uuid, md5('property-bh-1022')::uuid, 'Einheit A', 0, 310, 23, 4, null, 9, false, 0),
  (md5('unit-bh-1022-u2')::uuid, md5('property-bh-1022')::uuid, 'Einheit B', 1, 290, 23, 4, null, 8, false, 1);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1022-i1')::uuid, md5('property-bh-1022')::uuid, 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=75', 'Villa-Büros in Harvestehude – Bild 1', 0),
  (md5('image-bh-1022-i2')::uuid, md5('property-bh-1022')::uuid, 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&w=1200&q=75', 'Villa-Büros in Harvestehude – Bild 2', 1),
  (md5('image-bh-1022-i3')::uuid, md5('property-bh-1022')::uuid, 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=1200&q=75', 'Villa-Büros in Harvestehude – Bild 3', 2),
  (md5('image-bh-1022-i4')::uuid, md5('property-bh-1022')::uuid, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=75', 'Villa-Büros in Harvestehude – Bild 4', 3),
  (md5('image-bh-1022-i5')::uuid, md5('property-bh-1022')::uuid, 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=75', 'Villa-Büros in Harvestehude – Bild 5', 4);

-- Charmantes Büro am Mittelweg
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1023')::uuid, null, 'Mittelweg', '144', '20148', 'rotherbaum', extensions.st_setsrid(extensions.st_makepoint(9.988432, 53.568767), 4326)::extensions.geography, 'citynah', 1908, 2015, 5, array['aufzug']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1023')::uuid, md5('building-bh-1023')::uuid, md5('contact-c-2')::uuid, 'charmantes-buero-am-mittelweg-bh-1023', 'BH-1023', 'Charmantes Büro am Mittelweg', 'Altbauflair mit Stuck und Parkett in exklusiver Lage.', 'Altbauflair mit Stuck und Parkett in exklusiver Lage. Die Bürofläche umfasst 195 m² im 2. OG.

Das 1908 errichtete Gebäude wurde 2015 umfassend modernisiert und verfügt über 5 Geschosse.

Rotherbaum im Bezirk Eimsbüttel bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, array['teekueche']::text[], '2026-10-07T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1023-u1')::uuid, md5('property-bh-1023')::uuid, 'Gesamtfläche', 2, 195, 22, 4, null, 6, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1023-i1')::uuid, md5('property-bh-1023')::uuid, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=75', 'Charmantes Büro am Mittelweg – Bild 1', 0),
  (md5('image-bh-1023-i2')::uuid, md5('property-bh-1023')::uuid, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=75', 'Charmantes Büro am Mittelweg – Bild 2', 1),
  (md5('image-bh-1023-i3')::uuid, md5('property-bh-1023')::uuid, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=75', 'Charmantes Büro am Mittelweg – Bild 3', 2),
  (md5('image-bh-1023-i4')::uuid, md5('property-bh-1023')::uuid, 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=75', 'Charmantes Büro am Mittelweg – Bild 4', 3),
  (md5('image-bh-1023-i5')::uuid, md5('property-bh-1023')::uuid, 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=75', 'Charmantes Büro am Mittelweg – Bild 5', 4);

-- Büroflächen am Grindel
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1024')::uuid, null, 'Rothenbaumchaussee', '76', '20148', 'rotherbaum', extensions.st_setsrid(extensions.st_makepoint(9.990536, 53.569404), 4326)::extensions.geography, 'citynah', 1985, 2020, 6, array['barrierefrei', 'aufzug', 'glasfaser']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1024')::uuid, md5('building-bh-1024')::uuid, md5('contact-c-2')::uuid, 'bueroflaechen-am-grindel-bh-1024', 'BH-1024', 'Büroflächen am Grindel', 'Wissenschaftsnaher Standort in direkter Nachbarschaft zur Universität.', 'Wissenschaftsnaher Standort in direkter Nachbarschaft zur Universität. Die Bürofläche umfasst 420 m² im 3. OG.

Das 1985 errichtete Gebäude wurde 2020 umfassend modernisiert und verfügt über 6 Geschosse.

Rotherbaum im Bezirk Eimsbüttel bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, '{}'::text[], '2026-10-01T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1024-u1')::uuid, md5('property-bh-1024')::uuid, 'Gesamtfläche', 3, 420, 20.5, 3.5, '2027-02-01', 11, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1024-i1')::uuid, md5('property-bh-1024')::uuid, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Grindel – Bild 1', 0),
  (md5('image-bh-1024-i2')::uuid, md5('property-bh-1024')::uuid, 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Grindel – Bild 2', 1),
  (md5('image-bh-1024-i3')::uuid, md5('property-bh-1024')::uuid, 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Grindel – Bild 3', 2),
  (md5('image-bh-1024-i4')::uuid, md5('property-bh-1024')::uuid, 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Grindel – Bild 4', 3),
  (md5('image-bh-1024-i5')::uuid, md5('property-bh-1024')::uuid, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Grindel – Bild 5', 4);

-- Helle Büroflächen am Stadtpark
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1025')::uuid, null, 'Jarrestraße', '42', '22303', 'winterhude', extensions.st_setsrid(extensions.st_makepoint(10.002856, 53.587875), 4326)::extensions.geography, 'citynah', 1964, 2018, 5, array['glasfaser', 'stellplaetze']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1025')::uuid, md5('building-bh-1025')::uuid, md5('contact-c-2')::uuid, 'helle-bueroflaechen-am-stadtpark-bh-1025', 'BH-1025', 'Helle Büroflächen am Stadtpark', 'Offene Fläche im Kampnagel-Quartier, wenige Minuten zum Stadtpark.', 'Offene Fläche im Kampnagel-Quartier, wenige Minuten zum Stadtpark. Die Bürofläche umfasst 540 m² im 2. OG.

Das 1964 errichtete Gebäude wurde 2018 umfassend modernisiert und verfügt über 5 Geschosse.

Winterhude überzeugt mit Stadtpark, Kanälen und einer hohen Aufenthaltsqualität – beliebt bei Mitarbeitenden wie Kundschaft.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', true, array['teekueche']::text[], '2026-09-29T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1025-u1')::uuid, md5('property-bh-1025')::uuid, 'Gesamtfläche', 2, 540, 17.5, 3, null, null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1025-i1')::uuid, md5('property-bh-1025')::uuid, 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=75', 'Helle Büroflächen am Stadtpark – Bild 1', 0),
  (md5('image-bh-1025-i2')::uuid, md5('property-bh-1025')::uuid, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=75', 'Helle Büroflächen am Stadtpark – Bild 2', 1),
  (md5('image-bh-1025-i3')::uuid, md5('property-bh-1025')::uuid, 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?auto=format&fit=crop&w=1200&q=75', 'Helle Büroflächen am Stadtpark – Bild 3', 2),
  (md5('image-bh-1025-i4')::uuid, md5('property-bh-1025')::uuid, 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=75', 'Helle Büroflächen am Stadtpark – Bild 4', 3),
  (md5('image-bh-1025-i5')::uuid, md5('property-bh-1025')::uuid, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&w=1200&q=75', 'Helle Büroflächen am Stadtpark – Bild 5', 4);

-- Gewerbeloft in ehemaliger Fabrik
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1026')::uuid, null, 'Wiesendamm', '26', '22305', 'barmbek', extensions.st_setsrid(extensions.st_makepoint(10.045765, 53.586417), 4326)::extensions.geography, 'peripherie', 1921, 2013, 4, array['denkmalschutz', 'stellplaetze']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1026')::uuid, md5('building-bh-1026')::uuid, md5('contact-c-2')::uuid, 'gewerbeloft-in-ehemaliger-fabrik-bh-1026', 'BH-1026', 'Gewerbeloft in ehemaliger Fabrik', 'Großzügiges Loft mit 4,5 m Deckenhöhe und Lastenaufzug.', 'Großzügiges Loft mit 4,5 m Deckenhöhe und Lastenaufzug. Die Bürofläche umfasst 390 m² im 1. OG.

Das 1921 errichtete Gebäude wurde 2013 umfassend modernisiert und verfügt über 4 Geschosse.

Barmbek im Bezirk Hamburg-Nord bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, '{}'::text[], '2026-09-10T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1026-u1')::uuid, md5('property-bh-1026')::uuid, 'Gesamtfläche', 1, 390, 15.5, 3, null, null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1026-i1')::uuid, md5('property-bh-1026')::uuid, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=75', 'Gewerbeloft in ehemaliger Fabrik – Bild 1', 0),
  (md5('image-bh-1026-i2')::uuid, md5('property-bh-1026')::uuid, 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=75', 'Gewerbeloft in ehemaliger Fabrik – Bild 2', 1),
  (md5('image-bh-1026-i3')::uuid, md5('property-bh-1026')::uuid, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=75', 'Gewerbeloft in ehemaliger Fabrik – Bild 3', 2),
  (md5('image-bh-1026-i4')::uuid, md5('property-bh-1026')::uuid, 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=1200&q=75', 'Gewerbeloft in ehemaliger Fabrik – Bild 4', 3),
  (md5('image-bh-1026-i5')::uuid, md5('property-bh-1026')::uuid, 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=75', 'Gewerbeloft in ehemaliger Fabrik – Bild 5', 4);

-- Ladenfläche an der Fuhlsbüttler Straße
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1027')::uuid, null, 'Fuhlsbüttler Straße', '110', '22305', 'barmbek', extensions.st_setsrid(extensions.st_makepoint(10.039319, 53.584676), 4326)::extensions.geography, 'peripherie', 1955, 2009, 4, '{}'::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1027')::uuid, md5('building-bh-1027')::uuid, md5('contact-c-3')::uuid, 'ladenflaeche-an-der-fuhlsbuettler-strasse-bh-1027', 'BH-1027', 'Ladenfläche an der Fuhlsbüttler Straße', 'Frequenzstarke Einkaufsstraße mit guter Nahversorgungsstruktur.', 'Frequenzstarke Einkaufsstraße mit guter Nahversorgungsstruktur. Die Ladenfläche umfasst 180 m² im EG.

Das 1955 errichtete Gebäude wurde 2009 umfassend modernisiert und verfügt über 4 Geschosse.

Barmbek im Bezirk Hamburg-Nord bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'laden-gastro', 'laden', 'published', true, array['schaufenster']::text[], '2026-09-17T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1027-u1')::uuid, md5('property-bh-1027')::uuid, 'Gesamtfläche', 0, 180, 19, 3.5, null, null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1027-i1')::uuid, md5('property-bh-1027')::uuid, 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1200&q=75', 'Ladenfläche an der Fuhlsbüttler Straße – Bild 1', 0),
  (md5('image-bh-1027-i2')::uuid, md5('property-bh-1027')::uuid, 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=75', 'Ladenfläche an der Fuhlsbüttler Straße – Bild 2', 1),
  (md5('image-bh-1027-i3')::uuid, md5('property-bh-1027')::uuid, 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=75', 'Ladenfläche an der Fuhlsbüttler Straße – Bild 3', 2),
  (md5('image-bh-1027-i4')::uuid, md5('property-bh-1027')::uuid, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=75', 'Ladenfläche an der Fuhlsbüttler Straße – Bild 4', 3);

-- Büroflächen am Wandsbeker Markt
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1028')::uuid, null, 'Wandsbeker Marktstraße', '73', '22041', 'wandsbek', extensions.st_setsrid(extensions.st_makepoint(10.072082, 53.573452), 4326)::extensions.geography, 'peripherie', 1982, 2017, 7, array['oepnv-nah', 'aufzug']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1028')::uuid, md5('building-bh-1028')::uuid, md5('contact-c-2')::uuid, 'bueroflaechen-am-wandsbeker-markt-bh-1028', 'BH-1028', 'Büroflächen am Wandsbeker Markt', 'Direkt am U-/Busknotenpunkt Wandsbek Markt – ideal für Publikumsverkehr.', 'Direkt am U-/Busknotenpunkt Wandsbek Markt – ideal für Publikumsverkehr. Insgesamt stehen 520 m² auf 2 Einheiten zur Verfügung (3. OG: 260 m², 4. OG: 260 m²).

Das 1982 errichtete Gebäude wurde 2017 umfassend modernisiert und verfügt über 7 Geschosse.

Wandsbek im Bezirk Wandsbek bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', true, '{}'::text[], '2026-09-26T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1028-u1')::uuid, md5('property-bh-1028')::uuid, 'Einheit A', 3, 260, 14, 2.5, null, 7, true, 0),
  (md5('unit-bh-1028-u2')::uuid, md5('property-bh-1028')::uuid, 'Einheit B', 4, 260, 14, 2.5, null, 7, true, 1);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1028-i1')::uuid, md5('property-bh-1028')::uuid, 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Wandsbeker Markt – Bild 1', 0),
  (md5('image-bh-1028-i2')::uuid, md5('property-bh-1028')::uuid, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Wandsbeker Markt – Bild 2', 1),
  (md5('image-bh-1028-i3')::uuid, md5('property-bh-1028')::uuid, 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Wandsbeker Markt – Bild 3', 2),
  (md5('image-bh-1028-i4')::uuid, md5('property-bh-1028')::uuid, 'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Wandsbeker Markt – Bild 4', 3),
  (md5('image-bh-1028-i5')::uuid, md5('property-bh-1028')::uuid, 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Wandsbeker Markt – Bild 5', 4);

-- Flagship-Fläche in der Mönckebergstraße
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1029')::uuid, null, 'Mönckebergstraße', '21', '20095', 'altstadt', extensions.st_setsrid(extensions.st_makepoint(10.002516, 53.548271), 4326)::extensions.geography, 'city', 1910, 2023, 6, array['aufzug']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1029')::uuid, md5('building-bh-1029')::uuid, md5('contact-c-3')::uuid, 'flagship-flaeche-in-der-moenckebergstrasse-bh-1029', 'BH-1029', 'Flagship-Fläche in der Mönckebergstraße', 'Zweigeschossige Einzelhandelsfläche in Hamburgs frequenzstärkster Lage.', 'Zweigeschossige Einzelhandelsfläche in Hamburgs frequenzstärkster Lage. Insgesamt stehen 830 m² auf 2 Einheiten zur Verfügung (EG: 450 m², 1. OG: 380 m²).

Das 1910 errichtete Gebäude wurde 2023 umfassend modernisiert und verfügt über 6 Geschosse.

Die Altstadt bildet das wirtschaftliche Herz Hamburgs – mit Rathaus, Binnenalster, Kontorhausviertel und einer hervorragenden ÖPNV-Anbindung.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'laden-gastro', 'laden', 'published', false, array['schaufenster', 'klimatisiert']::text[], '2026-10-14T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1029-u1')::uuid, md5('property-bh-1029')::uuid, 'Einheit A', 0, 450, null, null, '2027-06-01', null, false, 0),
  (md5('unit-bh-1029-u2')::uuid, md5('property-bh-1029')::uuid, 'Einheit B', 1, 380, null, null, '2027-06-01', null, false, 1);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1029-i1')::uuid, md5('property-bh-1029')::uuid, 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=75', 'Flagship-Fläche in der Mönckebergstraße – Bild 1', 0),
  (md5('image-bh-1029-i2')::uuid, md5('property-bh-1029')::uuid, 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1200&q=75', 'Flagship-Fläche in der Mönckebergstraße – Bild 2', 1),
  (md5('image-bh-1029-i3')::uuid, md5('property-bh-1029')::uuid, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=75', 'Flagship-Fläche in der Mönckebergstraße – Bild 3', 2),
  (md5('image-bh-1029-i4')::uuid, md5('property-bh-1029')::uuid, 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?auto=format&fit=crop&w=1200&q=75', 'Flagship-Fläche in der Mönckebergstraße – Bild 4', 3);

-- Praxisfläche im Harburger Zentrum
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1030')::uuid, null, 'Harburger Rathausstraße', '40', '21073', 'harburg', extensions.st_setsrid(extensions.st_makepoint(9.984848, 53.459902), 4326)::extensions.geography, 'peripherie', 1990, 2018, 5, array['barrierefrei', 'aufzug', 'oepnv-nah']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1030')::uuid, md5('building-bh-1030')::uuid, md5('contact-c-4')::uuid, 'praxisflaeche-im-harburger-zentrum-bh-1030', 'BH-1030', 'Praxisfläche im Harburger Zentrum', 'Zentral gelegene Praxisräume mit Aufzug, nahe S-Bahn Harburg Rathaus.', 'Zentral gelegene Praxisräume mit Aufzug, nahe S-Bahn Harburg Rathaus. Die Praxisfläche umfasst 175 m² im 2. OG.

Das 1990 errichtete Gebäude wurde 2018 umfassend modernisiert und verfügt über 5 Geschosse.

Harburg im Bezirk Harburg bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'praxis', 'published', true, '{}'::text[], '2026-09-21T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1030-u1')::uuid, md5('property-bh-1030')::uuid, 'Gesamtfläche', 2, 175, 12.5, 2.5, null, 6, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1030-i1')::uuid, md5('property-bh-1030')::uuid, 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=75', 'Praxisfläche im Harburger Zentrum – Bild 1', 0),
  (md5('image-bh-1030-i2')::uuid, md5('property-bh-1030')::uuid, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=75', 'Praxisfläche im Harburger Zentrum – Bild 2', 1),
  (md5('image-bh-1030-i3')::uuid, md5('property-bh-1030')::uuid, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=75', 'Praxisfläche im Harburger Zentrum – Bild 3', 2),
  (md5('image-bh-1030-i4')::uuid, md5('property-bh-1030')::uuid, 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=75', 'Praxisfläche im Harburger Zentrum – Bild 4', 3),
  (md5('image-bh-1030-i5')::uuid, md5('property-bh-1030')::uuid, 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=1200&q=75', 'Praxisfläche im Harburger Zentrum – Bild 5', 4);

-- Büros im Harburger Binnenhafen
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1031')::uuid, null, 'Veritaskai', '4', '21079', 'harburg', extensions.st_setsrid(extensions.st_makepoint(9.980163, 53.458018), 4326)::extensions.geography, 'peripherie', 2024, null, 7, array['wasserblick', 'neubau', 'stellplaetze']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1031')::uuid, md5('building-bh-1031')::uuid, md5('contact-c-2')::uuid, 'bueros-im-harburger-binnenhafen-bh-1031', 'BH-1031', 'Büros im Harburger Binnenhafen', 'Moderner Neubau am Kanalplatz mit Blick über den Binnenhafen.', 'Moderner Neubau am Kanalplatz mit Blick über den Binnenhafen. Die Bürofläche umfasst 610 m² im 3. OG.

Das Gebäude aus dem Jahr 2024 verfügt über 7 Geschosse.

Harburg im Bezirk Harburg bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, array['klimatisiert']::text[], '2026-10-03T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1031-u1')::uuid, md5('property-bh-1031')::uuid, 'Gesamtfläche', 3, 610, 15.5, 3, null, null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1031-i1')::uuid, md5('property-bh-1031')::uuid, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=75', 'Büros im Harburger Binnenhafen – Bild 1', 0),
  (md5('image-bh-1031-i2')::uuid, md5('property-bh-1031')::uuid, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=75', 'Büros im Harburger Binnenhafen – Bild 2', 1),
  (md5('image-bh-1031-i3')::uuid, md5('property-bh-1031')::uuid, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=75', 'Büros im Harburger Binnenhafen – Bild 3', 2),
  (md5('image-bh-1031-i4')::uuid, md5('property-bh-1031')::uuid, 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=75', 'Büros im Harburger Binnenhafen – Bild 4', 3),
  (md5('image-bh-1031-i5')::uuid, md5('property-bh-1031')::uuid, 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=1200&q=75', 'Büros im Harburger Binnenhafen – Bild 5', 4);

-- Kleines Büro im Bergedorfer Zentrum
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1032')::uuid, null, 'Alte Holstenstraße', '18', '21031', 'bergedorf', extensions.st_setsrid(extensions.st_makepoint(10.210186, 53.489238), 4326)::extensions.geography, 'peripherie', 1979, 2014, 4, array['stellplaetze', 'oepnv-nah']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1032')::uuid, md5('building-bh-1032')::uuid, md5('contact-c-2')::uuid, 'kleines-buero-im-bergedorfer-zentrum-bh-1032', 'BH-1032', 'Kleines Büro im Bergedorfer Zentrum', 'Gepflegte Bürofläche in der Fußgängerzone, nahe Bahnhof Bergedorf.', 'Gepflegte Bürofläche in der Fußgängerzone, nahe Bahnhof Bergedorf. Die Bürofläche umfasst 145 m² im 1. OG.

Das 1979 errichtete Gebäude wurde 2014 umfassend modernisiert und verfügt über 4 Geschosse.

Bergedorf im Bezirk Bergedorf bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', true, '{}'::text[], '2026-09-05T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1032-u1')::uuid, md5('property-bh-1032')::uuid, 'Gesamtfläche', 1, 145, 11.5, 2, null, 4, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1032-i1')::uuid, md5('property-bh-1032')::uuid, 'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1200&q=75', 'Kleines Büro im Bergedorfer Zentrum – Bild 1', 0),
  (md5('image-bh-1032-i2')::uuid, md5('property-bh-1032')::uuid, 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=75', 'Kleines Büro im Bergedorfer Zentrum – Bild 2', 1),
  (md5('image-bh-1032-i3')::uuid, md5('property-bh-1032')::uuid, 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=1200&q=75', 'Kleines Büro im Bergedorfer Zentrum – Bild 3', 2),
  (md5('image-bh-1032-i4')::uuid, md5('property-bh-1032')::uuid, 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&w=1200&q=75', 'Kleines Büro im Bergedorfer Zentrum – Bild 4', 3),
  (md5('image-bh-1032-i5')::uuid, md5('property-bh-1032')::uuid, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=75', 'Kleines Büro im Bergedorfer Zentrum – Bild 5', 4);

-- Praxisräume am Tibarg
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1033')::uuid, null, 'Tibarg', '32', '22459', 'niendorf', extensions.st_setsrid(extensions.st_makepoint(9.946382, 53.616250), 4326)::extensions.geography, 'peripherie', 2005, null, 4, array['barrierefrei', 'aufzug', 'stellplaetze']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1033')::uuid, md5('building-bh-1033')::uuid, md5('contact-c-4')::uuid, 'praxisraeume-am-tibarg-bh-1033', 'BH-1033', 'Praxisräume am Tibarg', 'Praxis im Ärztehaus mit Apotheke im Erdgeschoss.', 'Praxis im Ärztehaus mit Apotheke im Erdgeschoss. Die Praxisfläche umfasst 160 m² im 1. OG.

Das Gebäude aus dem Jahr 2005 verfügt über 4 Geschosse.

Niendorf im Bezirk Eimsbüttel bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'praxis', 'published', false, '{}'::text[], '2026-09-12T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1033-u1')::uuid, md5('property-bh-1033')::uuid, 'Gesamtfläche', 1, 160, 13.5, 2.5, null, 5, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1033-i1')::uuid, md5('property-bh-1033')::uuid, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=75', 'Praxisräume am Tibarg – Bild 1', 0),
  (md5('image-bh-1033-i2')::uuid, md5('property-bh-1033')::uuid, 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=75', 'Praxisräume am Tibarg – Bild 2', 1),
  (md5('image-bh-1033-i3')::uuid, md5('property-bh-1033')::uuid, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=75', 'Praxisräume am Tibarg – Bild 3', 2),
  (md5('image-bh-1033-i4')::uuid, md5('property-bh-1033')::uuid, 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=1200&q=75', 'Praxisräume am Tibarg – Bild 4', 3),
  (md5('image-bh-1033-i5')::uuid, md5('property-bh-1033')::uuid, 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&w=1200&q=75', 'Praxisräume am Tibarg – Bild 5', 4);

-- Büroflächen am Medienstandort Lokstedt
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1034')::uuid, null, 'Grandweg', '64', '22529', 'lokstedt', extensions.st_setsrid(extensions.st_makepoint(9.948095, 53.599148), 4326)::extensions.geography, 'peripherie', 1996, 2019, 5, array['stellplaetze', 'kantine', 'glasfaser']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1034')::uuid, md5('building-bh-1034')::uuid, md5('contact-c-2')::uuid, 'bueroflaechen-am-medienstandort-lokstedt-bh-1034', 'BH-1034', 'Büroflächen am Medienstandort Lokstedt', 'Etablierter Medien- und Technologiestandort mit Kantine im Haus.', 'Etablierter Medien- und Technologiestandort mit Kantine im Haus. Die Bürofläche umfasst 720 m² im 2. OG.

Das 1996 errichtete Gebäude wurde 2019 umfassend modernisiert und verfügt über 5 Geschosse.

Lokstedt im Bezirk Eimsbüttel bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, '{}'::text[], '2026-09-24T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1034-u1')::uuid, md5('property-bh-1034')::uuid, 'Gesamtfläche', 2, 720, 15, 2.5, null, null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1034-i1')::uuid, md5('property-bh-1034')::uuid, 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Medienstandort Lokstedt – Bild 1', 0),
  (md5('image-bh-1034-i2')::uuid, md5('property-bh-1034')::uuid, 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Medienstandort Lokstedt – Bild 2', 1),
  (md5('image-bh-1034-i3')::uuid, md5('property-bh-1034')::uuid, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Medienstandort Lokstedt – Bild 3', 2),
  (md5('image-bh-1034-i4')::uuid, md5('property-bh-1034')::uuid, 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Medienstandort Lokstedt – Bild 4', 3),
  (md5('image-bh-1034-i5')::uuid, md5('property-bh-1034')::uuid, 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Medienstandort Lokstedt – Bild 5', 4);

-- Gewerbehalle in Stellingen
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1035')::uuid, null, 'Kieler Straße', '333', '22525', 'stellingen', extensions.st_setsrid(extensions.st_makepoint(9.932618, 53.589669), 4326)::extensions.geography, 'peripherie', 1984, 2012, 2, array['rampe', 'stellplaetze']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1035')::uuid, md5('building-bh-1035')::uuid, md5('contact-c-4')::uuid, 'gewerbehalle-in-stellingen-bh-1035', 'BH-1035', 'Gewerbehalle in Stellingen', 'Vielseitig nutzbare Halle mit ebenerdigem Rolltor nahe A7.', 'Vielseitig nutzbare Halle mit ebenerdigem Rolltor nahe A7. Die Lagerfläche umfasst 950 m² im EG.

Das 1984 errichtete Gebäude wurde 2012 umfassend modernisiert und verfügt über 2 Geschosse.

Stellingen im Bezirk Eimsbüttel bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'lager-logistik', 'lager', 'published', true, '{}'::text[], '2026-09-19T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1035-u1')::uuid, md5('property-bh-1035')::uuid, 'Gesamtfläche', 0, 950, 8.5, 1.5, null, null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1035-i1')::uuid, md5('property-bh-1035')::uuid, 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=75', 'Gewerbehalle in Stellingen – Bild 1', 0),
  (md5('image-bh-1035-i2')::uuid, md5('property-bh-1035')::uuid, 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=1200&q=75', 'Gewerbehalle in Stellingen – Bild 2', 1),
  (md5('image-bh-1035-i3')::uuid, md5('property-bh-1035')::uuid, 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=75', 'Gewerbehalle in Stellingen – Bild 3', 2);

-- Nachhaltige Büros in Wilhelmsburg
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1036')::uuid, null, 'Neuenfelder Straße', '19', '21109', 'wilhelmsburg', extensions.st_setsrid(extensions.st_makepoint(10.006971, 53.491891), 4326)::extensions.geography, 'peripherie', 2023, null, 5, array['neubau', 'glasfaser', 'e-ladestation']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1036')::uuid, md5('building-bh-1036')::uuid, md5('contact-c-2')::uuid, 'nachhaltige-bueros-in-wilhelmsburg-bh-1036', 'BH-1036', 'Nachhaltige Büros in Wilhelmsburg', 'Holz-Hybrid-Neubau im IBA-Quartier mit günstigen Konditionen.', 'Holz-Hybrid-Neubau im IBA-Quartier mit günstigen Konditionen. Die Bürofläche umfasst 330 m² im 2. OG.

Das Gebäude aus dem Jahr 2023 verfügt über 5 Geschosse.

Wilhelmsburg im Bezirk Hamburg-Mitte bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', true, '{}'::text[], '2026-10-11T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1036-u1')::uuid, md5('property-bh-1036')::uuid, 'Gesamtfläche', 2, 330, 12, 2, null, null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1036-i1')::uuid, md5('property-bh-1036')::uuid, 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&w=1200&q=75', 'Nachhaltige Büros in Wilhelmsburg – Bild 1', 0),
  (md5('image-bh-1036-i2')::uuid, md5('property-bh-1036')::uuid, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=75', 'Nachhaltige Büros in Wilhelmsburg – Bild 2', 1),
  (md5('image-bh-1036-i3')::uuid, md5('property-bh-1036')::uuid, 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=75', 'Nachhaltige Büros in Wilhelmsburg – Bild 3', 2),
  (md5('image-bh-1036-i4')::uuid, md5('property-bh-1036')::uuid, 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=75', 'Nachhaltige Büros in Wilhelmsburg – Bild 4', 3),
  (md5('image-bh-1036-i5')::uuid, md5('property-bh-1036')::uuid, 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=75', 'Nachhaltige Büros in Wilhelmsburg – Bild 5', 4);

-- Bar- und Restaurantfläche am Neuen Pferdemarkt
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1037')::uuid, null, 'Neuer Pferdemarkt', '4', '20359', 'st-pauli', extensions.st_setsrid(extensions.st_makepoint(9.965613, 53.558373), 4326)::extensions.geography, 'citynah', 1901, 2006, 5, '{}'::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1037')::uuid, md5('building-bh-1037')::uuid, md5('contact-c-3')::uuid, 'bar-und-restaurantflaeche-am-neuen-pferdemarkt-bh-1037', 'BH-1037', 'Bar- und Restaurantfläche am Neuen Pferdemarkt', 'Eingeführte Gastronomielage zwischen Schanze und Reeperbahn.', 'Eingeführte Gastronomielage zwischen Schanze und Reeperbahn. Die Gastrofläche umfasst 210 m² im EG.

Das 1901 errichtete Gebäude wurde 2006 umfassend modernisiert und verfügt über 5 Geschosse.

St. Pauli im Bezirk Hamburg-Mitte bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'laden-gastro', 'gastro', 'published', false, array['abluft', 'schaufenster']::text[], '2026-10-08T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1037-u1')::uuid, md5('property-bh-1037')::uuid, 'Gesamtfläche', 0, 210, 26, 4.5, null, null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1037-i1')::uuid, md5('property-bh-1037')::uuid, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=75', 'Bar- und Restaurantfläche am Neuen Pferdemarkt – Bild 1', 0),
  (md5('image-bh-1037-i2')::uuid, md5('property-bh-1037')::uuid, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=75', 'Bar- und Restaurantfläche am Neuen Pferdemarkt – Bild 2', 1),
  (md5('image-bh-1037-i3')::uuid, md5('property-bh-1037')::uuid, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=75', 'Bar- und Restaurantfläche am Neuen Pferdemarkt – Bild 3', 2),
  (md5('image-bh-1037-i4')::uuid, md5('property-bh-1037')::uuid, 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=1200&q=75', 'Bar- und Restaurantfläche am Neuen Pferdemarkt – Bild 4', 3);

-- Gastronomiefläche am Überseeboulevard
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1038')::uuid, null, 'Überseeboulevard', '5', '20457', 'hafencity', extensions.st_setsrid(extensions.st_makepoint(9.994689, 53.543938), 4326)::extensions.geography, 'city', 2021, null, 8, array['wasserblick', 'neubau']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1038')::uuid, md5('building-bh-1038')::uuid, md5('contact-c-3')::uuid, 'gastronomieflaeche-am-ueberseeboulevard-bh-1038', 'BH-1038', 'Gastronomiefläche am Überseeboulevard', 'Erdgeschossfläche an der Flaniermeile der HafenCity mit Außenfläche.', 'Erdgeschossfläche an der Flaniermeile der HafenCity mit Außenfläche. Die Gastrofläche umfasst 280 m² im EG.

Das Gebäude aus dem Jahr 2021 verfügt über 8 Geschosse.

Die HafenCity ist Europas größtes innerstädtisches Stadtentwicklungsprojekt und verbindet moderne Architektur, Wasserlage und eine exzellente Anbindung über die U4.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'laden-gastro', 'gastro', 'published', false, array['abluft']::text[], '2026-10-16T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1038-u1')::uuid, md5('property-bh-1038')::uuid, 'Gesamtfläche', 0, 280, 29.5, 5.5, '2027-03-01', null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1038-i1')::uuid, md5('property-bh-1038')::uuid, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=75', 'Gastronomiefläche am Überseeboulevard – Bild 1', 0),
  (md5('image-bh-1038-i2')::uuid, md5('property-bh-1038')::uuid, 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1200&q=75', 'Gastronomiefläche am Überseeboulevard – Bild 2', 1),
  (md5('image-bh-1038-i3')::uuid, md5('property-bh-1038')::uuid, 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=75', 'Gastronomiefläche am Überseeboulevard – Bild 3', 2),
  (md5('image-bh-1038-i4')::uuid, md5('property-bh-1038')::uuid, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=75', 'Gastronomiefläche am Überseeboulevard – Bild 4', 3);

-- Neubau-Büroflächen am Baakenhafen
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1039')::uuid, 'Baakenhafen Office', 'Baakenallee', '12', '20457', 'hafencity', extensions.st_setsrid(extensions.st_makepoint(9.994036, 53.544102), 4326)::extensions.geography, 'city', 2027, null, 9, array['neubau', 'wasserblick', 'e-ladestation', 'barrierefrei', 'dachterrasse']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1039')::uuid, md5('building-bh-1039')::uuid, md5('contact-c-1')::uuid, 'neubau-bueroflaechen-am-baakenhafen-bh-1039', 'BH-1039', 'Neubau-Büroflächen am Baakenhafen', 'Projektentwicklung mit DGNB-Platin-Zertifizierung, Fertigstellung 2027.', 'Projektentwicklung mit DGNB-Platin-Zertifizierung, Fertigstellung 2027. Insgesamt stehen 1.350 m² auf 3 Einheiten zur Verfügung (3. OG: 450 m², 4. OG: 450 m², 5. OG: 450 m²).

Das Gebäude aus dem Jahr 2027 verfügt über 9 Geschosse.

Die HafenCity ist Europas größtes innerstädtisches Stadtentwicklungsprojekt und verbindet moderne Architektur, Wasserlage und eine exzellente Anbindung über die U4.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, array['klimatisiert']::text[], '2026-10-18T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1039-u1')::uuid, md5('property-bh-1039')::uuid, 'Einheit A', 3, 450, null, null, '2027-09-01', null, true, 0),
  (md5('unit-bh-1039-u2')::uuid, md5('property-bh-1039')::uuid, 'Einheit B', 4, 450, null, null, '2027-09-01', null, true, 1),
  (md5('unit-bh-1039-u3')::uuid, md5('property-bh-1039')::uuid, 'Einheit C', 5, 450, null, null, '2027-09-01', null, true, 2);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1039-i1')::uuid, md5('property-bh-1039')::uuid, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=75', 'Neubau-Büroflächen am Baakenhafen – Bild 1', 0),
  (md5('image-bh-1039-i2')::uuid, md5('property-bh-1039')::uuid, 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=75', 'Neubau-Büroflächen am Baakenhafen – Bild 2', 1),
  (md5('image-bh-1039-i3')::uuid, md5('property-bh-1039')::uuid, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=75', 'Neubau-Büroflächen am Baakenhafen – Bild 3', 2),
  (md5('image-bh-1039-i4')::uuid, md5('property-bh-1039')::uuid, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&w=1200&q=75', 'Neubau-Büroflächen am Baakenhafen – Bild 4', 3),
  (md5('image-bh-1039-i5')::uuid, md5('property-bh-1039')::uuid, 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=1200&q=75', 'Neubau-Büroflächen am Baakenhafen – Bild 5', 4);

-- Büroflächen im Othmarschen Park
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1040')::uuid, null, 'Behringstraße', '16', '22763', 'othmarschen', extensions.st_setsrid(extensions.st_makepoint(9.895670, 53.552360), 4326)::extensions.geography, 'peripherie', 2000, 2018, 5, array['stellplaetze', 'kantine']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1040')::uuid, md5('building-bh-1040')::uuid, md5('contact-c-2')::uuid, 'bueroflaechen-im-othmarschen-park-bh-1040', 'BH-1040', 'Büroflächen im Othmarschen Park', 'Campus-Büros im Grünen mit hervorragender Anbindung an die A7.', 'Campus-Büros im Grünen mit hervorragender Anbindung an die A7. Die Bürofläche umfasst 520 m² im 2. OG.

Das 2000 errichtete Gebäude wurde 2018 umfassend modernisiert und verfügt über 5 Geschosse.

Othmarschen im Bezirk Altona bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', true, '{}'::text[], '2026-09-22T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1040-u1')::uuid, md5('property-bh-1040')::uuid, 'Gesamtfläche', 2, 520, 16.5, 3, null, null, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1040-i1')::uuid, md5('property-bh-1040')::uuid, 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=75', 'Büroflächen im Othmarschen Park – Bild 1', 0),
  (md5('image-bh-1040-i2')::uuid, md5('property-bh-1040')::uuid, 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=75', 'Büroflächen im Othmarschen Park – Bild 2', 1),
  (md5('image-bh-1040-i3')::uuid, md5('property-bh-1040')::uuid, 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=1200&q=75', 'Büroflächen im Othmarschen Park – Bild 3', 2),
  (md5('image-bh-1040-i4')::uuid, md5('property-bh-1040')::uuid, 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=75', 'Büroflächen im Othmarschen Park – Bild 4', 3),
  (md5('image-bh-1040-i5')::uuid, md5('property-bh-1040')::uuid, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=75', 'Büroflächen im Othmarschen Park – Bild 5', 4);

-- Praxis- oder Bürofläche in Hamm
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1041')::uuid, null, 'Hammer Landstraße', '91', '20537', 'hamm', extensions.st_setsrid(extensions.st_makepoint(10.053776, 53.552325), 4326)::extensions.geography, 'peripherie', 1962, 2011, 5, array['oepnv-nah']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1041')::uuid, md5('building-bh-1041')::uuid, md5('contact-c-4')::uuid, 'praxis-oder-bueroflaeche-in-hamm-bh-1041', 'BH-1041', 'Praxis- oder Bürofläche in Hamm', 'Preiswerte Fläche mit flexiblem Grundriss, U-Bahn vor der Tür.', 'Preiswerte Fläche mit flexiblem Grundriss, U-Bahn vor der Tür. Die Praxisfläche umfasst 130 m² im 1. OG.

Das 1962 errichtete Gebäude wurde 2011 umfassend modernisiert und verfügt über 5 Geschosse.

Hamm im Bezirk Hamburg-Mitte bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'praxis', 'published', true, '{}'::text[], '2026-08-31T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1041-u1')::uuid, md5('property-bh-1041')::uuid, 'Gesamtfläche', 1, 130, 12, 2, null, 4, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1041-i1')::uuid, md5('property-bh-1041')::uuid, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=75', 'Praxis- oder Bürofläche in Hamm – Bild 1', 0),
  (md5('image-bh-1041-i2')::uuid, md5('property-bh-1041')::uuid, 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=75', 'Praxis- oder Bürofläche in Hamm – Bild 2', 1),
  (md5('image-bh-1041-i3')::uuid, md5('property-bh-1041')::uuid, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=75', 'Praxis- oder Bürofläche in Hamm – Bild 3', 2),
  (md5('image-bh-1041-i4')::uuid, md5('property-bh-1041')::uuid, 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=1200&q=75', 'Praxis- oder Bürofläche in Hamm – Bild 4', 3),
  (md5('image-bh-1041-i5')::uuid, md5('property-bh-1041')::uuid, 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=75', 'Praxis- oder Bürofläche in Hamm – Bild 5', 4);

-- Büroflächen am Alsterdorfer Markt
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1042')::uuid, null, 'Hindenburgstraße', '49', '22297', 'alsterdorf', extensions.st_setsrid(extensions.st_makepoint(10.010397, 53.608560), 4326)::extensions.geography, 'peripherie', 1993, null, 4, array['stellplaetze', 'barrierefrei']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1042')::uuid, md5('building-bh-1042')::uuid, md5('contact-c-2')::uuid, 'bueroflaechen-am-alsterdorfer-markt-bh-1042', 'BH-1042', 'Büroflächen am Alsterdorfer Markt', 'Ruhige Bürolage mit Parkplätzen direkt am Haus.', 'Ruhige Bürolage mit Parkplätzen direkt am Haus. Die Bürofläche umfasst 280 m² im 2. OG.

Das Gebäude aus dem Jahr 1993 verfügt über 4 Geschosse.

Alsterdorf im Bezirk Hamburg-Nord bietet eine gute Infrastruktur und eine solide Anbindung an das Hamburger Verkehrsnetz.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, '{}'::text[], '2026-09-14T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1042-u1')::uuid, md5('property-bh-1042')::uuid, 'Gesamtfläche', 2, 280, 14.5, 2.5, null, 8, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1042-i1')::uuid, md5('property-bh-1042')::uuid, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Alsterdorfer Markt – Bild 1', 0),
  (md5('image-bh-1042-i2')::uuid, md5('property-bh-1042')::uuid, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Alsterdorfer Markt – Bild 2', 1),
  (md5('image-bh-1042-i3')::uuid, md5('property-bh-1042')::uuid, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Alsterdorfer Markt – Bild 3', 2),
  (md5('image-bh-1042-i4')::uuid, md5('property-bh-1042')::uuid, 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Alsterdorfer Markt – Bild 4', 3),
  (md5('image-bh-1042-i5')::uuid, md5('property-bh-1042')::uuid, 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=75', 'Büroflächen am Alsterdorfer Markt – Bild 5', 4);

-- Smart Office an den Großen Bleichen
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1043')::uuid, null, 'Große Bleichen', '23', '20354', 'neustadt', extensions.st_setsrid(extensions.st_makepoint(9.979895, 53.551069), 4326)::extensions.geography, 'city', 1999, 2022, 7, array['aufzug', 'empfang']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1043')::uuid, md5('building-bh-1043')::uuid, md5('contact-c-1')::uuid, 'smart-office-an-den-grossen-bleichen-bh-1043', 'BH-1043', 'Smart Office an den Großen Bleichen', 'Voll ausgestattete Kompaktfläche für kleine Teams in Top-Citylage.', 'Voll ausgestattete Kompaktfläche für kleine Teams in Top-Citylage. Die Bürofläche umfasst 95 m² im 2. OG.

Das 1999 errichtete Gebäude wurde 2022 umfassend modernisiert und verfügt über 7 Geschosse.

Zwischen Jungfernstieg und Gänsemarkt liegen hier Hamburgs exklusivste Geschäftsadressen, Banken und Kanzleien.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', true, array['klimatisiert']::text[], '2026-10-19T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1043-u1')::uuid, md5('property-bh-1043')::uuid, 'Gesamtfläche', 2, 95, 29, 5, null, 3, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1043-i1')::uuid, md5('property-bh-1043')::uuid, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&w=1200&q=75', 'Smart Office an den Großen Bleichen – Bild 1', 0),
  (md5('image-bh-1043-i2')::uuid, md5('property-bh-1043')::uuid, 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=1200&q=75', 'Smart Office an den Großen Bleichen – Bild 2', 1),
  (md5('image-bh-1043-i3')::uuid, md5('property-bh-1043')::uuid, 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=75', 'Smart Office an den Großen Bleichen – Bild 3', 2),
  (md5('image-bh-1043-i4')::uuid, md5('property-bh-1043')::uuid, 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1200&q=75', 'Smart Office an den Großen Bleichen – Bild 4', 3),
  (md5('image-bh-1043-i5')::uuid, md5('property-bh-1043')::uuid, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=75', 'Smart Office an den Großen Bleichen – Bild 5', 4);

-- Büroetage am Ballindamm mit Alsterblick
insert into buildings (id, name, street, house_number, postal_code, district_slug, location, location_class, year_built, year_renovated, floors, features) values (md5('building-bh-1044')::uuid, null, 'Ballindamm', '17', '20095', 'altstadt', extensions.st_setsrid(extensions.st_makepoint(10.003686, 53.547916), 4326)::extensions.geography, 'city', 1922, 2021, 7, array['wasserblick', 'aufzug', 'empfang', 'denkmalschutz']::text[]);
insert into properties (id, building_id, contact_id, slug, reference_number, title, teaser, description, category, property_type, status, commission_free, features, published_at) values (md5('property-bh-1044')::uuid, md5('building-bh-1044')::uuid, md5('contact-c-1')::uuid, 'bueroetage-am-ballindamm-mit-alsterblick-bh-1044', 'BH-1044', 'Büroetage am Ballindamm mit Alsterblick', 'Repräsentative Etage mit Blick auf die Binnenalster.', 'Repräsentative Etage mit Blick auf die Binnenalster. Die Bürofläche umfasst 580 m² im 6. OG.

Das 1922 errichtete Gebäude wurde 2021 umfassend modernisiert und verfügt über 7 Geschosse.

Die Altstadt bildet das wirtschaftliche Herz Hamburgs – mit Rathaus, Binnenalster, Kontorhausviertel und einer hervorragenden ÖPNV-Anbindung.

Gerne stellen wir Ihnen die Fläche persönlich vor und erarbeiten mit dem Eigentümer ein auf Ihre Anforderungen zugeschnittenes Ausbaukonzept.', 'buero-praxis', 'buero', 'published', false, array['klimatisiert']::text[], '2026-10-12T09:00:00.000Z');
insert into rental_units (id, property_id, label, floor, area_sqm, rent_per_sqm, service_charge_per_sqm, available_from, rooms, divisible, sort_order) values
  (md5('unit-bh-1044-u1')::uuid, md5('property-bh-1044')::uuid, 'Gesamtfläche', 6, 580, 30.5, 5.5, null, 13, false, 0);
insert into property_images (id, property_id, url, alt, sort_order) values
  (md5('image-bh-1044-i1')::uuid, md5('property-bh-1044')::uuid, 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=75', 'Büroetage am Ballindamm mit Alsterblick – Bild 1', 0),
  (md5('image-bh-1044-i2')::uuid, md5('property-bh-1044')::uuid, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=75', 'Büroetage am Ballindamm mit Alsterblick – Bild 2', 1),
  (md5('image-bh-1044-i3')::uuid, md5('property-bh-1044')::uuid, 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=75', 'Büroetage am Ballindamm mit Alsterblick – Bild 3', 2),
  (md5('image-bh-1044-i4')::uuid, md5('property-bh-1044')::uuid, 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=75', 'Büroetage am Ballindamm mit Alsterblick – Bild 4', 3),
  (md5('image-bh-1044-i5')::uuid, md5('property-bh-1044')::uuid, 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&w=1200&q=75', 'Büroetage am Ballindamm mit Alsterblick – Bild 5', 4);

commit;
