'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/authContext';
import QRCode from 'qrcode';
import Image from 'next/image';

interface Event {
    id: string;
    title: string;
    description: string;
    eventDate: string;
    price: number;
    totalSeats: number;
}

interface Booking {
  id: string;
  userId: string;
  eventId: string;
  seatsBooked: number;
  status: "CONFIRMED" | "PENDING" | "CANCELLED"; // adjust if more statuses exist
  createdAt: string; // or Date if you parse it
}

export default function EventDetailsClient({ eventId }: { eventId: string }) {
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [seats, setSeats] = useState(1);
    const [message, setMessage] = useState('');
    const [qrCode, setQrCode] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', eventId)
                .single();

            if (error) {
                setMessage(error.message);
            } else {
                setEvent(data);
            }
        };

        fetchEvent();
    }, [eventId]);

    if (!event) return <p>Loading...</p>;

    const handleBooking = async () => {
        if (!user) {
            setMessage('You must be logged in to book.');
            return;
        }

        // Check seats already booked
        const { data: bookedSeatsData, error: bookedError } = await supabase
            .from('bookings')
            .select('seatsBooked')
            .eq('eventId', event.id);

        if (bookedError) {
            setMessage(bookedError.message);
            return;
        }

        const totalBooked = bookedSeatsData?.reduce(
            (sum, b) => sum + b.seatsBooked,
            0
        ) ?? 0;

        if (totalBooked + seats > event.totalSeats) {
            setMessage('Not enough seats available.');
            return;
        }

        // Call createBooking RPC
        const { data, error } = await supabase.rpc("createBooking", {
            puserid: user.id,
            peventid: event.id,
            pseats: seats,
        });

        if (error) {
            setMessage(`Booking failed: ${error.message}`);
        } else {
            setMessage('Booking successful!');
            // Generate QR code from the booking ID
            const bookingData : Booking = data[0];
            const bookingId = bookingData.id;
            if (bookingData) {
                const qr = await QRCode.toDataURL(bookingId);
                setQrCode(qr);
            }
        }
    };

    return (
        <div>
            <h1>{event.title}</h1>
            <p>{event.description}</p>
            <p>Date: {event.eventDate}</p>
            <p>Price: ₹{event.price}</p>
            <p>Seats available: {event.totalSeats}</p>

            <div style={{ marginTop: '1rem' }}>
                {user ? (
                    <>
                        <input
                            type="number"
                            min={1}
                            max={event.totalSeats}
                            value={seats}
                            onChange={(e) => setSeats(Number(e.target.value))}
                        />
                        <button onClick={handleBooking}>Book Now</button>
                    </>
                ) : (
                    <p>Please log in to book.</p>
                )}
                {message && <p>{message}</p>}
            </div>

            {qrCode && (
                <div style={{ marginTop: '1rem' }}>
                    <h2>Your Booking QR Code:</h2>
                    <Image
                        loader={() => qrCode!} // Base64 string
                        src={qrCode!}
                        alt="Booking QR Code"
                        width={200}
                        height={200}
                    />
                </div>
            )}
        </div>
    );
}
