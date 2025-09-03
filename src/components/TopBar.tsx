"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

export default function TopBar() {
    const [user, setUser] = useState<User | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
        const { data: subscription } = supabase.auth.onAuthStateChange(
            (_event, session) => setUser(session?.user ?? null)
        );
        return () => subscription.subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <header className="absolute top-0 left-0 w-full px-6 py-4 flex items-center justify-between">
            {/* Left side (brand or spacer) */}
            <div className="min-w-[120px]">
                {pathname !== "/" && (
                    <Link
                        href="/"
                        className="text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        QuikTix
                    </Link>
                )}
            </div>

            {/* Right side (auth buttons styled like cards) */}
            <div className="flex items-center gap-4 ml-auto">
                {!user ? (
                    <>
                        <Link
                            href="/auth/login"
                            className="px-5 py-2 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-md hover:shadow-lg hover:border-indigo-400 transition-all"
                        >
                            Login
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="px-5 py-2 rounded-2xl bg-indigo-600/80 backdrop-blur-lg border border-indigo-400/30 text-white shadow-md hover:bg-indigo-700/80 hover:shadow-lg transition-all"
                        >
                            Sign Up
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            href="/dashboard"
                            className="px-5 py-2 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-md hover:shadow-lg hover:border-indigo-400 transition-all"
                        >
                            Dashboard
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="px-5 py-2 rounded-2xl bg-red-600/80 backdrop-blur-lg border border-red-400/30 text-white shadow-md hover:bg-red-700/80 hover:shadow-lg transition-all cursor-pointer"
                        >
                            Sign Out
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
