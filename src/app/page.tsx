import TopBar from "@/components/TopBar";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Top navigation bar */}
      <TopBar />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Welcome to <span className="text-indigo-400">Quiktix 🎟️</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10">
          Your one-stop destination to discover, book, and enjoy the best events
          around you. Simple, fast, and secure ticketing made easy.
        </p>

        <Link
          href="/events"
          className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-semibold shadow-lg transition"
        >
          Take me to the Events 🚀
        </Link>
      </section>

      {/* Optional: Highlight Section */}
      <section className="bg-gray-800/50 backdrop-blur-md py-12 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Why Quiktix?</h2>
        <p className="text-gray-300 max-w-3xl mx-auto">
          Seamless booking experience, secure payments, instant QR code
          confirmation, and easy event management. Quiktix makes event ticketing
          hassle-free so you can focus on enjoying the show!
        </p>
      </section>
    </main>
  );
}
