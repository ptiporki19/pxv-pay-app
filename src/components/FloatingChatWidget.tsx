'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, X, LifeBuoy, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createTicket, getTicketCategories, getUserTickets, getTicketMessages, replyToTicket, type TicketCategory, type Ticket, type TicketMessage } from '@/lib/actions/tickets'
import { formatDistanceToNow } from 'date-fns'

const supportSchema = z.object({
  subject: z.string().min(5, "What's the issue? (at least 5 characters)"),
  message: z.string().min(10, 'Please provide more details (at least 10 characters)'),
  category_id: z.string().min(1, 'Please select a category'),
})

const feedbackSchema = z.object({
  subject: z.string().min(5, "What's this about? (at least 5 characters)"),
  message: z.string().min(10, 'Please share more details (at least 10 characters)'),
  category_id: z.string().min(1, 'Please select a category'),
})

type SupportFormData = z.infer<typeof supportSchema>
type FeedbackFormData = z.infer<typeof feedbackSchema>

interface FloatingChatWidgetProps {
  className?: string
}

export function FloatingChatWidget({ className }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'support' | 'feedback' | 'history'>('support')
  const [categories, setCategories] = useState<TicketCategory[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [replyMessage, setReplyMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supportForm = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      subject: '',
      message: '',
      category_id: '',
    },
  })

  const feedbackForm = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      subject: '',
      message: '',
      category_id: '',
    },
  })

  // Autofill category if only one exists
  useEffect(() => {
    const supportCategories = getFinalSupportCategories()
    if (supportCategories.length === 1 && !supportForm.getValues('category_id')) {
      supportForm.setValue('category_id', supportCategories[0].id)
    }
  }, [categories, supportForm])
  
  useEffect(() => {
    const feedbackCategories = getFinalFeedbackCategories()
    if (feedbackCategories.length === 1 && !feedbackForm.getValues('category_id')) {
      feedbackForm.setValue('category_id', feedbackCategories[0].id)
    }
  }, [categories, feedbackForm])

  // Load data when widget opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 FloatingChatWidget opened, loading initial data...')
      loadInitialData()
    }
  }, [isOpen])

  // Load messages when ticket is selected
  useEffect(() => {
    if (selectedTicket) {
      console.log('🔄 Selected ticket changed, loading messages for ticket:', selectedTicket.id)
      loadTicketMessages(selectedTicket.id)
    } else {
      console.log('🔄 No ticket selected, clearing messages')
      setMessages([])
    }
  }, [selectedTicket])
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messages.length > 0) {
      console.log('📜 Scrolling to bottom, messages count:', messages.length)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Add event listener for notification clicks
  useEffect(() => {
    const handleOpenSupportWidget = (event: CustomEvent) => {
      const { ticketId, tab } = event.detail
      console.log('🔔 Support widget opened via notification:', { ticketId, tab })
      setIsOpen(true)
      if (tab) {
        setActiveTab(tab)
      }
      if (ticketId && tickets.length > 0) {
        const ticket = tickets.find(t => t.id === ticketId)
        if (ticket) {
          setSelectedTicket(ticket)
        }
      }
    }

    window.addEventListener('openSupportWidget', handleOpenSupportWidget as EventListener)
    
    return () => {
      window.removeEventListener('openSupportWidget', handleOpenSupportWidget as EventListener)
    }
  }, [tickets])

  const loadInitialData = async () => {
    try {
      console.log('📡 Loading categories and tickets...')
      const [categoriesData, ticketsData] = await Promise.all([
        getTicketCategories(),
        getUserTickets()
      ])
      
      console.log('✅ Categories loaded:', categoriesData.length)
      console.log('✅ Tickets loaded:', ticketsData.length)
      
      setCategories(categoriesData)
      setTickets(ticketsData)
    } catch (error) {
      console.error('❌ Error loading initial data:', error)
      toast({
        title: 'Could not load data',
        description: 'There was a problem fetching support data. Please try again later.',
        variant: 'error',
      })
    }
  }

  const loadTicketMessages = async (ticketId: string) => {
    if (!ticketId) {
      console.warn('⚠️ No ticketId provided to loadTicketMessages')
      return
    }

    setIsLoadingMessages(true)
    try {
      console.log('📡 Loading messages for ticket:', ticketId)
      const messagesData = await getTicketMessages(ticketId)
      console.log('✅ Messages loaded:', messagesData.length)
      console.log('📋 Messages data:', messagesData)
      
      setMessages(messagesData)
    } catch (error) {
      console.error('❌ Error loading messages:', error)
      toast({
        title: 'Could not load messages',
        description: 'There was a problem fetching the conversation.',
        variant: 'error',
      })
      setMessages([]) // Clear messages on error
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleFormSubmit = async (data: SupportFormData | FeedbackFormData, formType: 'support' | 'feedback') => {
    setIsLoading(true)
    try {
      console.log('📤 Submitting form:', formType, data)
      
      const formData = new FormData()
      formData.append('subject', data.subject)
      formData.append('message', data.message)
      formData.append('category_id', data.category_id)

      const result = await createTicket(formData)
      
      if (result.success) {
        console.log('✅ Ticket created successfully')
        toast({
          title: formType === 'support' ? 'Support Request Sent!' : 'Feedback Submitted!',
          description: formType === 'support' 
            ? 'We received your request and will help you shortly.'
            : 'Thank you for your feedback!',
        })
        
        if (formType === 'support') {
          supportForm.reset()
        } else {
          feedbackForm.reset()
        }

        // Refresh tickets list
        const updatedTickets = await getUserTickets()
        setTickets(updatedTickets)
        setActiveTab('history')
      } else {
        console.error('❌ Failed to create ticket:', result.error)
        toast({
          title: 'Could not send request',
          description: result.error || 'Please try again later.',
          variant: 'error',
        })
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error)
      toast({
        title: 'Could not send request',
        description: 'Please try again later.',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim() || !selectedTicket) {
      console.warn('⚠️ Cannot send reply: missing message or ticket')
      return
    }

    setIsLoading(true)
    try {
      console.log('📤 Sending reply to ticket:', selectedTicket.id)
      
      const formData = new FormData()
      formData.append('ticket_id', selectedTicket.id)
      formData.append('message', replyMessage.trim())

      const result = await replyToTicket(formData)
      
      if (result.success) {
        console.log('✅ Reply sent successfully')
        setReplyMessage('')
        
        // Reload messages to show the new reply
        await loadTicketMessages(selectedTicket.id)
        
        toast({
          title: 'Reply sent!',
          description: 'Your message has been sent.',
        })
      } else {
        console.error('❌ Failed to send reply:', result.error)
        toast({
          title: 'Could not send reply',
          description: result.error || 'Please try again later.',
          variant: 'error',
        })
      }
    } catch (error) {
      console.error('❌ Error sending reply:', error)
      toast({
        title: 'Could not send reply',
        description: 'Please try again later.',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'border-blue-300 text-blue-700 bg-blue-50'
      case 'in_progress': return 'border-yellow-300 text-yellow-700 bg-yellow-50'
      case 'closed': return 'border-gray-300 text-gray-700 bg-gray-50'
      default: return 'border-gray-300 text-gray-700 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'New'
      case 'in_progress': return 'Active'
      case 'closed': return 'Closed'
      default: return status
    }
  }

  const getFinalSupportCategories = () => {
    return categories.filter(c => ['General', 'Technical', 'Billing'].includes(c.name))
  }

  const getFinalFeedbackCategories = () => {
    return categories.filter(c => ['Feature Request', 'Bug Report'].includes(c.name))
  }

  return (
    <>
      {/* Floating Button */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-violet-600 hover:bg-violet-700 shadow-lg hover:shadow-xl transition-all duration-300"
            aria-label="Get Help & Support"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Button>
        )}
        
        {/* Support Widget */}
        {isOpen && (
          <Card className="w-80 sm:w-96 h-[600px] max-h-[80vh] shadow-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
            {/* Header */}
            <CardHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200">Help & Support</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="p-0 flex-1 overflow-hidden">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'support' | 'feedback' | 'history')} className="h-full flex flex-col">
                <div className="p-2">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                    <TabsTrigger value="support" className="text-xs font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-gray-600 dark:text-gray-300">
                      <AlertCircle className="h-4 w-4 mr-1.5" /> Get Help
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="text-xs font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-gray-600 dark:text-gray-300">
                      <MessageSquare className="h-4 w-4 mr-1.5" /> Feedback
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-xs font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md text-gray-600 dark:text-gray-300">
                      <MessageCircle className="h-4 w-4 mr-1.5" /> Messages {tickets.length > 0 && `(${tickets.length})`}
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Get Help Tab */}
                <TabsContent value="support" className="flex-1 px-4 pb-4 overflow-y-auto">
                  <div className="mb-4 text-center">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Need Help?</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Payments, account issues, or technical problems.</p>
                  </div>
                  <Form {...supportForm}>
                    <form onSubmit={supportForm.handleSubmit(data => handleFormSubmit(data, 'support'))} className="space-y-4">
                      <FormField control={supportForm.control} name="category_id" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">What do you need help with?</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 text-xs bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"><SelectValue placeholder="Choose a category..." /></SelectTrigger>
                            </FormControl>
                            <SelectContent>{getFinalSupportCategories().map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}/>
                      <FormField control={supportForm.control} name="subject" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">What's the issue?</FormLabel>
                          <FormControl><Input placeholder="e.g., Payment not working" className="h-9 text-xs bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700" {...field} /></FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}/>
                      <FormField control={supportForm.control} name="message" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium">Tell us more</FormLabel>
                          <FormControl><Textarea placeholder="Describe what happened..." className="min-h-[100px] text-xs resize-none bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700" {...field} /></FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}/>
                      <Button type="submit" disabled={isLoading} className="w-full h-9 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white">
                        <Send className="h-3 w-3 mr-2" /> {isLoading ? 'Sending...' : 'Get Help Now'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Feedback Tab */}
                <TabsContent value="feedback" className="flex-1 px-4 pb-4 overflow-y-auto">
                  <div className="mb-4 text-center">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Share Your Feedback</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Suggestions, bug reports, or feature requests.</p>
                  </div>
                  <Form {...feedbackForm}>
                     <form onSubmit={feedbackForm.handleSubmit(data => handleFormSubmit(data, 'feedback'))} className="space-y-4">
                        <FormField control={feedbackForm.control} name="category_id" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium">Type of Feedback</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger className="h-9 text-xs bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"><SelectValue placeholder="Choose a category..." /></SelectTrigger></FormControl>
                              <SelectContent>{getFinalFeedbackCategories().map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}/>
                        <FormField control={feedbackForm.control} name="subject" render={({ field }) => (
                           <FormItem>
                            <FormLabel className="text-xs font-medium">What's this about?</FormLabel>
                            <FormControl><Input placeholder="e.g., Suggestion for checkout" className="h-9 text-xs bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700" {...field} /></FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}/>
                        <FormField control={feedbackForm.control} name="message" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium">Share your thoughts</FormLabel>
                            <FormControl><Textarea placeholder="Tell us your idea..." className="min-h-[100px] text-xs resize-none bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700" {...field} /></FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}/>
                        <Button type="submit" disabled={isLoading} className="w-full h-9 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white">
                          <Send className="h-3 w-3 mr-2" /> {isLoading ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Messages History Tab */}
                <TabsContent value="history" className="flex-1 overflow-hidden h-full">
                  {!selectedTicket ? (
                    <div className="px-4 pb-4 h-full overflow-y-auto">
                      {tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <h3 className="text-sm font-medium mb-1">No Messages Yet</h3>
                          <p className="text-xs text-gray-400">Your conversations will appear here.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {tickets.map((ticket) => (
                            <div key={ticket.id} className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors" onClick={() => setSelectedTicket(ticket)}>
                              <div className="flex items-start justify-between mb-1.5">
                                <h4 className="font-medium text-xs text-gray-900 dark:text-gray-100 line-clamp-1 pr-2">{ticket.subject}</h4>
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 font-medium border ${getStatusColor(ticket.status)}`}>{getStatusText(ticket.status)}</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.category?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
                      {/* Conversation Header */}
                      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)} className="text-xs p-1 h-7 -ml-2 text-violet-600 dark:text-violet-400 hover:bg-gray-200 dark:hover:bg-gray-700">←</Button>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => loadTicketMessages(selectedTicket.id)} 
                              disabled={isLoadingMessages}
                              className="text-xs p-1 h-7 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              <RefreshCw className={`h-3 w-3 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                            </Button>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 font-medium border ${getStatusColor(selectedTicket.status)}`}>{getStatusText(selectedTicket.status)}</Badge>
                          </div>
                        </div>
                        <h3 className="font-semibold text-xs text-gray-900 dark:text-gray-100 line-clamp-1">{selectedTicket.subject}</h3>
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-[10px] text-gray-400 mt-1">
                            Ticket ID: {selectedTicket.id} | Messages: {messages.length}
                          </div>
                        )}
                      </div>

                      {/* Messages Area - SCROLLABLE */}
                      <div className="flex-1 px-3 py-2 overflow-y-auto space-y-4">
                        {isLoadingMessages ? (
                          <div className="flex items-center justify-center h-20">
                            <div className="text-xs text-gray-500">Loading messages...</div>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="flex items-center justify-center h-20">
                            <div className="text-xs text-gray-500">Start the conversation...</div>
                          </div>
                        ) : (
                          messages.map((message) => {
                            const isUser = !message.is_admin_reply
                            // USER ON RIGHT, SUPPORT ON LEFT  
                            const alignment = isUser ? 'justify-end' : 'justify-start'
                            const bubbleColor = isUser ? 'bg-violet-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                            const senderName = isUser ? 'You' : 'Support Team'

                            return (
                              <div key={message.id} className={`flex w-full ${alignment}`}>
                                <div className="max-w-[80%]">
                                  <p className={`text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 ${isUser ? 'text-right' : 'text-left'}`}>{senderName}</p>
                                  <div className={`rounded-lg px-3 py-2 shadow-sm ${bubbleColor}`}>
                                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{message.message}</p>
                                  </div>
                                  <p className={`text-[10px] text-gray-400 dark:text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                            )
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Reply Form - FIXED */}
                      <div className="px-3 py-2 border-t bg-white dark:bg-gray-800/50">
                        <form onSubmit={handleReply} className="relative">
                          <Textarea
                            placeholder="Type your reply..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleReply(e) }}
                            className="min-h-[50px] max-h-[100px] text-xs resize-none border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 pr-12"
                            disabled={isLoading}
                          />
                          <Button type="submit" size="icon" disabled={isLoading || !replyMessage.trim()} className="absolute bottom-2.5 right-2.5 h-7 w-7 bg-violet-600 hover:bg-violet-700 rounded-full">
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
} 