# Mobile Implementation Rules - PXV Pay

This document defines the strict rules and patterns for implementing mobile pages for PXV Pay.

## 🎯 Core Principles

### 1. **Zero Desktop Impact Rule**
- **NEVER** modify existing desktop components or routes
- **NEVER** change existing business logic, APIs, or hooks
- **ALWAYS** create separate mobile-specific components
- **ALWAYS** reuse existing business logic without modification

### 2. **Complete Functionality Parity Rule**
- **EVERY** desktop feature must work identically on mobile
- **ALL** API calls, validations, and business logic must be identical
- **ALL** authentication and permissions must work the same
- **ALL** real-time updates and notifications must function

### 3. **Template Fidelity Rule**
- **COPY** exact visual designs from `/mobile-version/App.tsx`
- **MAINTAIN** consistent spacing, colors, and typography
- **USE** identical component patterns and layouts
- **PRESERVE** the mobile-optimized user experience

## 📱 Technical Implementation Rules

### Route Structure Rule
```
✅ CORRECT:
/admin/checkout-links          → Desktop route (unchanged)
/m/admin/checkout-links        → Mobile route (new)

❌ INCORRECT:
/admin/checkout-links          → Responsive route (breaks separation)
/mobile/admin/checkout-links   → Wrong prefix
```

### Component Organization Rule
```
✅ CORRECT:
src/components/mobile/layout/MobileHeader.tsx
src/components/mobile/features/CheckoutLinks.tsx

❌ INCORRECT:
src/components/admin/checkout-links-mobile.tsx (mixing concerns)
src/components/CheckoutLinksMobile.tsx (wrong location)
```

### Business Logic Integration Rule
```typescript
✅ CORRECT:
// Mobile component imports existing logic
import { checkoutLinksApi } from '@/lib/supabase/client-api'
import { useCheckoutLinks } from '@/hooks/use-checkout-links'

❌ INCORRECT:
// Creating new API calls or hooks for mobile
const mobileCheckoutLinksApi = { ... }
```

## 🎨 Design System Rules

### Color Scheme (Must Match Exactly)
```css
✅ Primary Purple: #8B5CF6 (violet-500)
✅ Success Green: #10B981 (emerald-500)  
✅ Warning Yellow: #F59E0B (amber-500)
✅ Danger Red: #EF4444 (red-500)
✅ Background: bg-gray-50
✅ Cards: bg-white with border border-gray-200
```

### Typography Rules
```css
✅ Headers: text-xl to text-2xl font-semibold
✅ Body: text-sm to text-base
✅ Captions: text-xs text-gray-500
✅ Font: Default system fonts (no custom fonts on mobile)
```

### Spacing Rules
```css
✅ Container Padding: px-4 py-3
✅ Card Padding: p-4
✅ Gap Between Elements: gap-3 or gap-4
✅ Touch Targets: Minimum 44px (py-2.5 for buttons)
```

## 📐 Layout Pattern Rules

### Mobile Header Pattern (Fixed)
```typescript
✅ REQUIRED STRUCTURE:
- Logo on left
- Notifications + User menu on right  
- Fixed positioning with z-index
- Height: 64px (py-4)
- Background: bg-white with border-b
```

### Card List Pattern (For Tables)
```typescript
✅ REQUIRED STRUCTURE:
- Each table row → Individual card
- Card: bg-white border border-gray-200 rounded-lg p-4
- Primary info: font-semibold text-gray-900
- Secondary info: text-sm text-gray-500
- Status badges: Colored chips
- Actions: Dropdown menu on right
```

### Form Pattern (Single Column)
```typescript
✅ REQUIRED STRUCTURE:
- Single column layout always
- Input height: py-2.5 (44px touch target)
- Background: bg-gray-50 focus:bg-white
- Focus ring: focus:ring-2 focus:ring-purple-500
- Labels: text-sm font-medium text-gray-900 mb-1.5
```

### Stats Cards Pattern
```typescript
✅ REQUIRED STRUCTURE:
- Grid: grid-cols-2 gap-4
- Gradient backgrounds: bg-gradient-to-br from-purple-50 to-purple-100
- Border: border-purple-200
- Icon size: size-8
- Value: text-2xl font-bold
```

## 🔧 Device Detection Rules

### Breakpoint Rule
```typescript
✅ Mobile Trigger: ≤ 768px
✅ Desktop: > 768px
✅ Implementation: Next.js middleware
✅ Redirect: Automatic, server-side
```

