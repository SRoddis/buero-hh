import type { PropertyType } from "@/lib/constants";

/** Unsplash-Foto-IDs (frei nutzbar) gruppiert nach Motiv. */
const POOLS = {
  office: [
    "1497366216548-37526070297c",
    "1497366811353-6870744d04b2",
    "1524758631624-e2822e304c36",
    "1497215728101-856f4ea42174",
    "1504384308090-c894fdcc538d",
    "1497366754035-f200968a6e72",
    "1531973576160-7125cd663d86",
    "1556761175-b413da4baf72",
    "1600508774634-4e11d34730e2",
    "1462826303086-329426d1aef5",
    "1517502884422-41eaead166d4",
    "1527192491265-7e15c55b1ed2",
    "1505409859467-3a796fd5798e",
    "1577412647305-991150c7d163",
    "1604328698692-f76ea9498e76",
    "1606857521015-7f9fcf423740",
    "1497366412874-3415097a27e7",
    "1572025442646-866d16c84a54",
    "1567521464027-f127ff144326",
  ],
  building: [
    "1486406146926-c627a92ad1ab",
    "1449157291145-7efd050a4d0e",
    "1545324418-cc1a3fa10c00",
    "1554469384-e58fac16e23a",
    "1479839672679-a46483c0e7c8",
    "1487958449943-2429e8be8625",
    "1574958269340-fa927503f3dd",
    "1464938050520-ef2270bb8ce8",
  ],
  retail: [
    "1441986300917-64674bd600d8",
    "1567401893414-76b7b1e5a7a5",
    "1528698827591-e19ccd7bc23d",
    "1481437156560-3205f6a55735",
    "1556740758-90de374c12ad",
    "1519567241046-7f570eee3ce6",
  ],
  gastro: [
    "1555396273-367ea4eb4db5",
    "1517248135467-4c7edcad34c4",
    "1559329007-40df8a9345d8",
    "1414235077428-338989a2e8c0",
    "1551632436-cbf8dd35adfa",
    "1497644083578-611b798c60f3",
  ],
  praxis: [
    "1519494026892-80bbd2d6fd0d",
    "1629909613654-28e377c37b09",
    "1533090161767-e6ffed986c88",
    "1586023492125-27b2c045efd7",
    "1513694203232-719a280e022f",
    "1519710164239-da123dc03ef4",
  ],
  lager: [
    "1586528116311-ad8dd3c8310d",
    "1553413077-190dd305871c",
    "1565793298595-6a879b1d9492",
  ],
};

const TYPE_POOLS: Record<PropertyType, (keyof typeof POOLS)[]> = {
  buero: ["office", "office", "building", "office", "office"],
  praxis: ["praxis", "praxis", "office", "building", "praxis"],
  laden: ["retail", "retail", "building", "retail"],
  gastro: ["gastro", "gastro", "gastro", "building"],
  lager: ["lager", "lager", "lager", "building"],
};

export function unsplashUrl(id: string, width = 1200) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`;
}

/** Liefert deterministisch eine Bildfolge passend zur Objektart. */
export function imagesFor(type: PropertyType, seed: number, count = 5): string[] {
  const order = TYPE_POOLS[type];
  const used = new Set<string>();
  const result: string[] = [];
  for (let i = 0; result.length < count && i < count * 4; i++) {
    const pool = POOLS[order[i % order.length]];
    const id = pool[(seed * 7 + i * 3) % pool.length];
    if (!used.has(id)) {
      used.add(id);
      result.push(unsplashUrl(id));
    }
  }
  return result;
}
