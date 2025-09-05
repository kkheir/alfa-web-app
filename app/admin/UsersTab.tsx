'use client';

import UserManagement from './UserManagement';

type UsersTabProps = {
  initialUsers: any[];
};

export default function UsersTab({ initialUsers }: UsersTabProps) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          User Management
        </h2>
        <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
      </div>
      <UserManagement initialUsers={initialUsers} />
    </div>
  );
}
