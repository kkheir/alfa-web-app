'use client';

import { useState, useRef } from 'react';

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
    <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Import from Excel
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Upload an Excel file with employee data (Name, Email, Phone, Department, Position, Salary)
          </p>
        </div>
        <button
          onClick={triggerFileInput}
          disabled={uploading}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none transition-all duration-200 flex items-center"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Choose Excel File
            </>
          )}
        </button>
      </div>

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
        <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-400 text-green-700 rounded">
          <p className="text-sm">{message}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-4 bg-white rounded-lg border border-emerald-200">
        <h4 className="font-semibold text-gray-800 mb-2">Excel File Format Requirements:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• First row should contain column headers</li>
          <li>• Supported columns: Name, Email, Phone, Department, Position, Salary</li>
          <li>• Column names are flexible (e.g., "Full Name" or "Employee Name" for Name)</li>
          <li>• Salary should be numeric values</li>
          <li>• File formats: .xlsx or .xls</li>
        </ul>
      </div>
    </div>
  );
}
