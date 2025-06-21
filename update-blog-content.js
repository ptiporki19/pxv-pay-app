const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const samplePosts = [
  {
    title: 'Global Payments, Local Methods',
    slug: 'global-payments-local-methods',
    content: `# The Future of Cross-Border Payments

In today's interconnected world, businesses need payment solutions that work globally while respecting local preferences. At PXV Pay, we've built a platform that bridges this gap seamlessly.

## Understanding Local Payment Preferences

Different regions have distinct payment preferences. While credit cards dominate in North America, mobile payments are king in Africa, and bank transfers are preferred in Europe. Our platform supports them all.

### Key Benefits

- **Universal Coverage**: Accept payments from 180+ countries
- **Local Expertise**: Native support for regional payment methods
- **Regulatory Compliance**: Built-in compliance for global regulations
- **Real-time Processing**: Instant payment confirmation worldwide

## The Technology Behind It

Our payment infrastructure is built on modern, scalable technology that ensures reliability and security. We use advanced fraud detection, machine learning for risk assessment, and blockchain technology for transparency.

The result is a payment platform that feels local everywhere while maintaining global consistency.`,
    excerpt: 'Empower your business with PXV Pay\'s modern, secure payment platform. Collect payments globally using local payment methods.',
    featured_image: null,
    published: true,
    tags: ['payments', 'global', 'fintech', 'technology'],
    meta_title: 'Global Payments, Local Methods - PXV Pay',
    meta_description: 'Learn how PXV Pay enables global payments while supporting local payment preferences across 180+ countries.'
  },
  {
    title: 'Understanding Payment Method Optimization',
    slug: 'payment-method-optimization',
    content: `# Optimizing Payment Methods for Maximum Conversion

Payment method optimization is crucial for any business looking to maximize conversion rates and reduce cart abandonment. Here's how to do it right.

## The Psychology of Payment Choice

Customers have strong preferences when it comes to payment methods. Offering their preferred option can be the difference between a completed sale and an abandoned cart.

### Regional Preferences Matter

- **Asia-Pacific**: Mobile wallets (Alipay, WeChat Pay, GrabPay)
- **Europe**: SEPA transfers, Klarna, Giropay
- **Latin America**: PIX, OXXO, Boleto Bancário
- **Africa**: Mobile money (M-Pesa, MTN Mobile Money)

## Implementation Best Practices

When implementing multiple payment methods, consider these factors:

1. **Load time optimization** - Don't let payment options slow down your checkout
2. **User experience** - Make the selection process intuitive
3. **Security compliance** - Ensure all methods meet regulatory requirements
4. **Analytics tracking** - Monitor which methods convert best

## Results You Can Expect

Businesses that optimize their payment methods typically see:
- 15-30% increase in conversion rates
- 20-40% reduction in cart abandonment
- Higher customer satisfaction scores
- Improved international expansion success`,
    excerpt: 'A clever algorithm for more accurate code completion sampling and payment optimization strategies.',
    featured_image: null,
    published: true,
    tags: ['optimization', 'conversion', 'ux', 'analytics'],
    meta_title: 'Payment Method Optimization Guide - PXV Pay',
    meta_description: 'Learn how to optimize payment methods for higher conversion rates and reduced cart abandonment.'
  },
  {
    title: 'The Economics of Cross-Border Payments',
    slug: 'economics-cross-border-payments',
    content: `# Breaking Down Cross-Border Payment Costs

Cross-border payments have traditionally been expensive and slow. Understanding the economics helps businesses make better decisions.

## Traditional Banking Challenges

Legacy banking systems were built for domestic transactions. When payments cross borders, they face multiple challenges:

- **Correspondent banking** adds layers and costs
- **Currency conversion** spreads reduce value
- **Regulatory compliance** requires extensive documentation
- **Settlement delays** can take 3-5 business days

## The Modern Solution

New payment technologies are revolutionizing cross-border transactions:

### Real-time Settlement
Modern payment rails enable instant settlement across borders, reducing counterparty risk and improving cash flow.

### Transparent Pricing
No hidden fees or unfavorable exchange rates. You see exactly what you pay and what your recipient receives.

### Automated Compliance
Smart systems handle regulatory requirements automatically, reducing manual work and errors.

## Impact on Business

Companies using modern cross-border payment solutions report:
- 60% reduction in payment processing time
- 40% lower transaction costs
- 90% fewer payment failures
- Improved vendor and customer relationships`,
    excerpt: 'A primer on cross-border payment economics and examination of the costs of international transactions.',
    featured_image: null,
    published: true,
    tags: ['economics', 'cross-border', 'fintech', 'business'],
    meta_title: 'Economics of Cross-Border Payments - PXV Pay',
    meta_description: 'Understand the economics behind cross-border payments and how modern solutions reduce costs and improve efficiency.'
  },
  {
    title: 'Building Payment Infrastructure for Scale',
    slug: 'building-payment-infrastructure-scale',
    content: `# Scaling Payment Infrastructure: Lessons Learned

Building payment infrastructure that can handle millions of transactions requires careful planning and robust engineering.

## Architecture Principles

When designing for scale, we follow these key principles:

### Microservices Architecture
Breaking payment processing into discrete services allows independent scaling and fault isolation.

### Event-Driven Design
Asynchronous processing ensures the system remains responsive under high load.

### Database Sharding
Distributing data across multiple databases prevents any single point of failure.

## Handling Peak Loads

Payment traffic is rarely uniform. Major events like Black Friday can increase transaction volume by 10x or more.

### Auto-scaling Infrastructure
Our Kubernetes-based infrastructure automatically scales pods based on traffic patterns.

### Circuit Breakers
When external services fail, circuit breakers prevent cascading failures.

### Graceful Degradation
Non-critical features are disabled during high load to maintain core functionality.

## Security at Scale

Security becomes more challenging as you scale:
- End-to-end encryption for all sensitive data
- Real-time fraud detection using machine learning
- Regular security audits and penetration testing
- Compliance with PCI DSS, SOC 2, and other standards

The result is a payment platform that maintains 99.99% uptime while processing millions of transactions daily.`,
    excerpt: 'We\'ve raised $105M to further our mission of automating payments at global scale.',
    featured_image: null,
    published: true,
    tags: ['infrastructure', 'scaling', 'engineering', 'architecture'],
    meta_title: 'Building Payment Infrastructure for Scale - PXV Pay',
    meta_description: 'Learn how to build scalable payment infrastructure that can handle millions of transactions with 99.99% uptime.'
  },
  {
    title: 'Early Team Spotlight: The People Behind PXV Pay',
    slug: 'early-team-spotlight',
    content: `# Meet the Team Building the Future of Payments

Behind every great product is a great team. Here are some of the amazing people building PXV Pay.

## Our Engineering Leaders

### Sarah Chen - VP of Engineering
Former principal engineer at Stripe, Sarah brings deep expertise in payment systems and distributed computing. She's passionate about building reliable infrastructure that developers love to use.

### Marcus Rodriguez - Head of Security
With 15 years of experience in financial security, Marcus ensures our platform meets the highest security standards while remaining user-friendly.

### Li Wei - Senior Full-Stack Engineer
Li previously built payment systems at Ant Financial and brings valuable experience from the Chinese fintech ecosystem.

## Product & Design

### Emma Thompson - Head of Product
Emma's background in UX design and product management helps us build payment experiences that users actually enjoy.

### David Kim - Senior Product Designer
David's design philosophy centers on simplicity and accessibility, ensuring our platform works for businesses of all sizes.

## Global Expansion

### Priya Patel - Head of International
Priya leads our expansion into new markets, understanding local payment preferences and regulatory requirements.

### Jean-Philippe Dubois - EU Operations Lead
Based in Paris, Jean-Philippe manages our European operations and ensures compliance with EU regulations.

## What Drives Us

We're united by a common vision: making global payments as simple as local ones. Every team member brings unique perspectives and experiences that make our platform better.

Our diverse backgrounds - spanning fintech, traditional banking, e-commerce, and technology - give us the expertise needed to solve complex payment challenges.`,
    excerpt: 'Lots of great people are behind PXV Pay! Here are some of the team members building the future of payments.',
    featured_image: null,
    published: true,
    tags: ['team', 'culture', 'people', 'spotlight'],
    meta_title: 'Early Team Spotlight - PXV Pay',
    meta_description: 'Meet the talented team building the future of global payments at PXV Pay.'
  }
]

async function createSamplePosts() {
  try {
    // First, let's find or create a super admin user to be the author
    const { data: superAdmin, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1)
      .single()

    if (adminError || !superAdmin) {
      console.error('No super admin found. Please create a super admin user first.')
      return
    }

    console.log(`Using super admin ID: ${superAdmin.id}`)

    // Check if posts already exist
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('slug')
      
    const existingSlugs = new Set(existingPosts?.map(post => post.slug) || [])

    // Filter out posts that already exist
    const newPosts = samplePosts.filter(post => !existingSlugs.has(post.slug))
    
    if (newPosts.length === 0) {
      console.log('All sample posts already exist in the database.')
      return
    }

    // Add author_id to each post
    const postsWithAuthor = newPosts.map(post => ({
      ...post,
      author_id: superAdmin.id,
      published_at: new Date().toISOString()
    }))

    // Insert new posts
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(postsWithAuthor)

    if (error) {
      console.error('Error inserting sample posts:', error)
      return
    }

    console.log(`Successfully added ${newPosts.length} sample blog posts.`)
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createSamplePosts() 