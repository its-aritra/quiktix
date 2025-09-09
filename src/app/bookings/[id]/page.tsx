// src/app/bookings/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import QRCode from 'qrcode';
import Image from 'next/image';

interface BookingDetail {
  id: string;
  seatsBooked: number;
  status: string;
  createdAt: string;
  events: {
    title: string | null;
    eventDate?: string | null;
    location?: string | null;
  } | null;
}

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(
          `
          id,
          seatsBooked,
          status,
          createdAt,
          events!inner(
            title,
            eventDate,
            location
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        console.error(error);
      } else if (data) {
        setBooking(data as unknown as BookingDetail);
        // generate QR code from booking ID
        const qr = await QRCode.toDataURL(data.id);
        setQrCode(qr);
      }
      setLoading(false);
    };

    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Loading ticket...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Booking not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg max-w-md w-full text-center border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">
          🎟️ {booking.events?.title ?? 'Unknown Event'}
        </h2>

        <div className="mb-6 flex flex-col gap-1 text-gray-300 text-sm">
          <p><span className="font-medium">Seats:</span> {booking.seatsBooked}</p>
          <p><span className="font-medium">Status:</span> {booking.status}</p>
          <p><span className="font-medium">Booked On:</span> {new Date(booking.createdAt).toLocaleString()}</p>
          {booking.events?.eventDate && (
            <p><span className="font-medium">Event Date:</span> {new Date(booking.events.eventDate).toLocaleDateString()}</p>
          )}
          {booking.events?.location && (
            <p><span className="font-medium">Location:</span> {booking.events.location}</p>
          )}
        </div>

        {/* QR Code */}
        {qrCode && (
          <div className="bg-white p-4 rounded-xl inline-block shadow-md">
            <Image
              loader={() => qrCode}
              src={qrCode}
              alt="Booking QR Code"
              width={180}
              height={180}
              className="mx-auto"
            />
          </div>
        )}

        <button
          onClick={() => window.print()}
          className="mt-6 w-full py-2 rounded-lg border border-indigo-500/50 text-white hover:border-indigo-400 transition"
        >
          Download / Print Ticket
        </button>
      </div>
    </div>
  );
}
