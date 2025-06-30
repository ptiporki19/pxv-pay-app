'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { replyToTicket, type TicketMessage } from '@/lib/actions/tickets'
import { formatDistanceToNow } from 'date-fns'

interface AdminTicketConversationProps {
  ticketId: string
  messages: TicketMessage[]
  userEmail?: string;
  currentUserId: string;
}

export function AdminTicketConversation({ ticketId, messages: initialMessages, userEmail, currentUserId }: AdminTicketConversationProps) {
  const [messages, setMessages] = useState<TicketMessage[]>(initialMessages)
  const [replyMessage, setReplyMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim()) return

    setIsLoading(true)

    const optimisticReply: TicketMessage = {
      id: Math.random().toString(),
      created_at: new Date().toISOString(),
      ticket_id: ticketId,
      user_id: currentUserId,
      message: replyMessage.trim(),
      is_admin_reply: true,
      user_email: 'You (Admin)'
    };
    
    setMessages(prev => [...prev, optimisticReply]);
    setReplyMessage('');

    try {
      const formData = new FormData()
      formData.append('ticket_id', ticketId)
      formData.append('message', optimisticReply.message)

      const result = await replyToTicket(formData)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send reply.')
      }
      
    } catch (error: any) {
      console.error('Error sending reply:', error)
      toast({
        title: 'Error Sending Reply',
        description: error.message || 'Please try again.',
        variant: 'error',
      })
      setMessages(prev => prev.filter(m => m.id !== optimisticReply.id))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[65vh] bg-gray-50 dark:bg-gray-900/50">
      {/* Messages Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => {
          const isAdminMessage = message.is_admin_reply;

          // Support messages on LEFT, Admin messages on RIGHT
          const alignment = isAdminMessage ? 'justify-end' : 'justify-start'
          const bubbleColor = isAdminMessage ? 'bg-violet-600 text-white' : 'bg-white dark:bg-gray-800'
          const senderName = isAdminMessage ? 'You (Admin)' : (message.user_email || userEmail || 'User')
          
          return (
            <div key={message.id} className={`flex w-full ${alignment}`}>
              <div className="max-w-[75%]">
                <p className={`text-xs text-muted-foreground mb-1 ${isAdminMessage ? 'text-right' : 'text-left'}`}>
                  {senderName}
                </p>
                <div className={`rounded-lg px-3 py-2 shadow-sm ${bubbleColor}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                </div>
                <p className={`text-xs text-muted-foreground mt-1 ${isAdminMessage ? 'text-right' : 'text-left'}`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Form */}
      <div className="border-t p-3 bg-white dark:bg-gray-800/80">
        <form onSubmit={handleReply} className="relative">
          <Textarea
            placeholder={`Reply to ${userEmail || 'the user'}...`}
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleReply(e);
              }
            }}
            className="min-h-[60px] max-h-[150px] resize-none pr-14"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !replyMessage.trim()}
            className="absolute bottom-2.5 right-2.5 h-8 w-8 bg-violet-600 hover:bg-violet-700 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
} 
 
 
 
 