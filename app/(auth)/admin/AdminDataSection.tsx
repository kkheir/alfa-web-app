'use client';

import { useState } from 'react';
import ExcelImport from './ExcelImport';
import DataTable from './DataTable';

export default function AdminDataSection() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Excel Import Section */}
      <section>
        <ExcelImport onImportSuccess={handleDataChange} />
      </section>

      {/* Data Table Section */}
      <section>
        <DataTable key={refreshKey} onDataUpdate={handleDataChange} />
      </section>
    </div>
  );
}
