'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/authContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User as UserIcon } from 'lucide-react';

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
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

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
        setMessage('');

        try {
            // Update full name in "users" table
            const { error: userError } = await supabase
                .from('users')
                .update({ fullName })
                .eq('id', user.id);

            if (userError) throw userError;

            // Handle email change
            if (email && email !== user.email) {
                const { error: emailError } = await supabase.auth.updateUser({
                    email,
                });
                if (emailError) throw emailError;

                setMessage('📩 Verification link sent to your new email.');
            } else {
                setMessage('✅ Profile updated successfully!');
            }
        } catch (err) {
            if (err instanceof Error) {
                setMessage(`❌ ${err.message}`);
            } else {
                setMessage('❌ Unknown error occurred');
            }
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
                <p className="mt-4 text-sm text-center text-gray-300">{message}</p>
            )}
        </div>
    );
}
