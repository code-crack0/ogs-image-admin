'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// This would typically come from your API
const mockLogs = [
  { id: 1, created_at: '2023-06-01T10:00:00Z', user: 'John Doe', user_email: 'john@example.com', action: 'Created a new folder' },
  { id: 2, created_at: '2023-06-02T11:30:00Z', user: 'Jane Smith', user_email: 'jane@example.com', action: 'Uploaded a file' },
  { id: 3, created_at: '2023-06-03T09:15:00Z', user: 'Bob Johnson', user_email: 'bob@example.com', action: 'Deleted a file' },
  // Add more mock data as needed
]

type SortField = 'created_at' | 'user' | 'user_email' | 'action'

export default function LogsPage() {
  const [logs, setLogs] = useState(mockLogs)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  const logsPerPage = 10
  const totalPages = Math.ceil(logs.length / logsPerPage)

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }

    const sortedLogs = [...logs].sort((a, b) => {
      if (a[field] < b[field]) return sortDirection === 'asc' ? -1 : 1
      if (a[field] > b[field]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setLogs(sortedLogs)
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const filteredLogs = mockLogs.filter(log =>
      Object.values(log).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    setLogs(filteredLogs)
    setCurrentPage(1)
  }

  const paginatedLogs = logs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Action Logs</h1>
      
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex">
          <Input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" className="ml-2">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('created_at')} className="cursor-pointer">
                Date
                {sortField === 'created_at' && (sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('user')} className="cursor-pointer">
                User
                {sortField === 'user' && (sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('user_email')} className="cursor-pointer">
                Email
                {sortField === 'user_email' && (sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('action')} className="cursor-pointer">
                Action
                {sortField === 'action' && (sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />)}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.user_email}</TableCell>
                <TableCell>{log.action}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, logs.length)} of {logs.length} entries
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}