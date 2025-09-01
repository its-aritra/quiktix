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
        <div>
            <input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleSignup}>Sign Up</button>
            {message && <p>{message}</p>}
        </div>
    );
}
