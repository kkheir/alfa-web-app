import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { FC, useState } from 'react'

interface NumberEntry {
  id: number
  number: string
  password: string
  numberType: 'Opened' | 'Closed'
  distributionType: '111GB' | '77GB' | '44GB'
  createdAt: string
}

const numberTypeOptions = ['Opened', 'Closed']
const distributionTypeOptions = ['111GB', '77GB', '44GB']

// Define DataTableColumn type locally
type DataTableColumn<T> = {
  accessorKey?: keyof T
  header: string
  id?: string
  cell?: (props: { row: { original: T } }) => React.ReactNode
}

const ManageNumbers: FC = () => {
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    number: '',
    password: '',
    numberType: 'Opened',
    distributionType: '111GB',
  })
  const [data, setData] = useState<NumberEntry[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Handle select changes
  const handleSelect = (name: string, value: string) => {
    setForm({ ...form, [name]: value })
  }

  // Add or edit number
  const handleSubmit = () => {
    if (editId !== null) {
      setData((prev) =>
        prev.map((item) =>
          item.id === editId
            ? {
                ...item,
                ...form,
                numberType: form.numberType as 'Opened' | 'Closed',
                distributionType: form.distributionType as
                  | '111GB'
                  | '77GB'
                  | '44GB',
              }
            : item,
        ),
      )
    } else {
      setData((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...form,
          numberType: form.numberType as 'Opened' | 'Closed',
          distributionType: form.distributionType as '111GB' | '77GB' | '44GB',
          createdAt: new Date().toLocaleString(),
        },
      ])
    }
    setOpen(false)
    setEditId(null)
    setForm({
      number: '',
      password: '',
      numberType: 'Opened',
      distributionType: '111GB',
    })
  }

  // Edit dialog
  const handleEdit = (id: number) => {
    const entry = data.find((d) => d.id === id)
    if (entry) {
      setForm({
        number: entry.number,
        password: entry.password,
        numberType: entry.numberType,
        distributionType: entry.distributionType,
      })
      setEditId(id)
      setOpen(true)
    }
  }

  // Delete dialog
  const handleDelete = (id: number) => {
    setDeleteId(id)
  }
  const confirmDelete = () => {
    setData((prev) => prev.filter((d) => d.id !== deleteId))
    setDeleteId(null)
  }

  // DataTable columns
  const columns: DataTableColumn<NumberEntry>[] = [
    {
      accessorKey: 'number',
      header: 'Number',
    },
    {
      accessorKey: 'numberType',
      header: 'Number Type',
    },
    {
      accessorKey: 'distributionType',
      header: 'Distribution Type',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created Date',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: NumberEntry } }) => (
        <div className='flex gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleEdit(row.original.id)}
          >
            Edit
          </Button>
          <Button
            size='sm'
            variant='destructive'
            onClick={() => handleDelete(row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  // Paginated data
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className='space-y-6'>
      <div className='flex justify-end items-center px-6 mt-5'>
        <Button onClick={() => setOpen(true)}>Add Number</Button>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editId !== null ? 'Edit Number' : 'Add Number'}
            </DialogTitle>
          </DialogHeader>
          <form
            className='space-y-4'
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <Input
              name='number'
              type='text'
              pattern='\d*'
              required
              value={form.number}
              onChange={handleChange}
              placeholder='Enter number'
            />
            <div className='relative'>
              <Input
                name='password'
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={handleChange}
                placeholder='Enter password'
              />
              <div
                className='absolute right-3 top-2.5 cursor-pointer'
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOffIcon className='size-4' />
                ) : (
                  <EyeIcon className='size-4' />
                )}
              </div>
            </div>
            <Select
              value={form.numberType}
              onValueChange={(val) => handleSelect('numberType', val)}
            >
              <SelectTrigger>
                <SelectValue>{form.numberType}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {numberTypeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.distributionType}
              onValueChange={(val) => handleSelect('distributionType', val)}
            >
              <SelectTrigger>
                <SelectValue>{form.distributionType}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {distributionTypeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit'>{editId !== null ? 'Save' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this number?</div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={paginatedData}
        page={page}
        pageSize={pageSize}
        total={data.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  )
}

export default ManageNumbers
