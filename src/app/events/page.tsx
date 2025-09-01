import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

export default async function HomePage() {
  // Fetch data directly on the server
  const { data: events, error } = await supabase.from("events").select("*").limit(5)

  if (error) {
    return <div className="p-6 text-red-500">Error: {error.message}</div>
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Upcoming Events 🎫</h1>
      <ul className="space-y-3">
        {events?.map((event) => (
          <li
            key={event.id}
            className="p-4 border rounded-xl shadow-sm hover:shadow-md transition"
          >
            <Link href={`/events/${event.id}`} className="block">
              <h2 className="text-xl font-semibold text-white-600 cursor-pointer">
                {event.title}
              </h2>
              <p className="text-gray-600">{event.description}</p>
              <p className="text-sm text-gray-500">
                📅 {event.eventDate} | 📍 {event.location}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
