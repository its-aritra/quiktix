'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/authContext';
import { Ticket } from 'lucide-react';

interface SupabaseBooking {
  id: string;
  seatsBooked: number;
  status: string;
  createdAt: string;
  events: {
    title: string | null;
  } | null;
}

interface Booking {
  id: string;
  eventTitle: string;
  seatsBooked: number;
  status: string;
  createdAt: string;
}

interface AppUser {
  id: string;
  email: string;
  fullName?: string;
}

export default function BookingsSection() {
  const { user } = useAuth() as { user: AppUser | null };
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(
          `
          id,
          seatsBooked,
          status,
          createdAt,
          events!inner(
            title
          )
        `
        )
        .eq('userId', user.id);

      if (error) {
        console.error(error);
      } else if (data) {
        const formatted: Booking[] = (data as unknown as SupabaseBooking[]).map((b) => ({
          id: b.id,
          seatsBooked: b.seatsBooked,
          status: b.status,
          createdAt: b.createdAt,
          eventTitle: b.events?.title ?? 'Unknown Event',
        }));
        setBookings(formatted);
      }
      setLoading(false);
    };

    fetchBookings();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg text-gray-400">
        Loading bookings...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg text-gray-400">
        Please log in to see your bookings.
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
      <h2 className="flex items-center text-xl font-bold text-white mb-6">
        <Ticket className="w-6 h-6 text-indigo-400 mr-2" />
        My Bookings
      </h2>
      {bookings.length === 0 ? (
        <p className="text-gray-400">No bookings found.</p>
      ) : (
        <ul
          className="
            space-y-4 pr-2
            md:overflow-y-auto md:max-h-[80vh]
          "
        >
          {bookings.map((b) => (
            <li key={b.id}>
              <a
                href={`/bookings/${b.id}`}
                className="block bg-white/5 p-4 rounded-lg border border-white/10 hover:border-indigo-400 transition cursor-pointer"
              >
                <p className="text-white font-medium">{b.eventTitle}</p>
                <p className="text-sm text-gray-400">
                  Seats: {b.seatsBooked} | Status: {b.status}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(b.createdAt).toLocaleString()}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
