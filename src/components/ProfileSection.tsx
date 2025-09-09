'use client';

import { JSX, useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/authContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { updateEmail } from '@/app/actions/updateEmail';
import { User as UserIcon, CheckCircle, Mail, Info, AlertCircle } from 'lucide-react';


interface AppUser {
    id: string;
    email: string;
    fullName?: string;
}

export default function ProfileSection() {
    const { user } = useAuth() as { user: AppUser | null };
    const supabase = createClientComponentClient();

    const [fullName, setFullName] = useState(user?.fullName ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [message, setMessage] = useState<JSX.Element | null>(null);
    const [loading, setLoading] = useState(false);

    // Sync state with user when it becomes available
    useEffect(() => {
        if (user) {
            setFullName(user.fullName ?? '');
            setEmail(user.email ?? '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage(null);

        try {
            const messages: JSX.Element[] = [];

            // Update fullName if changed
            if (fullName?.trim() && fullName.trim() !== user.fullName) {
                const { error: userError } = await supabase
                    .from('users')
                    .update({ fullName: fullName.trim() })
                    .eq('id', user.id);

                if (userError) throw userError;

                messages.push(
                    <span key="fullName" className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" /> Profile updated successfully!
                    </span>
                );
            }

            // Update email if changed
            if (email?.trim() && email.trim() !== user.email) {
                await updateEmail(email.trim());

                const { error: userError } = await supabase
                    .from('users')
                    .update({ email: email.trim() })
                    .eq('id', user.id);

                if (userError) throw userError;

                messages.push(
                    <span className="relative w-full text-gray-300">
                        <Mail className="absolute left-0 top-1 w-4 h-4 text-blue-500 -mt-0.5" />
                        <span className="pl-5">
                            Verification links sent to old & new email. <br />
                            Confirm both to complete change.
                        </span>
                    </span>
                );
            }

            // No changes
            if (messages.length === 0) {
                messages.push(
                    <span key="info" className="flex items-center gap-1">
                        <Info className="w-4 h-4 text-gray-500" /> No changes to update.
                    </span>
                );
            }

            setMessage(<>{messages.map((m) => m)}</>);
        } catch (err) {
            setMessage(
                <span className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />{' '}
                    {err instanceof Error ? err.message : 'Unknown error occurred'}
                </span>
            );
        } finally {
            setLoading(false);
        }
    };

    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || user?.email || 'User')
        }&backgroundColor=4b46b9,1e1e2e,000000&backgroundType=gradientLinear`;

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg flex flex-col items-center">
            <h2 className="flex items-center text-xl font-bold text-white mb-6">
                <UserIcon className="w-6 h-6 text-indigo-400 mr-2" />
                Profile
            </h2>

            <Image
                src={avatarUrl}
                alt="Profile Avatar"
                width={96}
                height={96}
                className="rounded-full mb-4"
                unoptimized
            />

            <form onSubmit={handleUpdateProfile} className="w-full space-y-4">
                <div>
                    <label className="block text-sm text-gray-300">Full Name</label>
                    <input
                        type="text"
                        value={fullName} // ✅ controlled by state, initialized from user
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-2 mt-1 rounded-lg bg-gray-800/60 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-300">Email</label>
                    <input
                        type="email"
                        value={email} // ✅ controlled by state, initialized from user
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 mt-1 rounded-lg bg-gray-800/60 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>


            {message && (
                <div className="mt-4 flex flex-col items-center justify-center gap-2 text-sm text-gray-300 text-center">
                    {message}
                </div>
            )}

        </div>
    );
}
