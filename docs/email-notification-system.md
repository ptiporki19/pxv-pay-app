# PXV Pay Email Notification System

A comprehensive, branded email notification system for PXV Pay that handles all customer, merchant, and admin communications.

## 🎯 Overview

The email notification system provides:

- **Customer Communications**: Payment confirmations, status updates
- **Merchant Notifications**: New payment alerts, verification requests  
- **Admin Alerts**: New user signups, payment activity monitoring
- **Branded Templates**: Professional, consistent email design
- **Multi-provider Support**: SendGrid, SMTP, and development fallbacks
- **Real-time Integration**: Works alongside existing in-app notifications

## 📧 Email Types Implemented

### 1. Customer Emails

#### Payment Proof Submitted Confirmation
- **Trigger**: When customer uploads payment proof
- **Purpose**: Confirm receipt and set expectations
- **Content**: Payment details, review timeline, next steps

#### Payment Status Update  
- **Trigger**: When merchant approves/rejects payment
- **Purpose**: Notify customer of verification results
- **Content**: Status, reasoning (if rejected), next actions

#### Welcome Email
- **Trigger**: New user registration
- **Purpose**: Onboard new users with getting started guidance
- **Content**: Welcome message, feature overview, dashboard access

### 2. Merchant Emails

#### New Payment Notification
- **Trigger**: Customer submits payment proof
- **Purpose**: Alert merchant to pending verification
- **Content**: Customer details, payment info, dashboard link

### 3. Admin Emails

#### Payment Activity Alert
- **Trigger**: New payment submission
- **Purpose**: Monitor platform activity
- **Content**: Full payment and user details

#### New User Signup Notification
- **Trigger**: User registration completion
- **Purpose**: Track user growth and onboarding
- **Content**: User details, registration info

## 🏗️ Architecture

### Core Components

```
src/lib/email-service.ts          # Main email service with templates
supabase/functions/send-email/    # Edge function for email delivery
src/app/api/checkout/.../route.ts # Integration point for payments
src/app/actions/auth.ts           # Integration point for signups
```

### Flow Diagram

```
Customer Action → API Route → Email Service → Edge Function → Email Provider → Recipient
     ↓              ↓              ↓              ↓              ↓           ↓
  Upload Proof → Checkout API → Generate Email → SendGrid API → Email Sent → Customer
```

## ⚙️ Configuration

### Environment Variables

#### Required for Production
```bash
# Email Provider (choose one)
SENDGRID_API_KEY=your_sendgrid_api_key

# OR for generic SMTP
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password

# Sender Information
FROM_EMAIL=noreply@pxvpay.com
FROM_NAME="PXV Pay"

# Application URLs (for dashboard links)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### Supabase Configuration
```bash
# In your Supabase project settings
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Supabase Setup

1. **Deploy Edge Function**
   ```bash
   chmod +x scripts/deploy-email-function.sh
   ./scripts/deploy-email-function.sh
   ```

2. **Set Environment Variables** in Supabase Dashboard:
   - Project Settings → Edge Functions → Environment Variables
   - Add your email provider credentials

3. **Enable SMTP in config.toml** (optional):
   ```toml
   [auth.email.smtp]
   enabled = true
   host = "smtp.sendgrid.net"
   port = 587
   user = "apikey"
   pass = "env(SENDGRID_API_KEY)"
   admin_email = "admin@pxvpay.com"
   sender_name = "PXV Pay"
   ```

## 🎨 Email Templates

### Design Features

- **Branded Styling**: PXV Pay colors and typography
- **Responsive Design**: Mobile-optimized layouts
- **Professional Look**: Clean, modern email design
- **Accessible**: Proper HTML structure and alt text
- **Dark Mode Friendly**: Compatible with dark mode email clients

### Template Components

- **Header**: PXV Pay branding with primary color background
- **Content Area**: Clean white background with structured information
- **Action Buttons**: Prominent CTAs for dashboard access
- **Footer**: Contact information and unsubscribe options
- **Tables**: Formatted payment and user details

### Customization

Templates are generated dynamically with:
- Company branding (colors, logo, name)
- Contextual content (payment details, user info)
- Personalized messaging (customer/merchant names)
- Action buttons with appropriate URLs

## 🔗 Integration Points

### 1. Checkout Flow Integration

**File**: `src/app/api/checkout/[slug]/submit/route.ts`

```typescript
// After payment creation
await emailService.sendPaymentProofSubmittedEmail(
  customerEmail,
  customerName,
  {
    amount: amount,
    currency: finalCurrency,
    paymentMethod: paymentMethod.name
  }
)
```

### 2. User Registration Integration

**File**: `src/app/actions/auth.ts`

