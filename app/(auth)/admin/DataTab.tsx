'use client';

import { Database } from 'lucide-react';
import AdminDataSection from './AdminDataSection';

export default function DataTab() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center">
          <Database className="w-6 h-6 mr-2 text-emerald-600 dark:text-emerald-400" />
          Data Management
        </h2>
        <p className="text-muted-foreground mt-1">Import Excel files and manage employee data</p>
      </div>
      <AdminDataSection />
    </div>
  );
}
