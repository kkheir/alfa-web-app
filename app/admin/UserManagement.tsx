'use client';

import { useState } from 'react';

type User = {
  id: number;
  username: string;
};

type UserManagementProps = {
  initialUsers: User[];
};

export default function UserManagement({ initialUsers }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // State for editing password
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsers([...users, data.user]);
        setUsername('');
        setPassword('');
        setMessage(`User "${data.user.username}" created successfully.`);
      } else {
        setError(data.message || 'Failed to create user.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setError('');
    setMessage('');
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers(users.filter(user => user.id !== userId));
        setMessage('User deleted successfully.');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete user.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      
      if (res.ok) {
        setEditingUser(null);
        setNewPassword('');
        setMessage(`Password for "${editingUser.username}" updated successfully.`);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update password.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div>
      {/* Add User Form */}
      <div className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New User
        </h2>
        <form onSubmit={handleAddUser}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded">
              <p className="text-sm">{error}</p>
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 text-green-700 rounded">
              <p className="text-sm">{message}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Add User
            </button>
          </div>
        </form>
      </div>

      {/* User List */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          Manage Users
        </h2>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800 text-lg">{user.username}</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingUser(user)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Edit Password
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 text-lg">No users found</p>
              <p className="text-gray-400 text-sm">Add your first user using the form above</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Password Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="p-8 bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Edit Password</h2>
              <p className="text-gray-600">Update password for <span className="font-semibold text-blue-600">{editingUser.username}</span></p>
            </div>
            <form onSubmit={handleUpdatePassword}>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-gray-700" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter new password"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => { setEditingUser(null); setNewPassword(''); }}
                  className="px-6 py-3 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
