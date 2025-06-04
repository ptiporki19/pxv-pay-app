# PXV Pay Design System & Style Guide

## Table of Contents
- [Design Philosophy](#design-philosophy)
- [Color System](#color-system)
- [Container & Layout Patterns](#container--layout-patterns)
- [Button Styles](#button-styles)
- [Navigation & Menu Styles](#navigation--menu-styles)
- [Form Elements](#form-elements)
- [Floating Chat Widget](#floating-chat-widget)
- [Animation Patterns](#animation-patterns)
- [Responsive Design Patterns](#responsive-design-patterns)
- [Typography Scale](#typography-scale)
- [Dark Mode Implementation](#dark-mode-implementation)
- [Implementation Guidelines](#implementation-guidelines)
- [Code Examples](#code-examples)

## Design Philosophy

The PXV Pay design system follows a **clean, modern, and professional** approach with emphasis on:
- **Simplicity over complexity** - No unnecessary animations or visual noise
- **Violet brand consistency** - Violet (#8B5CF6 family) as the primary accent color
- **Glassmorphism aesthetics** - Subtle transparency and backdrop blur effects
- **Accessibility-first** - Proper contrast ratios and focus states
- **Mobile-responsive** - Consistent experience across all devices

## Color System

### Primary Violet Palette

#### Light Mode Colors
```css
/* CSS Custom Properties - Light Mode */
--violet-50: hsl(263, 69%, 97%);   /* Very light backgrounds */
--violet-100: hsl(263, 69%, 94%);  /* Light hover states */
--violet-200: hsl(263, 69%, 86%);  /* Borders */
--violet-300: hsl(263, 69%, 78%);  /* Disabled states */
--violet-400: hsl(263, 69%, 62%);  /* Secondary accents */
--violet-500: hsl(263.4, 69.3%, 42.2%); /* Primary brand color */
--violet-600: hsl(263, 69%, 32%);  /* Primary buttons */
--violet-700: hsl(263, 69%, 26%);  /* Button hover states */
--violet-800: hsl(263, 69%, 20%);  /* Dark accents */
--violet-900: hsl(263, 69%, 14%);  /* Darkest */
--violet-950: hsl(263, 69%, 8%);   /* Extreme dark */
```

#### Dark Mode Adaptations
```css
/* Dark Mode - Colors are inverted for better contrast */
.dark {
  --violet-50: hsl(263, 69%, 8%);
  --violet-100: hsl(263, 69%, 14%);
  --violet-200: hsl(263, 69%, 20%);
  --violet-300: hsl(263, 69%, 26%);
  --violet-400: hsl(263, 69%, 32%);
  --violet-500: hsl(263.4, 69.3%, 42.2%);
  --violet-600: hsl(263, 69%, 62%);
  --violet-700: hsl(263, 69%, 78%);
  --violet-800: hsl(263, 69%, 86%);
  --violet-900: hsl(263, 69%, 94%);
  --violet-950: hsl(263, 69%, 97%);
}
```

### Neutral Color Usage

#### Text Colors
```css
/* Primary text hierarchy */
text-black dark:text-white          /* Headings and important text */
text-gray-700 dark:text-gray-300    /* Primary body text */
text-gray-600 dark:text-gray-400    /* Secondary text */
text-gray-500 dark:text-gray-400    /* Tertiary text, captions */
text-gray-400 dark:text-gray-500    /* Placeholder text */
```

#### Background Colors
```css
/* Background hierarchy */
bg-white dark:bg-gray-900           /* Main page backgrounds */
bg-gray-50 dark:bg-gray-800         /* Secondary backgrounds */
bg-gray-100 dark:bg-gray-800        /* Input field backgrounds */
bg-white/95 dark:bg-gray-900/95     /* Glassmorphism containers */
bg-white/60 dark:bg-black/60        /* Header glassmorphism */
```

#### Border Colors
```css
/* Border system */
border-gray-200 dark:border-gray-800           /* Standard borders */
border-violet-100/30 dark:border-violet-900/30 /* Subtle violet borders */
border-violet-200/50 dark:border-violet-800/50 /* Medium violet borders */
```

## Container & Layout Patterns

### Floating Containers (Glassmorphism)

#### Primary Floating Container
```css
/* Tailwind Classes */
bg-white/95 dark:bg-gray-900/95 
backdrop-blur-xl 
border border-violet-100/30 dark:border-violet-900/30 
rounded-2xl 
shadow-2xl shadow-violet-500/20

/* CSS Implementation */
.floating-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: 1rem;
  box-shadow: 
    0 20px 25px -5px rgba(139, 92, 246, 0.1),
    0 8px 10px -6px rgba(139, 92, 246, 0.1);
}

.dark .floating-container {
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(139, 92, 246, 0.2);
}
```

#### Header Container Pattern
```css
/* Tailwind Classes */
fixed top-0 w-full z-50 
transition-all duration-700 ease-out
py-4 /* changes to py-2 when scrolled */

/* Inner container */
container mx-auto px-6
bg-white/60 dark:bg-black/60 
backdrop-blur-xl 
rounded-2xl 
border border-violet-100/20 dark:border-violet-900/20 
shadow-lg shadow-violet-500/5
```

#### Card Containers
```css
/* Standard card pattern */
bg-white dark:bg-gray-900 
rounded-xl 
border border-gray-200 dark:border-gray-800 
shadow-lg 
p-6

/* Hover state for interactive cards */
hover:shadow-xl 
hover:scale-[1.02] 
transition-all duration-300
```

## Button Styles

### Primary Buttons (Violet Gradient)

#### Tailwind Implementation
```css
/* Primary button classes */
bg-gradient-to-r from-violet-600 via-violet-700 to-violet-800 
hover:from-violet-700 hover:via-violet-800 hover:to-violet-900 
text-white font-medium px-6 py-2 
rounded-xl border-0 
transition-all duration-500 
hover:scale-105 hover:shadow-xl hover:shadow-violet-500/40 
relative overflow-hidden group

/* Overlay effect */
<div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
```

#### CSS Implementation
```css
.btn-primary {
  background: linear-gradient(to right, 
    hsl(263, 69%, 32%), 
    hsl(263, 69%, 26%), 
    hsl(263, 69%, 20%)
  );
  color: white;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border-radius: 0.75rem;
  border: none;
  transition: all 0.5s ease;
  overflow: hidden;
  position: relative;
}

.btn-primary:hover {
  background: linear-gradient(to right, 
    hsl(263, 69%, 26%), 
    hsl(263, 69%, 20%), 
    hsl(263, 69%, 14%)
  );
  transform: scale(1.05);
  box-shadow: 0 25px 50px -12px rgba(139, 92, 246, 0.4);
}
```

### Secondary Buttons (Ghost Style)

#### Tailwind Implementation
```css
/* Ghost button classes */
variant="ghost" 
font-medium 
text-gray-700 dark:text-gray-300 
hover:text-violet-600 dark:hover:text-violet-400 
hover:bg-violet-50 dark:hover:bg-violet-950/30 
transition-all duration-300 
rounded-xl
```

#### CSS Implementation
```css
.btn-secondary {
  background: transparent;
  color: rgb(55, 65, 81); /* text-gray-700 */
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border: none;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: hsl(263, 69%, 97%); /* violet-50 */
  color: hsl(263, 69%, 32%); /* violet-600 */
}

.dark .btn-secondary {
  color: rgb(209, 213, 219); /* text-gray-300 */
}

.dark .btn-secondary:hover {
  background: hsla(263, 69%, 8%, 0.3); /* violet-950/30 */
  color: hsl(263, 69%, 62%); /* violet-400 */
}
```

## Navigation & Menu Styles

### Navigation Menu Items

#### Tailwind Implementation
```css
/* Active navigation item */
bg-violet-50 dark:bg-violet-950/30 
text-violet-600 dark:text-violet-400

/* Default navigation item */
px-4 py-2 rounded-xl text-sm font-medium 
text-gray-700 dark:text-gray-300 
hover:bg-violet-50 dark:hover:bg-violet-950/30 
hover:text-violet-600 dark:hover:text-violet-400 
transition-all duration-300
```

### Dropdown Menus

#### Tailwind Implementation
```css
/* Dropdown container */
w-[500px] p-4 
bg-white dark:bg-gray-900 
rounded-xl shadow-lg 
border border-gray-200 dark:border-gray-800

/* Dropdown items */
block p-4 rounded-lg 
hover:bg-violet-50 dark:hover:bg-violet-950/30 
transition-colors duration-200 group
```

#### CSS Implementation
```css
.dropdown-menu {
  width: 500px;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgb(229, 231, 235);
}

.dark .dropdown-menu {
  background: rgb(17, 24, 39);
  border: 1px solid rgb(55, 65, 81);
}

.dropdown-item {
  display: block;
  padding: 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: hsl(263, 69%, 97%);
}

.dark .dropdown-item:hover {
  background: hsla(263, 69%, 8%, 0.3);
}
```

## Form Elements

### Input Fields

#### Tailwind Implementation
```css
/* Standard input */
flex h-10 w-full rounded-md border px-3 py-2 text-sm 
bg-white/50 dark:bg-gray-950/50 
border-gray-200 dark:border-gray-800 
focus:border-violet-500 focus:ring-violet-500 
placeholder:text-muted-foreground 
transition-colors duration-200
```

#### CSS Implementation
```css
.form-input {
  width: 100%;
  height: 2.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid rgb(229, 231, 235);
  background: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: hsl(263, 69%, 32%);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.dark .form-input {
  background: rgba(3, 7, 18, 0.5);
  border: 1px solid rgb(55, 65, 81);
  color: rgb(243, 244, 246);
}
```

### Labels

#### Tailwind Implementation
```css
text-sm font-medium 
text-gray-700 dark:text-gray-300
```

### Textarea

#### Tailwind Implementation
```css
flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm 
bg-white/50 dark:bg-gray-950/50 
border-gray-200 dark:border-gray-800 
focus:border-violet-500 focus:ring-violet-500 
resize-none
```

## Floating Chat Widget

### Chat Button

#### Tailwind Implementation
```css
/* Positioning */
fixed bottom-4 right-4 z-50

/* Button styling */
h-14 w-14 rounded-full 
bg-gradient-to-br from-violet-600 via-violet-700 to-violet-800 
hover:from-violet-700 hover:via-violet-800 hover:to-violet-900 
shadow-xl shadow-violet-500/30 
hover:shadow-2xl hover:shadow-violet-500/40 
transition-all duration-500 
hover:scale-110 
group border-0 overflow-hidden

/* Pulse animation */
<div className="absolute inset-0 rounded-full bg-violet-500 animate-ping opacity-20"></div>
<div className="absolute -inset-2 rounded-full bg-gradient-to-r from-violet-400 to-violet-600 opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-500"></div>
```

### Chat Widget Panel

#### Tailwind Implementation
```css
/* Positioning and size */
absolute bottom-16 right-0 
w-96 h-[600px] 

/* Styling */
bg-white/95 dark:bg-gray-900/95 
backdrop-blur-xl 
shadow-2xl shadow-violet-500/20 
border border-violet-100/30 dark:border-violet-900/30 
rounded-2xl overflow-hidden

/* Animation states */
transition-all duration-500 ease-out origin-bottom-right
scale-0 opacity-0 /* closed */
scale-100 opacity-100 /* open */
```

### Chat Header

#### Tailwind Implementation
```css
/* Header container */
bg-gradient-to-r from-violet-600 via-violet-700 to-violet-800 
text-white p-4 relative overflow-hidden

/* Animated background pattern */
<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-[slide_2s_ease-in-out_infinite]"></div>
```

### Chat Tabs

#### Tailwind Implementation
```css
/* Tab container */
grid w-full grid-cols-2 m-4 mb-0 
bg-gray-100 dark:bg-gray-800 rounded-xl

/* Active tab */
data-[state=active]:bg-violet-600 data-[state=active]:text-white 
transition-all duration-300
```

## Animation Patterns

### Hover Transitions

#### Standard Patterns
```css
/* Color transitions */
transition-colors duration-200

/* All-property transitions */
transition-all duration-300

/* Transform transitions */
transition-all duration-500

/* Specific property transitions */
transition: color 0.3s ease, background-color 0.3s ease;
```

### Slide Animations

#### CSS Keyframes
```css
@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes slideInFromTop {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

#### Tailwind Animation Classes
```css
animate-ping    /* Pulse effect */
animate-pulse   /* Breathing effect */
animate-[slide_2s_ease-in-out_infinite]  /* Custom slide animation */
```

## Responsive Design Patterns

### Breakpoint Strategy

#### Mobile First Approach
```css
/* Default: Mobile (0px+) */
px-4 py-2

/* Tablet (768px+) */
md:px-6 md:py-4

/* Desktop (1024px+) */
lg:px-8 lg:py-6

/* Large Desktop (1280px+) */
xl:px-12 xl:py-8
```

### Navigation Responsive Patterns

#### Desktop Navigation
```css
hidden md:flex  /* Hide on mobile, show on desktop */
```

#### Mobile Menu
```css
md:hidden  /* Show on mobile, hide on desktop */

/* Mobile menu positioning */
absolute top-full left-6 right-6 mt-2
```

### Container Responsive Patterns

#### Responsive Width
```css
w-full md:w-96    /* Full width mobile, fixed width desktop */
w-full max-w-md   /* Full width with maximum constraint */
```

#### Responsive Grid
```css
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

## Typography Scale

### Headings

#### Hero Headings
```css
/* Extra large heading */
text-4xl md:text-5xl lg:text-6xl 
font-bold tracking-tight

/* Large heading */
text-2xl md:text-3xl lg:text-4xl 
font-bold tracking-tight

/* Medium heading */
text-xl md:text-2xl 
font-semibold
```

#### Section Headings
```css
/* Section title */
text-lg font-semibold 
text-black dark:text-white

/* Subsection title */
text-base font-medium 
text-gray-900 dark:text-white
```

### Body Text

#### Text Hierarchy
```css
/* Lead text */
text-xl text-gray-600 dark:text-gray-400 leading-relaxed

/* Body text */
text-base text-gray-700 dark:text-gray-300 leading-relaxed

/* Small text */
text-sm text-gray-600 dark:text-gray-400

/* Caption text */
text-xs text-gray-500 dark:text-gray-400
```

### Brand Text

#### Gradient Text Effect
```css
bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 
bg-clip-text text-transparent
```

## Dark Mode Implementation

### CSS Variable Strategy

#### Root Variables
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}
```

### Tailwind Dark Mode Classes

#### Consistent Pattern
```css
/* Always use dark: prefix for dark mode styles */
bg-white dark:bg-gray-900
text-black dark:text-white
border-gray-200 dark:border-gray-800
```

## Implementation Guidelines

### 1. **No Border Outlines Rule**
```css
/* ❌ Avoid visible borders for interaction feedback */
border-2 border-violet-500

/* ✅ Use background color changes instead */
hover:bg-violet-50 dark:hover:bg-violet-950/30
```

### 2. **Consistent Spacing System**
```css
/* Standard spacing scale */
p-4     /* 1rem - Standard padding */
px-6    /* 1.5rem - Container horizontal padding */
py-2    /* 0.5rem - Button vertical padding */
space-y-4   /* 1rem - Vertical component spacing */
gap-3   /* 0.75rem - Grid/flex gaps */
```

### 3. **Color Usage Hierarchy**
```css
/* Primary actions */
bg-gradient-to-r from-violet-600 via-violet-700 to-violet-800

/* Secondary actions */
hover:bg-violet-50 dark:hover:bg-violet-950/30

/* Text hierarchy */
text-black dark:text-white              /* Primary headings */
text-gray-700 dark:text-gray-300        /* Body text */
text-gray-600 dark:text-gray-400        /* Secondary text */
text-violet-600 dark:text-violet-400    /* Accent text */
```

### 4. **Animation Standards**
```css
/* Color/background changes */
transition-colors duration-200

/* Interactive element changes */
transition-all duration-300

/* Transform animations */
transition-all duration-500

/* Avoid complex animations - keep it subtle */
```

### 5. **Accessibility Requirements**

#### Focus States
```css
/* Always include focus states */
focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-ring 
focus-visible:ring-offset-2
```

#### Contrast Requirements
- Maintain minimum 4.5:1 contrast ratio
- Test with both light and dark modes
- Ensure interactive elements are clearly distinguishable

#### Semantic HTML
```html
<!-- Use proper semantic elements -->
<header>, <nav>, <main>, <section>, <article>, <aside>, <footer>

<!-- Proper form structure -->
<label htmlFor="input-id">Label</label>
<input id="input-id" />

<!-- Button vs link usage -->
<button type="button">Interactive action</button>
<a href="/path">Navigation link</a>
```

## Code Examples

### Complete Component Example

#### Floating Container Component
```tsx
interface FloatingContainerProps {
  children: React.ReactNode;
  className?: string;
}

const FloatingContainer: React.FC<FloatingContainerProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      "bg-white/95 dark:bg-gray-900/95",
      "backdrop-blur-xl",
      "border border-violet-100/30 dark:border-violet-900/30",
      "rounded-2xl",
      "shadow-2xl shadow-violet-500/20",
      "p-6",
      className
    )}>
      {children}
    </div>
  );
};
```

#### Primary Button Component
```tsx
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false,
  className 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative bg-gradient-to-r from-violet-600 via-violet-700 to-violet-800",
        "hover:from-violet-700 hover:via-violet-800 hover:to-violet-900",
        "text-white font-medium px-6 py-2",
        "rounded-xl border-0",
        "transition-all duration-500",
        "hover:scale-105 hover:shadow-xl hover:shadow-violet-500/40",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        "overflow-hidden group",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </button>
  );
};
```

#### Navigation Item Component
```tsx
interface NavItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, children, isActive }) => {
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-medium",
        "transition-all duration-300",
        isActive ? [
          "bg-violet-50 dark:bg-violet-950/30",
          "text-violet-600 dark:text-violet-400"
        ] : [
          "text-gray-700 dark:text-gray-300",
          "hover:bg-violet-50 dark:hover:bg-violet-950/30",
          "hover:text-violet-600 dark:hover:text-violet-400"
        ]
      )}
    >
      {children}
    </Link>
  );
};
```

### Global CSS Additions

#### Custom Animations
```css
/* Add to globals.css */
@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes pulse-violet {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.2; 
  }
  50% { 
    transform: scale(1.05); 
    opacity: 0.1; 
  }
}

.animate-slide {
  animation: slide 2s ease-in-out infinite;
}

.animate-pulse-violet {
  animation: pulse-violet 2s infinite;
}
```

#### Utility Classes
```css
/* Add to globals.css */
.violet-gradient {
  background: linear-gradient(to right, var(--violet-600), var(--violet-700));
}

.violet-gradient-hover:hover {
  background: linear-gradient(to right, var(--violet-700), var(--violet-800));
}

.glassmorphism {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.1);
}

.dark .glassmorphism {
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(139, 92, 246, 0.2);
}
```

---

## Quick Reference Checklist

When implementing new components, ensure:

- [ ] **Colors**: Use violet palette for accents, gray scale for text
- [ ] **Spacing**: Follow 4-8-16px spacing scale (p-1, p-2, p-4)
- [ ] **Borders**: No visible outlines, use background changes for interactions
- [ ] **Animations**: Keep transitions under 500ms, use ease-out timing
- [ ] **Dark Mode**: Include dark: variants for all colors
- [ ] **Accessibility**: Include focus states and semantic HTML
- [ ] **Responsive**: Mobile-first approach with breakpoint considerations
- [ ] **Typography**: Use established text scale and font weights
- [ ] **Glassmorphism**: Apply backdrop-blur and transparency for floating elements

This style guide ensures consistency across all PXV Pay interfaces while maintaining the modern, professional, and accessible design standards established in our landing pages and forms. 