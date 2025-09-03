import EventDetailsClient from "./EventDetailsClient";

interface Props {
  params: { id: string };
}

export default async function EventDetailsPage({ params }: Props) {
  const eventId = params.id;
  return <EventDetailsClient eventId={eventId} />;
}