### Middleware Pattern
```typescript
✅ REQUIRED: Check user-agent and viewport
✅ REQUIRED: Redirect mobile devices to /m/ routes
✅ REQUIRED: Preserve authentication state
✅ REQUIRED: Handle all query parameters
```

## 🗂️ File Organization Rules

### Mobile Components Structure
```
src/components/mobile/
├── layout/
│   ├── MobileHeader.tsx      ✅ Fixed header with nav
│   ├── MobileNavigation.tsx  ✅ User menu & notifications  
│   └── MobileStats.tsx       ✅ Stats cards grid
├── ui/
│   ├── MobileCard.tsx        ✅ Base card component
│   ├── MobileForm.tsx        ✅ Form wrapper
│   └── MobileSearch.tsx      ✅ Search + filter bar
└── features/
    ├── checkout-links/       ✅ Feature-specific components
    ├── payment-methods/      ✅ Feature-specific components
    └── transactions/         ✅ Feature-specific components
```

### Route Structure
```
src/app/m/
├── admin/
│   ├── checkout-links/
│   │   ├── page.tsx          ✅ List page
│   │   ├── create/page.tsx   ✅ Create page
│   │   └── edit/[id]/page.tsx ✅ Edit page
│   ├── payment-methods/
│   └── transactions/
├── c/[slug]/
│   └── page.tsx              ✅ Customer checkout
└── layout.tsx                ✅ Mobile layout wrapper
```

## ⚡ Performance Rules

### Bundle Optimization
```typescript
✅ REQUIRED: Separate mobile bundles
✅ REQUIRED: Code splitting by route
✅ REQUIRED: Lazy loading for heavy components
✅ REQUIRED: Optimized images for mobile
```

### Loading States
```typescript
✅ REQUIRED: Skeleton loaders during data fetch
✅ REQUIRED: Button loading states during actions
✅ REQUIRED: Progressive loading for lists
✅ REQUIRED: Error boundaries for all components
```

## 🧪 Testing Rules

### Functionality Testing
```typescript
✅ REQUIRED: Every desktop feature must work on mobile
✅ REQUIRED: Cross-device authentication flow
✅ REQUIRED: API calls work identically
✅ REQUIRED: Form validation matches desktop
```

### UI Testing  
```typescript
✅ REQUIRED: Touch targets minimum 44px
✅ REQUIRED: Readable text on all screen sizes
✅ REQUIRED: Proper contrast ratios
✅ REQUIRED: No horizontal scrolling
```

### Device Testing
```typescript
✅ REQUIRED: iPhone Safari (iOS)
✅ REQUIRED: Android Chrome
✅ REQUIRED: iPad (tablet view)
✅ REQUIRED: Various screen sizes (320px - 768px)
```

## 🚨 Forbidden Patterns

### What NOT to Do
```typescript
❌ NEVER: Modify existing desktop components
❌ NEVER: Create new API endpoints for mobile
❌ NEVER: Duplicate business logic
❌ NEVER: Use different state management
❌ NEVER: Skip features because "it's mobile"
❌ NEVER: Use different authentication logic
❌ NEVER: Create responsive components (separate mobile pages only)
```

## ✅ Implementation Checklist

### Before Starting Any Page
- [ ] Identify corresponding desktop page
- [ ] Map all required functionality
- [ ] Locate existing API calls and hooks
- [ ] Find template design pattern in `/mobile-version/App.tsx`
- [ ] Plan component breakdown

### During Implementation
- [ ] Copy exact visual design from template
- [ ] Import existing business logic
- [ ] Maintain identical functionality
- [ ] Test on multiple devices
- [ ] Verify accessibility standards

### Before Completion
- [ ] Cross-test with desktop version
- [ ] Verify all edge cases work
- [ ] Check performance on mobile devices
- [ ] Validate with real mobile users

## 🎯 Quality Gates

### Code Quality
- All TypeScript types must be defined
- No console.logs in production code
- Proper error handling for all API calls
- Clean, readable component structure

### UX Quality  
- Smooth animations and transitions
- Intuitive touch interactions
- Clear visual feedback for actions
- Consistent navigation patterns

### Performance Quality
- First Contentful Paint < 2s on mobile
- Interactive within 3s on mobile
- Smooth 60fps animations
- Optimized bundle sizes

---

**Remember: These rules ensure we create a professional, feature-complete mobile experience that maintains the quality and functionality of the desktop application while providing an optimized mobile user interface.** 