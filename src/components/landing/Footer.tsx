import React from 'react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { 
  Twitter, 
  Linkedin, 
  Github, 
  Facebook,
  Mail,
  MapPin,
  Phone
} from 'lucide-react'

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Integrations', href: '/integrations' },
      { name: 'API Documentation', href: '/docs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Support', href: '/support' },
      { name: 'Tutorials', href: '/tutorials' },
      { name: 'Status', href: '/status' },
      { name: 'Security', href: '/security' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Compliance', href: '/compliance' },
      { name: 'Cookies', href: '/cookies' },
    ],
  },
]

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com' },
  { icon: Linkedin, href: 'https://linkedin.com' },
  { icon: Github, href: 'https://github.com' },
  { icon: Facebook, href: 'https://facebook.com' },
]

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {/* Brand and Contact */}
          <div className="md:col-span-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">PXV Pay</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
              Modern payment infrastructure for businesses collecting payments globally with local methods.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">contact@pxvpay.com</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">123 Financial District, New York</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group, i) => (
            <div key={i}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link, j) => (
                  <li key={j}>
                    <Link 
                      href={link.href} 
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:dark:text-gray-100 text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10 bg-gray-200 dark:bg-gray-800" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} PXV Pay. All rights reserved.
          </div>
          
          <div className="flex space-x-4">
            {socialLinks.map((social, i) => {
              const Icon = social.icon
              return (
                <Link 
                  key={i}
                  href={social.href}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:dark:text-gray-100 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{social.icon.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 