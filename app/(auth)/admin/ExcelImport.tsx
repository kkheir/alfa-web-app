'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Plus, Loader2 } from 'lucide-react';

type ExcelImportProps = {
  onImportSuccess: () => void;
};

export default function ExcelImport({ onImportSuccess }: ExcelImportProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    try {
      setUploading(true);
      setMessage('');
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`${result.message}${result.errors ? ` (${result.errors.length} errors)` : ''}`);
        onImportSuccess();
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.message || 'Failed to import Excel file');
      }
    } catch (err) {
      setError('An error occurred while uploading the file');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Upload className="w-6 h-6 mr-2 text-emerald-600 dark:text-emerald-400" />
              Import from Excel
            </CardTitle>
            <CardDescription className="mt-1">
              Upload an Excel file with employee data (Name, Email, Phone, Department, Position, Salary)
            </CardDescription>
          </div>
          <Button
            onClick={triggerFileInput}
            disabled={uploading}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Choose Excel File
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Messages */}
        {message && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-400 text-green-700 dark:text-green-300 rounded">
            <p className="text-sm">{message}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-400 text-red-700 dark:text-red-300 rounded">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <Card className="bg-background border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-foreground mb-2">Excel File Format Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• First row should contain column headers</li>
              <li>• Supported columns: Name, Email, Phone, Department, Position, Salary</li>
              <li>• Column names are flexible (e.g., "Full Name" or "Employee Name" for Name)</li>
              <li>• Salary should be numeric values</li>
              <li>• File formats: .xlsx or .xls</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
