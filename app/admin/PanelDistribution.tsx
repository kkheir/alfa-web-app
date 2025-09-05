'use client';

import { useState, useEffect } from 'react';

type Distribution = {
  id: number;
  title: string;
  description: string;
  target_audience: string;
  distribution_date: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  recipient_count: number;
  created_at: string;
  updated_at: string;
};

export default function PanelDistribution() {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDistribution, setEditingDistribution] = useState<Distribution | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    target_audience: string;
    distribution_date: string;
    status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  }>({
    title: '',
    description: '',
    target_audience: '',
    distribution_date: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchDistributions();
  }, []);

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/distributions');
      if (res.ok) {
        const result = await res.json();
        setDistributions(result.data || []);
      } else {
        setError('Failed to fetch distributions');
      }
    } catch (err) {
      setError('An error occurred while fetching distributions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');

      const url = editingDistribution ? `/api/distributions/${editingDistribution.id}` : '/api/distributions';
      const method = editingDistribution ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage(editingDistribution ? 'Distribution updated successfully' : 'Distribution created successfully');
        setShowForm(false);
        setEditingDistribution(null);
        setFormData({ title: '', description: '', target_audience: '', distribution_date: '', status: 'draft' });
        fetchDistributions();
      } else {
        const result = await res.json();
        setError(result.message || 'Failed to save distribution');
      }
    } catch (err) {
      setError('An error occurred while saving distribution');
    }
  };

  const handleEdit = (distribution: Distribution) => {
    setEditingDistribution(distribution);
    setFormData({
      title: distribution.title,
      description: distribution.description,
      target_audience: distribution.target_audience,
      distribution_date: distribution.distribution_date.split('T')[0], // Format for date input
      status: distribution.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this distribution?')) return;

    try {
      const res = await fetch(`/api/distributions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage('Distribution deleted successfully');
        fetchDistributions();
      } else {
        setError('Failed to delete distribution');
      }
    } catch (err) {
      setError('An error occurred while deleting distribution');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading distributions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Panel Distributions</h3>
          <p className="text-gray-600">Manage and schedule panel distributions</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingDistribution(null);
            setFormData({ title: '', description: '', target_audience: '', distribution_date: '', status: 'draft' });
          }}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Distribution
        </button>
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="p-8 bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {editingDistribution ? 'Edit Distribution' : 'New Distribution'}
              </h2>
              <p className="text-gray-600">Configure your panel distribution settings</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Distribution title"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Distribution description"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Target Audience
                  </label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select audience</option>
                    <option value="all_employees">All Employees</option>
                    <option value="department_it">IT Department</option>
                    <option value="department_hr">HR Department</option>
                    <option value="department_finance">Finance Department</option>
                    <option value="managers">Managers Only</option>
                    <option value="custom">Custom Group</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Distribution Date
                  </label>
                  <input
                    type="date"
                    value={formData.distribution_date}
                    onChange={(e) => setFormData({ ...formData, distribution_date: e.target.value })}
                    className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sent">Sent</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {editingDistribution ? 'Update' : 'Create'} Distribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Distributions List */}
      <div className="space-y-4">
        {distributions.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 text-lg">No distributions found</p>
            <p className="text-gray-400 text-sm">Create your first distribution to get started</p>
          </div>
        ) : (
          distributions.map((distribution) => (
            <div key={distribution.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-800 mr-3">{distribution.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(distribution.status)}`}>
                      {distribution.status.charAt(0).toUpperCase() + distribution.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{distribution.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Target:</span> {distribution.target_audience.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {new Date(distribution.distribution_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Recipients:</span> {distribution.recipient_count || 0}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(distribution)}
                    className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-all duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(distribution.id)}
                    className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
