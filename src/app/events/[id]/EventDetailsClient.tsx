'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/authContext';
import QRCode from 'qrcode';
import Image from 'next/image';
import TopBar from '@/components/TopBar';
import {
    Calendar,
    Users,
    AlertTriangle,
    XCircle,
    CheckCircle,
    Ticket,
    Tag,
} from 'lucide-react';

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
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
    createdAt: string;
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

    if (!event) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
                Loading event details...
            </div>
        );
    }

    const handleBooking = async () => {
        if (!user) {
            setMessage('You must be logged in to book.');
            return;
        }

        const { data: bookedSeatsData, error: bookedError } = await supabase
            .from('bookings')
            .select('seatsBooked')
            .eq('eventId', event.id);

        if (bookedError) {
            setMessage(bookedError.message);
            return;
        }

        const totalBooked =
            bookedSeatsData?.reduce((sum, b) => sum + b.seatsBooked, 0) ?? 0;

        if (totalBooked + seats > event.totalSeats) {
            setMessage('Not enough seats available.');
            return;
        }

        const { data, error } = await supabase.rpc('createBooking', {
            puserid: user.id,
            peventid: event.id,
            pseats: seats,
        });

        if (error) {
            setMessage(`Booking failed: ${error.message}`);
        } else {
            const bookingData: Booking = data[0];
            setMessage('Booking successful!');
            const qr = await QRCode.toDataURL(bookingData.id);
            setQrCode(qr);
        }
    };

    return (
        <div className="relative min-h-screen p-6">
            <TopBar />
            <div className="max-w-3xl mx-auto px-4 py-20">
                <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6">
                    {/* Event Info */}
                    <h1 className="text-3xl font-bold text-white">{event.title}</h1>
                    <p className="text-gray-300 mt-2">{event.description}</p>

                    <div className="mt-4 space-y-2 text-white">
                        <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-400" />{' '}
                            <span className="font-medium">{event.eventDate}</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-green-400" /> Price:{' '}
                            <span className="font-medium">₹{event.price}</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-yellow-400" /> Total Seats:{' '}
                            <span className="font-medium">{event.totalSeats}</span>
                        </p>
                    </div>

                    {/* Booking Section */}
                    <div className="mt-6 border-t pt-4">
                        {user ? (
                            <div className="flex items-center gap-4 text-white">
                                <input
                                    type="number"
                                    min={1}
                                    max={event.totalSeats}
                                    value={seats}
                                    onChange={(e) => setSeats(Number(e.target.value))}
                                    className="w-20 p-2 border rounded-lg text-center"
                                />
                                <button
                                    onClick={handleBooking}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
                                >
                                    Book Now
                                </button>
                            </div>
                        ) : (
                            <p className="text-red-500 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Please log in to book tickets.
                            </p>
                        )}

                        {message && (
                            <p className="mt-3 text-sm text-gray-400 font-medium flex items-center gap-2">
                                {message.includes('failed') && <XCircle className="w-4 h-4 text-red-500" />}
                                {message.includes('successful') && <CheckCircle className="w-4 h-4 text-green-500" />}
                                {message}
                            </p>
                        )}
                    </div>

                    {/* QR Code Section */}
                    {qrCode && (
                        <div className="mt-6 p-4 border rounded-lg bg-gray-800/50 backdrop-blur-md text-center">
                            <h2 className="text-lg font-semibold text-gray-300 mb-2 flex items-center justify-center gap-2">
                                <Ticket className="w-5 h-5 text-indigo-400" /> Your Booking QR Code
                            </h2>
                            <Image
                                loader={() => qrCode!}
                                src={qrCode!}
                                alt="Booking QR Code"
                                width={200}
                                height={200}
                                className="mx-auto"
                            />
                            <p className="text-sm text-gray-400 mt-2">
                                Show this code at the event entrance.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
