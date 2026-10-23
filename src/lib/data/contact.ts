import type { Contact } from "@/lib/types";

/** Allgemeiner Kontakt, solange einem Objekt kein persönlicher Ansprechpartner zugeordnet ist. */
export const DEFAULT_CONTACT: Contact = {
  id: "default",
  name: "BüroHamburg Vermietung",
  role: "Gewerbeimmobilien in Hamburg",
  email: "kontakt@buerohamburg.de",
  phone: "+49 40 226 211 00",
  imageUrl: null,
};
