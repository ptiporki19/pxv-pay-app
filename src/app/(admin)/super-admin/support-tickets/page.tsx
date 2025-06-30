import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MessageCircle, Clock, User, Calendar } from 'lucide-react'
import { getAllTickets, getTicketMessages, updateTicketStatus, type Ticket, type TicketMessage } from '@/lib/actions/tickets'
import { AdminTicketConversation } from '@/components/admin/AdminTicketConversation'
import { TicketFilters } from '@/components/admin/TicketFilters'
import { TicketStatusUpdate } from '@/components/admin/TicketStatusUpdate'
import { CloseTicketButton } from '@/components/admin/CloseTicketButton'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  searchParams: { 
    ticket?: string
    status?: string
    category?: string
    search?: string
  }
}

export default async function SuperAdminSupportTicketsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) {
    // Handle case where admin is not logged in, though middleware should prevent this
    return <div className="p-6">You must be logged in to view this page.</div>;
  }

  // Pass searchParams directly to the data fetching function
  const allTickets = await getAllTickets(searchParams)
  
  const selectedTicketId = searchParams.ticket
  
  // Filtering is now done in the database via getAllTickets, so this is no longer needed.
  // We just need the tickets themselves.
  const filteredTickets = allTickets
  
  let selectedTicket: Ticket | null = null
  let messages: TicketMessage[] = []
  
  if (selectedTicketId) {
    // We still need to find the selected ticket from the filtered list
    selectedTicket = filteredTickets.find(t => t.id === selectedTicketId) || null
    if (selectedTicket) {
      messages = await getTicketMessages(selectedTicketId)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'in_progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'closed':
        return 'bg-green-50 text-green-700 border-green-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Needs Reply'
      case 'in_progress':
        return 'In Progress'
      case 'closed':
        return 'Resolved'
      default:
        return status
    }
  }

  // Get unique categories for filter
  const categories = Array.from(new Set(allTickets.map(t => t.category?.name).filter(Boolean))) as string[]

  // Stats should be based on the full, unfiltered list if needed,
  // but for now, we can calculate from the returned tickets.
  // For a more accurate total, a separate count query would be best.
  const stats = {
    total: allTickets.length, // This will reflect the count of FILTERED tickets
    open: allTickets.filter(t => t.status === 'open').length,
    inProgress: allTickets.filter(t => t.status === 'in_progress').length,
    closed: allTickets.filter(t => t.status === 'closed').length,
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Support Tickets Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage and respond to user support requests and feedback.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              </div>
              <div className="h-3 w-3 bg-blue-500 rounded-full" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <div className="h-3 w-3 bg-yellow-500 rounded-full" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed</p>
                <p className="text-2xl font-bold text-green-600">{stats.closed}</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Support Tickets ({filteredTickets.length})
              </CardTitle>
              
              {/* Filters */}
              <TicketFilters 
                categories={categories}
                currentSearch={searchParams.search}
                currentStatus={searchParams.status}
                currentCategory={searchParams.category}
              />
            </CardHeader>
            
            <CardContent className="p-0">
              <Suspense fallback={<div className="p-4">Loading tickets...</div>}>
                {filteredTickets.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tickets found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {filteredTickets.map((ticket) => (
                      <Link
                        key={ticket.id}
                        href={`?ticket=${ticket.id}${searchParams.status ? `&status=${searchParams.status}` : ''}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
                        className={`block p-4 hover:bg-muted/50 transition-colors ${
                          selectedTicketId === ticket.id ? 'bg-muted' : ''
                        }`}
                        scroll={false}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium text-sm line-clamp-2">
                              {ticket.subject}
                            </h3>
                            <div className="flex gap-1 ml-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs border ${getStatusColor(ticket.status)}`}
                              >
                                {getStatusLabel(ticket.status)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{ticket.user?.email || 'Unknown user'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {ticket.category && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                {ticket.category.name}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedTicket.subject}</CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {selectedTicket.user?.email || 'Unknown user'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true })}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <TicketStatusUpdate 
                      ticketId={selectedTicket.id}
                      currentStatus={selectedTicket.status}
                    />
                    <CloseTicketButton 
                      ticketId={selectedTicket.id}
                      currentStatus={selectedTicket.status}
                    />
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                                 <AdminTicketConversation 
                   ticketId={selectedTicket.id} 
                   messages={messages}
                   userEmail={selectedTicket.user?.email || undefined}
                   currentUserId={currentUser.id}
                 />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a Ticket</h3>
                <p className="text-muted-foreground">
                  Choose a ticket from the list to view the conversation and respond.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 
 
 
 
 