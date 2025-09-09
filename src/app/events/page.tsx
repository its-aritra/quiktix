import TopBar from "@/components/TopBar";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Calendar, MapPin, Ticket, Tag } from "lucide-react";

export default async function EventPage() {
  // Fetch data directly on the server
  const { data: events, error } = await supabase.from("events").select("*").limit(9);

  if (error) {
    return <div className="p-6 text-red-500">Error: {error.message}</div>;
  }

  return (
    <main className="relative min-h-screen p-6">
      {/* Top navigation bar */}
      <TopBar />

      <div className="mt-16 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-20 text-center flex items-center justify-center gap-2">
          <Ticket className="w-10 h-10 text-yellow-400" /> Upcoming Events
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events?.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition border border-gray-700 hover:border-indigo-500"
            >
              <h2 className="text-2xl font-semibold text-indigo-400 group-hover:text-indigo-300 transition">
                {event.title}
              </h2>
              <p className="text-gray-300 mt-2 line-clamp-2">{event.description}</p>
              <div className="mt-4 text-sm text-gray-400 space-y-1">
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {new Date(event.eventDate).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  {event.location}
                </p>
                {event.price !== undefined && (
                  <p className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-400" />
                    {event.price} {/* Keep it generic */}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
