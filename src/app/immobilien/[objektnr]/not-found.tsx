import { NotFoundView } from "@/components/layout/not-found-view";

export default function ListingNotFound() {
  return (
    <NotFoundView
      title="Dieses Objekt ist nicht mehr verfügbar"
      text="Möglicherweise wurde die Fläche bereits vermietet. Über unsere Suche finden Sie weitere Angebote in Hamburg."
    />
  );
}
