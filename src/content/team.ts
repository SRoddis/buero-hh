/**
 * Team für „Über uns“ – übernommen von buerohamburg.de/ueber-uns.php (dort ebenfalls statisch hinterlegt).
 * Fotos unter public/images/ueber-uns/; alle erreichbar über die Zentrale (COMPANY.phone).
 */
export interface TeamMember {
  name: string;
  role: string;
  email: string;
  image: string;
}

export const TEAM: TeamMember[] = [
  {
    name: "Ulf von der Heydt",
    role: "Geschäftsführer",
    email: "u.heydt@buerohamburg.de",
    image: "/images/ueber-uns/ulf-von-der-heydt.webp",
  },
  {
    name: "Claudia Treise",
    role: "Immobilienberaterin für Gewerbeflächen",
    email: "c.treise@buerohamburg.de",
    image: "/images/ueber-uns/claudia-treise.webp",
  },
  {
    name: "Moritz Thonet",
    role: "Immobilienberater für Gewerbeflächen",
    email: "m.thonet@buerohamburg.de",
    image: "/images/ueber-uns/moritz-thonet.webp",
  },
  {
    name: "Lennart Tscheu",
    role: "Immobilienberater für Gewerbeflächen",
    email: "l.tscheu@buerohamburg.de",
    image: "/images/ueber-uns/lennart-tscheu.webp",
  },
  {
    name: "Yvonne Riesel",
    role: "Vermietung Bürocenter / Teamassistenz",
    email: "y.riesel@buerohamburg.de",
    image: "/images/ueber-uns/yvonne-riesel.webp",
  },
  {
    name: "Claudia Gottschewski",
    role: "Teamassistenz",
    email: "c.gottschewski@buerohamburg.de",
    image: "/images/ueber-uns/claudia-gottschewski.webp",
  },
];
