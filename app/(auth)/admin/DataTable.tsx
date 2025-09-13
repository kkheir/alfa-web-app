'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Save, Trash2, Check, Database } from 'lucide-react';

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
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary mr-2" />
          <span className="text-muted-foreground">Loading data...</span>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">No data imported yet</p>
          <p className="text-muted-foreground/60 text-sm">Import an Excel file to see data here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <Card>
        <CardContent className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-foreground">
              Imported Data ({data.length} records)
            </h3>
            {editedRows.size > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                {editedRows.size} unsaved changes
              </Badge>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleSaveChanges}
              disabled={saving || editedRows.size === 0}
              variant="default"
              className="bg-green-500 hover:bg-green-600"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              onClick={handleClearData}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {message && (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-400 text-green-700 dark:text-green-300 rounded">
          <p className="text-sm">{message}</p>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-400 text-red-700 dark:text-red-300 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} className={editedRows.has(row.id) ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}>
                  <TableCell className="text-muted-foreground">
                    {row.id}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.name}
                      onChange={(e) => handleCellEdit(row.id, 'name', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="email"
                      value={row.email}
                      onChange={(e) => handleCellEdit(row.id, 'email', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.phone}
                      onChange={(e) => handleCellEdit(row.id, 'phone', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.department}
                      onChange={(e) => handleCellEdit(row.id, 'department', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.position}
                      onChange={(e) => handleCellEdit(row.id, 'position', e.target.value)}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.salary}
                      onChange={(e) => handleCellEdit(row.id, 'salary', parseFloat(e.target.value) || 0)}
                      className="h-8"
                      step="0.01"
                      min="0"
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(row.updated_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
