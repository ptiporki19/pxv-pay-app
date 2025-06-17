# User Profile Management Feature

## Overview
This feature provides super admins with comprehensive user profile views to better understand user activity and make informed decisions about account management.

## Features

### 1. Enhanced User Management
- **View Profile** option in user actions dropdown
- Comprehensive user information display
- Account management actions from profile page

### 2. Profile Information Displayed

#### User Details
- Email address and user ID
- Account role (Super Admin, Subscriber, User)
- Account status (Active/Inactive)
- Join date and account age

#### Statistics Overview
- **Total Payments**: Number and total volume
- **Success Rate**: Payment completion percentage
- **Payment Methods**: Active methods configured
- **Markets**: Countries and currencies supported

#### Detailed Sections
- **Recent Payments**: Latest 5 transactions with status
- **Payment Methods**: Configured payment options
- **Countries**: Supported markets
- **Currencies**: Available currencies

### 3. Administrative Actions
From the profile page, super admins can:
- Change user roles (User, Subscriber, Super Admin)
- Activate/Deactivate accounts
- View comprehensive account activity

## Implementation

### Files Created/Modified

#### New Files
- `src/app/(admin)/users/[id]/profile/page.tsx` - Profile page route
- `src/components/admin/user-profile.tsx` - Main profile component
- `src/app/api/users/[id]/profile/route.ts` - API endpoint for profile data
- `supabase/migrations/20250525000000_add_super_admin_policies.sql` - RLS policies
- `apply-super-admin-policies.js` - Migration script

#### Modified Files
- `src/components/admin/users-list.tsx` - Added "View Profile" option

### Database Structure
The profile leverages existing tables:
- `users` - User account information
- `payments` - Payment transactions
- `payment_methods` - Configured payment options
- `countries` - Supported markets
- `currencies` - Available currencies

### Security
- Super admin role verification on both client and server
- RLS policies for secure data access
- Service role API for comprehensive data fetching

## Usage

### Accessing User Profiles
1. Navigate to User Management (`/users`)
2. Click the three dots (⋯) menu for any user
3. Select "View Profile"
4. View comprehensive user information
5. Use the Actions dropdown for account management

### Profile Sections

#### Header
- Back navigation to user list
- User identification with role and status badges
- Actions dropdown for account management

#### Stats Cards
- Total Payments with volume
- Success Rate with breakdown
- Payment Methods count
- Markets and currencies summary

#### Detailed Information
- Recent payment transactions
- Configured payment methods
- Active countries
- Supported currencies

### Administrative Actions
Use the Actions button in the profile header to:
- **Make User**: Change role to registered_user
- **Make Subscriber**: Change role to subscriber  
- **Make Super Admin**: Change role to super_admin
- **Activate/Deactivate**: Toggle account status

## Security Features

### Authentication
- Session validation for all requests
- Super admin role verification
- Unauthorized access prevention

### Authorization  
- RLS policies for data access control
- Service role for admin operations
- Role-based action permissions

### Data Protection
- User-specific data isolation
- Audit trail for admin actions
- Secure API endpoints

## Technical Details

### API Endpoint: `/api/users/[id]/profile`
- **Method**: GET
- **Auth**: Bearer token required
- **Role**: Super admin only
- **Response**: User data, payments, stats, etc.

### RLS Policies Added
- `super_admin_view_all_payments`
- `super_admin_view_all_countries` 
- `super_admin_view_all_currencies`
- `super_admin_view_all_payment_methods`

### Components Structure
```
UserProfile/
├── Header (navigation, actions)
├── UserInfoCard (basic info, badges)
├── StatsOverview (4 metric cards)
└── DetailedSections/
    ├── RecentPayments
    ├── PaymentMethods
    ├── Countries
    └── Currencies
```

## Future Enhancements

### Potential Additions
- Export user data functionality
- Advanced filtering and search
- Payment analytics charts
- Account activity timeline
- Bulk user management actions
- Email communication tools

### Performance Optimizations
- Pagination for large datasets
- Caching for frequently accessed data
- Real-time updates via subscriptions
- Lazy loading for detailed sections

## Deployment

### Required Steps
1. Deploy code changes
2. Run migration: `node apply-super-admin-policies.js`
3. Verify super admin access
4. Test user profile functionality

### Environment Variables
Ensure these are configured:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

### Common Issues
1. **Access Denied**: Verify super admin role
2. **Data Not Loading**: Check RLS policies
3. **API Errors**: Validate environment variables
4. **Route Not Found**: Confirm file structure

### Debug Steps
1. Check browser console for errors
2. Verify API endpoint responses
3. Confirm database policies
4. Test with different user roles 