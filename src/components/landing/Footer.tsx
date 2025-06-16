import React from 'react'
import Link from 'next/link'
import { 
  Twitter, 
  Linkedin, 
  Github, 
  Mail,
  Phone,
  ArrowUpRight
} from 'lucide-react'

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '/features' },
      { name: 'Security', href: '/features/security' },
      { name: 'Global Coverage', href: '/features/global-coverage' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '/support' },
      { name: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
    ],
  },
]

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/pxvpay', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/pxvpay', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/pxvpay', label: 'GitHub' },
]

const Footer = () => {
  return (
    <footer className="bg-violet-50 dark:bg-violet-950/30">
      <div className="container mx-auto px-6">
        {/* Main footer content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
            {/* Brand section */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <span className="text-2xl font-bold text-black dark:text-white">PXV Pay</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Customizable payment infrastructure for global businesses. Configure your own payment methods and accept payments worldwide.
                </p>
              </div>
              
              <div className="space-y-3">
                <a 
                  href="mailto:hello@pxvpay.com" 
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-300 group"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  <span>hello@pxvpay.com</span>
                  <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
                <a 
                  href="tel:+1-555-PXV-PAY" 
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-300 group"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  <span>+1 (555) PXV-PAY</span>
                  <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
            </div>
          </div>

            {/* Links sections */}
            <div className="lg:col-span-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {footerLinks.map((group, i) => (
                  <div key={i} className="space-y-4">
                    <h3 className="font-semibold text-black dark:text-white">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link, j) => (
                  <li key={j}>
                    <Link 
                      href={link.href} 
                      className="text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className=" py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} PXV Pay. All rights reserved.
          </div>
          
            <div className="flex items-center space-x-6">
              {/* Social links */}
          <div className="flex space-x-4">
            {socialLinks.map((social, i) => {
              const Icon = social.icon
              return (
                    <a 
                  key={i}
                  href={social.href}
                      className="w-9 h-9 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center text-violet-600 dark:text-violet-400 hover:bg-violet-500 hover:text-white transition-all duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                      aria-label={social.label}
                >
                      <Icon className="w-4 h-4" />
                    </a>
                  )
                })}
              </div>

              {/* Status indicator */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 