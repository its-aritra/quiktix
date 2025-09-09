// src/app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/context/authContext"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Quiktix",
  description: "Event booking made simple",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-800 via-black to-indigo-950 text-gray-100 antialiased`}
      >
        <AuthProvider initialSession={session}>
          <div className="relative min-h-screen flex flex-col">{children}</div>
        </AuthProvider>
      </body>
    </html>
  )
}
