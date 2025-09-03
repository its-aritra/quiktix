'use client';

import { useAuth } from '@/context/authContext';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Image from 'next/image';

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

export default function Dashboard() {
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Please log in to access your dashboard.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">

        {/* Profile Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">👤 Profile</h2>
          <div className="flex items-center gap-4">
            <Image
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.fullName || user.email
              )}&background=random`}
              alt="Profile Avatar"
              width={64}
              height={64}
              className="rounded-full"
            />
            <div>
              <p className="text-white font-semibold">{user.fullName ?? 'Unnamed User'}</p>
              <p className="text-gray-300 text-sm">{user.email}</p>
            </div>
          </div>
          <button className="mt-6 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
            Edit Profile
          </button>
        </div>

        {/* Bookings Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">🎟️ My Bookings</h2>
          {loading ? (
            <p className="text-gray-400">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-400">No bookings found.</p>
          ) : (
            <ul className="space-y-4 max-h-200 overflow-y-auto pr-2">
              {bookings.map((b) => (
                <li
                  key={b.id}
                  className="bg-white/5 p-4 rounded-lg border border-white/10"
                >
                  <p className="text-white font-medium">{b.eventTitle}</p>
                  <p className="text-sm text-gray-400">
                    Seats: {b.seatsBooked} | Status: {b.status}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(b.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