```typescript
// After successful user creation
await emailService.sendWelcomeEmail(
  formData.email,
  formData.fullName
)
```

### 3. Admin Notifications

Automatically triggered for:
- New payment submissions
- User registrations
- System events requiring admin attention

## 📱 Integration with Existing System

### Complements In-App Notifications

- **Database notifications** continue to work for real-time UI updates
- **Email notifications** provide persistent, external communication
- **Both systems** can be enabled simultaneously without conflicts

### Notification Flow

```
User Action
    ├── Database Notification (real-time, in-app)
    └── Email Notification (persistent, external)
```

## 🧪 Testing

### Automated Testing

```bash
# Run email system tests
node scripts/test-email-system.js
```

### Manual Testing

1. **Test Environment Setup**
   - Use development email addresses
   - Configure test SMTP or SendGrid sandbox

2. **Test Scenarios**
   - Create test checkout and submit payment proof
   - Register new test user account
   - Check admin notifications

3. **Verification**
   - Check email delivery in provider dashboard
   - Verify email content and formatting
   - Test responsive design on mobile devices

## 🚀 Deployment Steps

### 1. Initial Setup

```bash
# 1. Deploy the Edge Function
./scripts/deploy-email-function.sh

# 2. Configure environment variables
# Add to Supabase project settings

# 3. Test the system
node scripts/test-email-system.js
```

### 2. Production Considerations

- **Email Deliverability**: Set up SPF, DKIM, and DMARC records
- **Rate Limiting**: Monitor email sending limits
- **Error Handling**: Set up monitoring for failed email deliveries
- **Template Updates**: Version control email template changes

## 🔧 Maintenance

### Monitoring

- **Email Delivery Rates**: Track via SendGrid dashboard
- **Error Logs**: Monitor Supabase Edge Function logs
- **User Feedback**: Track email-related support requests

### Updates

- **Template Changes**: Update `src/lib/email-service.ts`
- **New Email Types**: Add methods to EmailService class
- **Integration Points**: Update API routes and actions as needed

## 🐛 Troubleshooting

### Common Issues

#### Emails Not Sending
1. Check Edge Function deployment status
2. Verify environment variables are set
3. Confirm email provider credentials
4. Review Supabase function logs

#### Template Issues
1. Test HTML rendering in email clients
2. Validate HTML structure
3. Check CSS support in email clients
4. Test on different devices and clients

#### Integration Problems
1. Verify import statements
2. Check method signatures match
3. Review error logs in API routes
4. Confirm database triggers are working

### Debug Commands

```bash
# Check function deployment
supabase functions list

# View function logs
supabase functions logs send-email

# Test email service directly
node -e "require('./src/lib/email-service').emailService.sendWelcomeEmail('test@example.com', 'Test User')"
```

## 📊 Metrics and Analytics

### Key Metrics to Track

- **Email Delivery Rate**: Percentage of emails successfully delivered
- **Open Rates**: Customer engagement with email content
- **Click-through Rates**: Dashboard and action button clicks
- **Error Rates**: Failed email attempts and reasons

### Implementation

- SendGrid provides built-in analytics
- Custom tracking can be added via webhook endpoints
- Integration with existing analytics platforms

## 🔮 Future Enhancements

### Phase 2 Planned Features

- **Email Templates Editor**: Admin interface for template customization
- **Email Preferences**: User-controlled notification settings
- **Advanced Segmentation**: Targeted emails based on user behavior
- **A/B Testing**: Template and content optimization
- **Multilingual Support**: Localized email content
- **Email Scheduling**: Delayed and recurring notifications

### Phase 3 Advanced Features

- **Rich Media**: Enhanced templates with images and videos
- **Interactive Elements**: In-email actions and forms
- **Advanced Analytics**: Heat mapping and engagement tracking
- **AI Personalization**: Dynamic content based on user patterns
- **Integration Ecosystem**: Webhooks and third-party service connections

## 📄 API Reference

### EmailService Methods

#### `sendPaymentProofSubmittedEmail(email, name, paymentDetails)`
Send confirmation to customer after payment proof upload.

#### `sendNewPaymentNotificationEmail(email, merchantName, paymentDetails)`  
Notify merchant of new payment requiring verification.

#### `sendAdminPaymentNotificationEmail(email, paymentDetails)`
Alert admin of new payment activity.

#### `sendNewUserSignupNotificationEmail(email, userDetails)`
Notify admin of new user registration.

#### `sendWelcomeEmail(email, name)`
Send welcome message to new users.

#### `sendPaymentStatusUpdateEmail(email, name, paymentDetails)`
Update customer on payment verification status.

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: PXV Pay Development Team 