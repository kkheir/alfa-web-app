'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Edit3,
  Filter,
  Search,
  Shield,
  SortAsc,
  SortDesc,
  Trash2,
  User,
  UserPlus,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
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
    isAdmin: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Filter and sort users
  useEffect(() => {
    try {
      let filtered = users.filter((user) => {
        // Safety check to ensure user has required properties
        if (!user || typeof user.username !== 'string') {
          console.warn('Invalid user object in filter:', user)
          return false
        }

        const matchesSearch = user.username
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
        const matchesRole =
          roleFilter === 'all' ||
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
              ? a.isAdmin === b.isAdmin
                ? 0
                : a.isAdmin
                ? 1
                : -1
              : a.isAdmin === b.isAdmin
              ? 0
              : b.isAdmin
              ? 1
              : -1
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
    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
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

        // Ensure the user object has required properties
        if (user && user.username && typeof user.id !== 'undefined') {
          setUsers((prev) => [...prev, user])
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
          isAdmin: selectedUser.isAdmin,
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers((prev) =>
          prev.map((user) =>
            user.id === selectedUser.id ? updatedUser : user,
          ),
        )
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
        setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id))
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
      <Badge
        variant='secondary'
        className='bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      >
        <Shield className='w-3 h-3 mr-1' />
        Admin
      </Badge>
    ) : (
      <Badge variant='outline'>
        <User className='w-3 h-3 mr-1' />
        User
      </Badge>
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setRoleFilter('all')
    setSortConfig(null)
  }

  return (
    <div className='space-y-6'>
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
            {/* Search Bar */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                type='text'
                placeholder='Search users...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>

            {/* Role Filter */}
            <Select
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(value as 'all' | 'admin' | 'user')
              }
            >
              <SelectTrigger className='w-[140px]'>
                <Filter className='w-4 h-4 mr-2' />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Roles</SelectItem>
                <SelectItem value='admin'>Admins</SelectItem>
                <SelectItem value='user'>Users</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchTerm || roleFilter !== 'all' || sortConfig) && (
              <Button
                variant='outline'
                onClick={clearFilters}
                className='flex items-center'
              >
                <X className='w-4 h-4 mr-1' />
                Clear
              </Button>
            )}

            {/* Add User Button */}
            <Button
              onClick={() => setShowAddModal(true)}
              className='flex items-center'
            >
              <UserPlus className='w-4 h-4 mr-2' />
              Add User
            </Button>
          </div>

          {/* Filter Summary */}
          <div className='mt-3 flex items-center text-sm text-muted-foreground'>
            <span>
              Showing {filteredUsers.length} of {users.length} users
            </span>
            {searchTerm && (
              <span className='ml-2'>• Filtered by "{searchTerm}"</span>
            )}
            {roleFilter !== 'all' && (
              <span className='ml-2'>• Role: {roleFilter}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant='ghost'
                    onClick={() => handleSort('id')}
                    className='flex items-center h-auto p-0 text-xs font-medium uppercase tracking-wider hover:bg-transparent'
                  >
                    ID
                    {sortConfig?.key === 'id' &&
                      (sortConfig.direction === 'asc' ? (
                        <SortAsc className='ml-1 w-3 h-3' />
                      ) : (
                        <SortDesc className='ml-1 w-3 h-3' />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant='ghost'
                    onClick={() => handleSort('username')}
                    className='flex items-center h-auto p-0 text-xs font-medium uppercase tracking-wider hover:bg-transparent'
                  >
                    Username
                    {sortConfig?.key === 'username' &&
                      (sortConfig.direction === 'asc' ? (
                        <SortAsc className='ml-1 w-3 h-3' />
                      ) : (
                        <SortDesc className='ml-1 w-3 h-3' />
                      ))}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant='ghost'
                    onClick={() => handleSort('isAdmin')}
                    className='flex items-center h-auto p-0 text-xs font-medium uppercase tracking-wider hover:bg-transparent'
                  >
                    Role
                    {sortConfig?.key === 'isAdmin' &&
                      (sortConfig.direction === 'asc' ? (
                        <SortAsc className='ml-1 w-3 h-3' />
                      ) : (
                        <SortDesc className='ml-1 w-3 h-3' />
                      ))}
                  </Button>
                </TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-32 text-center'>
                    <div className='flex flex-col items-center'>
                      <User className='mx-auto w-12 h-12 text-muted-foreground mb-4' />
                      <p className='text-lg font-medium'>No users found</p>
                      <p className='text-sm text-muted-foreground'>
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className='font-medium'>#{user.id}</TableCell>
                    <TableCell>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10'>
                          <div className='h-10 w-10 rounded-full bg-muted flex items-center justify-center'>
                            <User className='h-5 w-5' />
                          </div>
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium'>
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.isAdmin)}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end space-x-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setSelectedUser(user)
                            setShowEditModal(true)
                          }}
                          title='Edit user'
                        >
                          <Edit3 className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setSelectedUser(user)
                            setShowDeleteModal(true)
                          }}
                          title='Delete user'
                          className='text-destructive hover:text-destructive'
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account for the system.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAddUser()
            }}
            className='space-y-4'
          >
            <div className='space-y-2'>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                type='text'
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                required
              />
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='isAdmin'
                checked={newUser.isAdmin}
                onCheckedChange={(checked) =>
                  setNewUser({ ...newUser, isAdmin: !!checked })
                }
              />
              <Label htmlFor='isAdmin'>Admin privileges</Label>
            </div>
            <div className='flex justify-end space-x-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleEditUser()
              }}
              className='space-y-4'
            >
              <div className='space-y-2'>
                <Label htmlFor='edit-username'>Username</Label>
                <Input
                  id='edit-username'
                  type='text'
                  value={selectedUser.username}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      username: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='edit-isAdmin'
                  checked={selectedUser.isAdmin}
                  onCheckedChange={(checked) =>
                    setSelectedUser({ ...selectedUser, isAdmin: !!checked })
                  }
                />
                <Label htmlFor='edit-isAdmin'>Admin privileges</Label>
              </div>
              <div className='flex justify-end space-x-2 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update User'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  Are you sure you want to delete{' '}
                  <strong>{selectedUser.username}</strong>? This action cannot
                  be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end space-x-2 pt-4'>
            <Button variant='outline' onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteUser}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
