'use client';

import { useState, useEffect } from 'react';

type DataRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  created_at: string;
  updated_at: string;
};

type DataTableProps = {
  onDataUpdate: () => void;
};

export default function DataTable({ onDataUpdate }: DataTableProps) {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedRows, setEditedRows] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data');
      if (res.ok) {
        const result = await res.json();
        setData(result.data || []);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleCellEdit = (rowId: number, field: keyof DataRow, value: string | number) => {
    setData(prevData =>
      prevData.map(row =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
    setEditedRows(prev => {
      const newSet = new Set(prev);
      newSet.add(rowId);
      return newSet;
    });
  };

  const handleSaveChanges = async () => {
    if (editedRows.size === 0) {
      setMessage('No changes to save');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      setError('');

      const updates = data.filter(row => editedRows.has(row.id));
      
      const res = await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage(`Successfully saved ${result.updatedCount} changes`);
        setEditedRows(new Set());
        onDataUpdate();
        // Refresh data to get updated timestamps
        await fetchData();
      } else {
        setError(result.message || 'Failed to save changes');
      }
    } catch (err) {
      setError('An error occurred while saving changes');
    } finally {
      setSaving(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to delete all imported data? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/data', {
        method: 'DELETE',
      });

      if (res.ok) {
        setData([]);
        setEditedRows(new Set());
        setMessage('All data cleared successfully');
        onDataUpdate();
      } else {
        setError('Failed to clear data');
      }
    } catch (err) {
      setError('An error occurred while clearing data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading data...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 text-lg">No data imported yet</p>
        <p className="text-gray-400 text-sm">Import an Excel file to see data here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Imported Data ({data.length} records)
          </h3>
          {editedRows.size > 0 && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              {editedRows.size} unsaved changes
            </span>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSaveChanges}
            disabled={saving || editedRows.size === 0}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-all duration-200 flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
          <button
            onClick={handleClearData}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All Data
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-3 bg-green-50 border-l-4 border-green-400 text-green-700 rounded">
          <p className="text-sm">{message}</p>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr key={row.id} className={editedRows.has(row.id) ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => handleCellEdit(row.id, 'name', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="email"
                    value={row.email}
                    onChange={(e) => handleCellEdit(row.id, 'email', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={row.phone}
                    onChange={(e) => handleCellEdit(row.id, 'phone', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={row.department}
                    onChange={(e) => handleCellEdit(row.id, 'department', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={row.position}
                    onChange={(e) => handleCellEdit(row.id, 'position', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={row.salary}
                    onChange={(e) => handleCellEdit(row.id, 'salary', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(row.updated_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
