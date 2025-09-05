'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch('/api/logout', {
      method: 'POST',
    });

    if (res.ok) {
      router.push('/login');
    } else {
      console.error('Logout failed');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full px-6 py-3 font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
    >
      Logout
    </button>
  );
}
