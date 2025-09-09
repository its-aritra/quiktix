'use client';

import ProfileSection from '@/components/ProfileSection';
import BookingsSection from '@/components/BookingsSection';

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        <ProfileSection />
        <BookingsSection />
      </div>
    </div>
  );
}
