'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserManagement from './UserManagement';
import DashboardStats from './DashboardStats';
import { Users } from 'lucide-react';

type UsersTabProps = {
  initialUsers: any[];
};

export default function UsersTab({ initialUsers }: UsersTabProps) {
  // Calculate stats from the users array
  const userCount = initialUsers.length;
  const adminCount = initialUsers.filter(user => user.isAdmin).length;

  return (
    <div className="space-y-6 p-6">
      {/* Dashboard Stats */}
      <DashboardStats 
        userCount={userCount}
        adminCount={adminCount}
        dataCount={42} // Placeholder - replace with actual data count
        distributionCount={15} // Placeholder - replace with actual distribution count
      />
      
      {/* User Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage system users and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagement initialUsers={initialUsers} />
        </CardContent>
      </Card>
    </div>
  );
}
