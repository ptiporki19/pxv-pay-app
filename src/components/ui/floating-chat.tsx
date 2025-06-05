'use client'

import React, { useState } from 'react'
import { MessageCircle, X, Send, ChevronDown, ChevronUp, Mail, Clock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const faqs = [
  {
    question: "How does PXV Pay work?",
    answer: "PXV Pay is a payment information facilitator that helps you create payment links and collect payments using local payment methods. We don't process payments directly - funds go directly from customers to your accounts."
  },
  {
    question: "What payment methods are supported?",
    answer: "We support over 300+ payment methods across 180+ countries including bank transfers, mobile money, digital wallets, and local payment solutions tailored to each region."
  },
  {
    question: "Is PXV Pay secure?",
    answer: "Yes! We use bank-grade security with encryption, secure data handling, and compliance with international security standards. We never store sensitive financial data like full account numbers."
  },
  {
    question: "How much does PXV Pay cost?",
    answer: "We offer flexible pricing plans starting with a free tier. Our pricing is transparent with no hidden fees. Contact us for enterprise pricing or custom solutions."
  },
  {
    question: "Can I customize the payment experience?",
    answer: "Absolutely! You can customize payment links, checkout pages, and even create custom landing pages with our subscriber features to match your brand."
  },
  {
    question: "Do you provide customer support?",
    answer: "Yes, we provide comprehensive customer support through this chat, email, and for premium users, priority support channels. Our team is here to help you succeed."
  },
  {
    question: "What countries do you support?",
    answer: "PXV Pay supports payments in 180+ countries worldwide with local payment methods specific to each region, making it easy for your customers to pay using familiar methods."
  },
  {
    question: "How quickly can I get started?",
    answer: "You can get started in minutes! Simply sign up, create your first payment link, and start collecting payments. No lengthy setup process required."
  }
]

interface FloatingChatProps {
  className?: string
}

export default function FloatingChat({ className }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('contact')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Message sent successfully!', {
        description: 'We&apos;ll get back to you within 24 hours.',
      })
      
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send message', {
        description: 'Please try again or contact us directly.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className={cn("", className)}>
      {/* Chat Button */}
      <div className={cn(
        "transition-all duration-500 ease-out",
        isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
      )}>
        <Button
          onClick={() => setIsOpen(true)}
          className="relative h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 via-violet-700 to-violet-800 hover:from-violet-700 hover:via-violet-800 hover:to-violet-900 shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-500 hover:scale-110 group border-0 overflow-hidden"
        >
          <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-violet-500 animate-ping opacity-20"></div>
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-violet-400 to-violet-600 opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-500"></div>
        </Button>
      </div>

      {/* Chat Widget */}
      <div className={cn(
        "absolute bottom-16 right-0 transition-all duration-500 ease-out origin-bottom-right",
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
      )}>
        <Card className="w-96 h-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl shadow-violet-500/20 border border-violet-100/30 dark:border-violet-900/30 rounded-2xl overflow-hidden">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-violet-600 via-violet-700 to-violet-800 text-white p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-[slide_2s_ease-in-out_infinite]"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">PXV Pay Support</CardTitle>
                  <p className="text-violet-100 text-sm">We&apos;re here to help!</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 transition-colors duration-300 rounded-full h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-0 h-[calc(600px-80px)] overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 m-4 mb-0 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <TabsTrigger 
                  value="contact" 
                  className="rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300"
                >
                  Contact Us
                </TabsTrigger>
                <TabsTrigger 
                  value="faq" 
                  className="rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300"
                >
                  FAQ
                </TabsTrigger>
              </TabsList>

              {/* Contact Form */}
              <TabsContent value="contact" className="flex-1 p-4 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                      className="bg-white/50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="bg-white/50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="How can we help?"
                      required
                      className="bg-white/50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Tell us more about your question or how we can help..."
                      rows={4}
                      required
                      className="bg-white/50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 focus:border-violet-500 focus:ring-violet-500 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-violet-600 via-violet-700 to-violet-800 hover:from-violet-700 hover:via-violet-800 hover:to-violet-900 text-white font-medium transition-all duration-500 hover:shadow-lg hover:shadow-violet-500/30 border-0 rounded-xl group"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Send Message
                        <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Contact Info */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Other ways to reach us:</h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-violet-600" />
                      <span>contact@primexvanguard.com</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-violet-600" />
                      <span>Response time: &lt;24 hours</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* FAQ */}
              <TabsContent value="faq" className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Frequently Asked Questions</h3>
                  </div>
                  
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full p-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{faq.question}</span>
                        {expandedFaq === index ? (
                          <ChevronUp className="h-4 w-4 text-violet-600 transition-transform duration-300" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-violet-600 transition-transform duration-300" />
                        )}
                      </button>
                      
                      <div className={cn(
                        "overflow-hidden transition-all duration-300 ease-out",
                        expandedFaq === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      )}>
                        <div className="p-4 pt-0 bg-gray-50 dark:bg-gray-800/50">
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-6 p-4 bg-violet-50 dark:bg-violet-950/20 rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Can&apos;t find what you&apos;re looking for? 
                      <button 
                        onClick={() => setActiveTab('contact')}
                        className="text-violet-600 dark:text-violet-400 hover:underline ml-1 font-medium"
                      >
                        Contact us directly
                      </button>
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 