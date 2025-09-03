'use client';

import { useState } from 'react';
import { useAuth } from '@/context/authContext';

export default function SignupPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async () => {
    try {
      await signUp(email, password, fullName);
      setMessage('Signup successful! Check your email to confirm.');
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('Something went wrong');
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-black to-gray-900 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Join Quiktix 🚀</h1>
        <p className="text-gray-400 text-center mb-6">
          Discover, book, and enjoy the best events near you
        </p>

        <div className="space-y-4">
          <input
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSignup}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow-md"
          >
            Sign Up
          </button>
        </div>

        {message && <p className="mt-4 text-center text-sm text-gray-300">{message}</p>}

        <p className="mt-6 text-gray-400 text-sm text-center">
          Already have an account?{" "}
          <a href="/auth/login" className="text-indigo-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </main>
  );
}
