'use client'

import { useState, useEffect } from 'react'
import { Search, UserPlus, Edit3, Trash2, Shield, User, Filter, SortAsc, SortDesc, X } from 'lucide-react'
import { toast } from 'sonner'

interface UserData {
  id: number
  username: string
  isAdmin: boolean
}

interface UserManagementProps {
  initialUsers: UserData[]
}

export default function UserManagement({ initialUsers }: UserManagementProps) {
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserData
    direction: 'asc' | 'desc'
  } | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    isAdmin: false
  })
  const [isLoading, setIsLoading] = useState(false)

  // Filter and sort users
  useEffect(() => {
    try {
      let filtered = users.filter(user => {
        // Safety check to ensure user has required properties
        if (!user || typeof user.username !== 'string') {
          console.warn('Invalid user object in filter:', user)
          return false
        }
        
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'all' || 
          (roleFilter === 'admin' && user.isAdmin) || 
          (roleFilter === 'user' && !user.isAdmin)
        return matchesSearch && matchesRole
      })

      if (sortConfig) {
        filtered.sort((a, b) => {
          if (sortConfig.key === 'username') {
            return sortConfig.direction === 'asc' 
              ? a.username.localeCompare(b.username)
              : b.username.localeCompare(a.username)
          }
          if (sortConfig.key === 'isAdmin') {
            return sortConfig.direction === 'asc'
              ? (a.isAdmin === b.isAdmin ? 0 : a.isAdmin ? 1 : -1)
              : (a.isAdmin === b.isAdmin ? 0 : b.isAdmin ? 1 : -1)
          }
          return 0
        })
      }

      setFilteredUsers(filtered)
    } catch (error) {
      console.error('Error filtering users:', error)
      setFilteredUsers([])
    }
  }, [users, searchTerm, roleFilter, sortConfig])

  const handleSort = (key: keyof UserData) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        const user = await response.json()
        console.log('New user created:', user) // Debug log
        
        // Ensure the user object has required properties
        if (user && user.username && typeof user.id !== 'undefined') {
          setUsers(prev => [...prev, user])
          setNewUser({ username: '', password: '', isAdmin: false })
          setShowAddModal(false)
          toast.success('User created successfully')
        } else {
          console.error('Invalid user object received:', user)
          toast.error('Invalid response from server')
        }
      } else {
        const error = await response.text()
        toast.error(error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: selectedUser.username,
          isAdmin: selectedUser.isAdmin
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id ? updatedUser : user
        ))
        setShowEditModal(false)
        setSelectedUser(null)
        toast.success('User updated successfully')
      } else {
        const error = await response.text()
        toast.error(error || 'Failed to update user')
      }
    } catch (error) {
      toast.error('Failed to update user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== selectedUser.id))
        setShowDeleteModal(false)
        setSelectedUser(null)
        toast.success('User deleted successfully')
      } else {
        const error = await response.text()
        toast.error(error || 'Failed to delete user')
      }
    } catch (error) {
      toast.error('Failed to delete user')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadge = (isAdmin: boolean) => {
    return isAdmin ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <User className="w-3 h-3 mr-1" />
        User
      </span>
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setRoleFilter('all')
    setSortConfig(null)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || roleFilter !== 'all' || sortConfig) && (
            <button
              onClick={clearFilters}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </button>
          )}

          {/* Add User Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Filter Summary */}
        <div className="mt-3 flex items-center text-sm text-gray-600">
          <span>
            Showing {filteredUsers.length} of {users.length} users
          </span>
          {searchTerm && (
            <span className="ml-2">
              • Filtered by "{searchTerm}"
            </span>
          )}
          {roleFilter !== 'all' && (
            <span className="ml-2">
              • Role: {roleFilter}
            </span>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('id')}
                    className="flex items-center hover:text-gray-700"
                  >
                    ID
                    {sortConfig?.key === 'id' && (
                      sortConfig.direction === 'asc' ? (
                        <SortAsc className="ml-1 w-3 h-3" />
                      ) : (
                        <SortDesc className="ml-1 w-3 h-3" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('username')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Username
                    {sortConfig?.key === 'username' && (
                      sortConfig.direction === 'asc' ? (
                        <SortAsc className="ml-1 w-3 h-3" />
                      ) : (
                        <SortDesc className="ml-1 w-3 h-3" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('isAdmin')}
                    className="flex items-center hover:text-gray-700"
                  >
                    Role
                    {sortConfig?.key === 'isAdmin' && (
                      sortConfig.direction === 'asc' ? (
                        <SortAsc className="ml-1 w-3 h-3" />
                      ) : (
                        <SortDesc className="ml-1 w-3 h-3" />
                      )
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <User className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.isAdmin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowEditModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit user"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isAdmin"
                      checked={newUser.isAdmin}
                      onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                      Admin privileges
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleEditUser(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={selectedUser.username}
                      onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editIsAdmin"
                      checked={selectedUser.isAdmin}
                      onChange={(e) => setSelectedUser({ ...selectedUser, isAdmin: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="editIsAdmin" className="ml-2 block text-sm text-gray-900">
                      Admin privileges
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete User</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{selectedUser.username}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
