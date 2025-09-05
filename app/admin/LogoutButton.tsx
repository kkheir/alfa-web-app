"use client";

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
      alert('Logout failed');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-6 py-2 font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 shadow-lg hover:shadow-xl"
    >
      Logout
    </button>
  );
}
