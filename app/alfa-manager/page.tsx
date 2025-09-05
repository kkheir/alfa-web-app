import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '../../lib/auth';
import LogoutButton from './LogoutButton';

async function getAuth() {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;

  const decoded = await verifyToken(token);
  return decoded as { userId: number; username: string; isAdmin: boolean } | null;
}

export default async function AlfaManagerPage() {
  const user = await getAuth();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Alfa Manager</h1>
          <p className="text-green-100">Welcome to your dashboard</p>
        </div>
        
        {/* Content area */}
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-800 mb-2">Hello, {user.username}!</p>
            <p className="text-gray-600">You have access to the Alfa Manager dashboard</p>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Your role: <span className="font-semibold text-green-600">Alfa Manager</span></p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
