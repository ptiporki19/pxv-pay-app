# PXV Pay Checkout System - Complete Specification

## Table of Contents
1. [System Overview](#system-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Database Schema Design](#database-schema-design)
4. [Merchant Dashboard Integration](#merchant-dashboard-integration)
5. [Public Checkout Flow](#public-checkout-flow)
6. [Notification System](#notification-system)
7. [Customization Features](#customization-features)
8. [Technical Implementation](#technical-implementation)
9. [Future Enhancements](#future-enhancements)

---

## System Overview

The PXV Pay checkout system is designed to provide merchants with customizable, shareable checkout links that allow customers to make payments without requiring authentication. Each merchant can create multiple checkout links with different configurations, targeting specific countries and use cases.

### Core Principles
- **Merchant-Centric**: Each checkout link is owned and configured by a specific merchant
- **No Customer Authentication**: Customers complete payments without creating accounts
- **Mandatory Proof Upload**: All payment types require proof of payment upload
- **Real-time Notifications**: Merchants receive instant notifications of new payments
- **Customizable Experience**: Merchants can customize their checkout pages with logos and text
- **Country-Specific Configuration**: Each checkout link can target specific countries

---

## User Roles & Permissions

### 1. Customer (Unauthenticated)
**Description**: End users who make payments through merchant checkout links

**Capabilities**:
- Access merchant checkout links without authentication
- Complete payment information forms
- Select from available payment methods
- Upload proof of payment
- Receive email notifications about payment status

**Restrictions**:
- Cannot access any dashboard or admin features
- Cannot view other customers' payment information
- Cannot modify merchant configurations

### 2. Merchant (Free/Subscriber)
**Description**: Authenticated users who configure payment systems and receive payments

**Current MVP Status**: Both free and subscriber merchants have identical capabilities. Future development will introduce feature restrictions for free users.

**Capabilities**:
- Create and manage multiple checkout links
- Configure countries, currencies, and payment methods
- Customize checkout page appearance (logo, text)
- Receive real-time payment notifications
- Verify payments (approve/reject)
- View payment history and analytics
- Manage merchant profile and settings

**Restrictions**:
- Cannot access super admin features
- Cannot manage other merchants' data
- Cannot modify global system settings

### 3. Super Admin
**Description**: System administrators with full platform control

**Capabilities**:
- All merchant capabilities
- Manage all merchant accounts (activate/deactivate)
- View global payment analytics
- Manage global system settings
- Access audit logs
- Manage global countries, currencies, and payment method types
- Override merchant configurations when necessary

**Restrictions**:
- None (full system access)

---

## Database Schema Design

### New Tables

#### `checkout_links`
```sql
CREATE TABLE checkout_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL, -- Auto-generated for MVP, e.g., "merchant-abc123"
    link_name TEXT NOT NULL, -- Merchant-defined name for internal reference
    active_country_codes TEXT[] NOT NULL DEFAULT '{}', -- Countries enabled for this link
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Customization overrides (if NULL, use merchant_checkout_settings defaults)
    logo_url TEXT, -- Override merchant default logo
    checkout_page_heading TEXT, -- Override default heading
    payment_review_message TEXT, -- Override default review message
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `merchant_checkout_settings`
```sql
CREATE TABLE merchant_checkout_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Default customization settings
    default_logo_url TEXT,
    default_checkout_page_heading TEXT DEFAULT 'Complete Your Payment',
    default_manual_payment_instructions TEXT DEFAULT 'Please follow the payment instructions below and upload your proof of payment.',
    default_payment_review_message TEXT DEFAULT 'Thank you for your payment! Your transaction is under review and you will receive an email notification once it has been processed.',
    
    -- Email templates
    payment_approved_email_subject TEXT DEFAULT 'Payment Approved - Transaction Confirmed',
    payment_approved_email_body TEXT DEFAULT 'Your payment has been approved and processed successfully. Thank you for your business!',
    payment_rejected_email_subject TEXT DEFAULT 'Payment Rejected - Action Required',
    payment_rejected_email_body TEXT DEFAULT 'Unfortunately, your payment could not be verified. Please contact us for assistance.',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Modified Tables

#### `payments` (Enhanced)
```sql
-- Add new columns to existing payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS checkout_link_id UUID REFERENCES checkout_links(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status_update_notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Update status enum to include new statuses
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check 
CHECK (status IN ('pending_verification', 'approved', 'rejected', 'expired'));
```

#### `payment_methods` (Enhanced)
```sql
-- Add checkout-specific instructions
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS instructions_for_checkout TEXT;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
```

### RLS Policies

#### `checkout_links` Policies
```sql
-- Merchants can manage their own checkout links
CREATE POLICY "Merchants can view their own checkout links"
ON checkout_links FOR SELECT
USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can create their own checkout links"
ON checkout_links FOR INSERT
WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can update their own checkout links"
ON checkout_links FOR UPDATE
USING (auth.uid() = merchant_id);

-- Super admins can view all checkout links
CREATE POLICY "Super admins can view all checkout links"
ON checkout_links FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND user_type = 'admin'
    )
);
```

#### `merchant_checkout_settings` Policies
```sql
-- Similar RLS structure as checkout_links
CREATE POLICY "Merchants can manage their own checkout settings"
ON merchant_checkout_settings FOR ALL
USING (auth.uid() = merchant_id);
```

---

## Merchant Dashboard Integration

### New Dashboard Sections

#### 1. Checkout Links Management
**Location**: New main navigation item "Checkout Links"

**Features**:
- **Overview Dashboard**:
  - List of all checkout links with status, creation date, and usage stats
  - Quick actions: Copy link, Edit, Activate/Deactivate, Delete
  - Create new checkout link button

- **Create/Edit Checkout Link**:
  - Link name (internal reference)
  - Country selection (multi-select from merchant's configured countries)
  - Customization options:
    - Upload custom logo (override default)
    - Custom heading text
    - Custom payment review message
  - Preview functionality

- **Link Analytics** (Future Enhancement):
  - Payment volume per link
  - Conversion rates
  - Popular payment methods per link

#### 2. Enhanced Theme Customization
**Location**: Existing "Theme Customization" section

**New Features**:
- **Default Checkout Appearance**:
  - Default logo upload for all checkout links
  - Default heading text
  - Default payment review message
  - Color scheme selection (future)

#### 3. Enhanced Content Customization
**Location**: Existing "Content Customization" section

**New Features**:
- **Email Templates**:
  - Payment approved email (subject and body)
  - Payment rejected email (subject and body)
  - Email preview functionality
  - Variable placeholders (customer name, amount, etc.)

- **Payment Instructions**:
  - Default manual payment instructions
  - Per-payment-method specific instructions

### Modified Sections

#### Payment Methods
**Enhancements**:
- Add "Instructions for Checkout" field when creating/editing payment methods
- Display order configuration
- Preview how payment method appears in checkout

#### Payment Verification
**Enhancements**:
- Filter by checkout link
- Show customer details (name, email) prominently
- Display payment proof with zoom/download functionality
- Add rejection reason field
- Bulk approval actions

---

## Public Checkout Flow

### URL Structure
```
https://yourdomain.com/c/{slug}
```
Where `{slug}` is the unique identifier for each checkout link.

### Step-by-Step Flow

#### Step 1: Initial Page Load
**URL**: `/c/{slug}`

**Process**:
1. Validate slug exists and checkout link is active
2. Fetch merchant details and checkout settings
3. Fetch active countries for this checkout link
4. Display customer information form

**Page Content**:
- Merchant logo (from checkout link override or default)
- Custom heading (from checkout link override or default)
- Form fields:
  - Customer Name (required)
  - Customer Email (required, for notifications)
  - Amount (required, number input with currency symbol)
  - Country (required, dropdown of active countries for this link)
- "Proceed to Payment Methods" button

**Technical Notes**:
- Currency is automatically determined based on selected country
- Form validation on client and server side
- Data temporarily stored in encrypted session/cookie

#### Step 2: Payment Method Selection
**URL**: `/c/{slug}/methods` (or same page with step parameter)

**Process**:
1. Fetch payment methods available for selected country
2. Filter by merchant's configured payment methods
3. Display available options

**Page Content**:
- Progress indicator showing current step
- Selected amount and country summary
- List of available payment methods with:
  - Payment method icon
  - Payment method name
  - Brief description
  - Selection radio button or card
- "Continue with Selected Method" button

**Technical Notes**:
- Payment methods filtered by country and merchant configuration
- Methods sorted by display_order
- Selected method stored in session

#### Step 3: Payment Execution & Proof Upload
**URL**: `/c/{slug}/payment` (or same page with step parameter)

**Process**:
1. Display payment-specific instructions
2. Handle external payment flow
3. Collect proof of payment

**Page Content**:

**For Manual Payment Methods**:
- Payment method specific instructions (from `instructions_for_checkout`)
- Payment details (account numbers, reference codes, etc.)
- Clear instructions to complete payment externally
- File upload section for proof of payment

**For Payment Link Methods**:
- Brief explanation of redirect
- External payment link button
- Clear instructions: "After completing payment, return to this page to upload proof"
- File upload section for proof of payment

**Common Elements**:
- Payment summary (amount, currency, method)
- File upload component:
  - Accepted formats: JPG, PNG, PDF
  - Maximum file size: 5MB
  - Preview functionality
- "Submit Payment Proof" button

**Technical Notes**:
- File upload to Supabase Storage with proper security policies
- Payment record created with status 'pending_verification'
- Real-time notification sent to merchant

#### Step 4: Payment Confirmation
**URL**: `/c/{slug}/confirmation/{payment_id}`

**Process**:
1. Display confirmation message
2. Provide payment reference
3. Set expectations for verification

**Page Content**:
- Success checkmark icon
- Custom payment review message (from checkout link or default)
- Payment reference number
- Expected verification timeframe
- Contact information for questions
- Option to download payment receipt (future)

**Technical Notes**:
- Payment ID in URL for reference
- No sensitive information displayed
- Page accessible only immediately after payment submission

### Error Handling

#### Common Error Scenarios
1. **Invalid Checkout Link**: 404 page with merchant contact info
2. **Inactive Checkout Link**: Custom message with merchant contact info
3. **No Payment Methods Available**: Message suggesting customer contact merchant
4. **File Upload Errors**: Clear error messages with retry options
5. **Payment Creation Errors**: Graceful fallback with support contact

#### Error Page Design
- Consistent with merchant branding
- Clear error explanation
- Next steps for customer
- Merchant contact information
- Option to start over

---

## Notification System

### Real-time Notifications (Merchant)

#### Trigger Events
1. New payment proof uploaded
2. Payment status changed
3. Customer inquiry submitted (future)

#### Implementation
- Supabase Realtime subscriptions on payments table
- Browser notifications (with permission)
- In-app notification center
- Dashboard badge counters

#### Notification Content
- Customer name and email
- Payment amount and currency
- Payment method used
- Timestamp
- Quick action buttons (Approve/Reject)

### Email Notifications (Customer)

#### Payment Approved Email
**Trigger**: Merchant approves payment
**Template Variables**:
- `{customer_name}`: Customer's name
- `{amount}`: Payment amount
- `{currency}`: Payment currency
- `{payment_reference}`: Unique payment ID
- `{merchant_name}`: Merchant business name
- `{verification_date}`: Date payment was verified

#### Payment Rejected Email
**Trigger**: Merchant rejects payment
**Template Variables**:
- Same as approved, plus:
- `{rejection_reason}`: Merchant's reason for rejection
- `{merchant_contact}`: Merchant contact information

#### Implementation
- Email service integration (Resend, SendGrid, or Supabase Edge Functions)
- Template system with variable replacement
- Delivery tracking and retry logic
- Unsubscribe handling (future)

### Automated Reminders (Future Enhancement)

#### Missing Proof Upload Reminder
**Trigger**: 30 minutes after payment method selection, no proof uploaded
**Content**: Reminder email with direct link to upload proof

#### Verification Reminder (Merchant)
**Trigger**: 24 hours after proof upload, no merchant action
**Content**: Dashboard notification and email reminder

---

## Customization Features

### Merchant Branding

#### Logo Management
- **Default Logo**: Set in merchant_checkout_settings, used across all checkout links
- **Link-Specific Logo**: Override default for specific checkout links
- **Technical Requirements**:
  - Supported formats: PNG, JPG, SVG
  - Maximum size: 2MB
  - Recommended dimensions: 200x80px
  - Automatic optimization and CDN delivery

#### Text Customization
- **Checkout Page Heading**: Welcome message on initial page
- **Payment Review Message**: Confirmation page message
- **Email Templates**: Approval and rejection email content
- **Payment Instructions**: Method-specific guidance

#### Color Schemes (Future)
- Primary brand color
- Secondary accent color
- Button styles
- Background options

### Content Management

#### Template System
- Variable placeholders for dynamic content
- Preview functionality before saving
- Fallback to system defaults
- Multi-language support (future)

#### Instruction Management
- Global default instructions for manual payments
- Payment method specific instructions
- Rich text editor for formatting
- Image embedding for visual instructions

---

## Technical Implementation

### Frontend Architecture

#### Public Checkout Pages
- **Framework**: Next.js App Router
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: React Hook Form + Zustand for complex state
- **File Upload**: Custom component with Supabase Storage integration
- **Responsive Design**: Mobile-first approach

#### Merchant Dashboard Integration
- **Existing Structure**: Extend current admin layout
- **New Components**:
  - CheckoutLinksList
  - CheckoutLinkForm
  - PaymentProofViewer
  - EmailTemplateEditor
  - LogoUploader

### Backend Architecture

#### API Routes
```
/api/checkout/[slug]/validate     - Validate checkout link
/api/checkout/[slug]/countries    - Get active countries
/api/checkout/[slug]/methods      - Get payment methods
/api/checkout/[slug]/submit       - Submit payment
/api/merchant/checkout-links      - CRUD operations
/api/merchant/checkout-settings   - Settings management
/api/payments/verify              - Payment verification
```

#### Server Actions
```typescript
// Checkout flow actions
validateCheckoutLink(slug: string)
getPaymentMethods(slug: string, country: string)
submitPayment(data: PaymentSubmissionData)

// Merchant management actions
createCheckoutLink(data: CheckoutLinkData)
updateCheckoutSettings(data: SettingsData)
verifyPayment(paymentId: string, action: 'approve' | 'reject', notes?: string)
```

#### File Storage
- **Supabase Storage** for payment proofs and logos
- **Bucket Structure**:
  ```
  payment-proofs/
    {merchant_id}/
      {payment_id}/
        proof.{ext}
  
  merchant-logos/
    {merchant_id}/
      default.{ext}
      {checkout_link_id}.{ext}
  ```
- **Security Policies**: RLS-based access control

### Database Considerations

#### Performance Optimizations
- Indexes on frequently queried columns
- Materialized views for analytics (future)
- Connection pooling for high traffic

#### Data Integrity
- Foreign key constraints
- Check constraints for enums
- Unique constraints where appropriate
- Audit logging for sensitive operations

### Security Measures

#### Public Checkout Security
- Rate limiting on form submissions
- File upload validation and scanning
- CSRF protection
- Input sanitization and validation

#### Merchant Dashboard Security
- Existing RLS policies extended
- Session management
- API route protection
- File access controls

---

## Future Enhancements

### Phase 2: Advanced Features
1. **Custom Slug Generation**: Allow subscribers to customize checkout link URLs
2. **Advanced Analytics**: Conversion tracking, payment method performance
3. **Webhook Integration**: Real-time notifications to merchant systems
4. **Multi-currency Support**: Dynamic currency conversion
5. **Recurring Payments**: Subscription-style payment links

### Phase 3: Enterprise Features
1. **White-label Solutions**: Complete branding customization
2. **API Access**: Programmatic checkout link management
3. **Advanced Reporting**: Detailed financial reports and exports
4. **Team Management**: Multiple users per merchant account
5. **Compliance Tools**: Tax reporting, audit trails

### Phase 4: Platform Expansion
1. **Mobile App**: Native iOS/Android checkout experience
2. **Payment Gateway Integration**: Direct payment processing
3. **Marketplace Features**: Multi-vendor support
4. **International Expansion**: Localization and regional payment methods

---

## Implementation Roadmap

### Sprint 1: Database & Core Infrastructure
- [ ] Create new database tables and migrations
- [ ] Set up RLS policies
- [ ] Create basic API routes
- [ ] Set up file storage buckets

### Sprint 2: Merchant Dashboard Integration
- [ ] Checkout links management interface
- [ ] Enhanced theme customization
- [ ] Email template management
- [ ] Payment verification enhancements

### Sprint 3: Public Checkout Flow
- [ ] Multi-step checkout form
- [ ] Payment method selection
- [ ] File upload functionality
- [ ] Confirmation pages

### Sprint 4: Notifications & Polish
- [ ] Real-time notification system
- [ ] Email notification service
- [ ] Error handling and edge cases
- [ ] Mobile responsiveness testing

### Sprint 5: Testing & Launch
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation and training materials

---

## Success Metrics

### Technical Metrics
- Page load times < 2 seconds
- File upload success rate > 99%
- Real-time notification delivery < 5 seconds
- Mobile responsiveness score > 95%

### Business Metrics
- Checkout completion rate > 80%
- Payment verification time < 24 hours
- Customer satisfaction score > 4.5/5
- Merchant adoption rate > 70%

### User Experience Metrics
- Form abandonment rate < 20%
- Error rate < 5%
- Support ticket volume < 10% of transactions
- Mobile usage > 60%

---

This specification serves as the complete reference for implementing the PXV Pay checkout system. All development decisions should align with the requirements and flows outlined in this document. 