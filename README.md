# PXV Pay

A modern, secure, and user-friendly payment collection platform. Empowering individuals and businesses to collect payments globally using local payment methods.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS, Shadcn UI components, Zustand for state management
- **Backend**: Supabase for authentication, database, and storage

## Detailed Setup Instructions

### Prerequisites

- Node.js (LTS version)
- npm or yarn
- Docker (for local Supabase)

### Step 1: Clone and Install Dependencies

```bash
git clone [repository-url]
cd pxv-pay
npm install
```

### Step 2: Set Up Local Supabase

1. Initialize Supabase in your project:

```bash
npx supabase init
```

2. Start local Supabase:

```bash
npm run supabase:start
```

3. Copy the Supabase URL and anon key from the output. They should look like:

```
API URL: http://127.0.0.1:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### Step 3: Set Up Environment Variables

Create a `.env.local` file in the root of the project with the following content (replacing with your actual values):

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-output
```

### Step 4: Set Up Database Schema

1. Access the Supabase Studio at http://127.0.0.1:54323

2. Go to the SQL Editor tab

3. Copy the contents of the `supabase/manual-setup.sql` file

4. Paste into the SQL Editor and execute it

This will:
- Create the necessary tables and types
- Set up Row Level Security (RLS) policies
- Create triggers for user registration
- Create a sample super admin user

### Step 5: Run the Development Server

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Initial Login

To log in as the super admin:

1. Go to http://127.0.0.1:54323 (Supabase Studio)
2. Navigate to Authentication > Users
3. Find the user with email `admin@pxvpay.com`
4. Click "Reset password" and set a password
5. Use these credentials to log in to the application

## Database Schema Overview

The initial database setup includes:

- `users` table with RLS policies for data security
- User role management (super_admin, registered_user, subscriber, free_user)
- Trigger to automatically create user profiles on signup

## Project Structure

```
pxv-pay/
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (admin)/           # Admin panel routes
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (checkout)/        # Checkout flow routes
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global CSS
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── admin/             # Admin-specific components
│   │   ├── auth/              # Authentication components
│   │   ├── checkout/          # Checkout components
│   │   └── ui/                # Shadcn UI components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions and libraries
│   │   ├── supabase/          # Supabase client
│   │   ├── rbac.ts            # Role-based access control
│   │   ├── store.ts           # Zustand stores
│   │   └── utils.ts           # Utility functions
│   ├── styles/                # Additional styles
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Next.js middleware
├── public/                    # Static files
├── supabase/                  # Supabase migrations and seed data
├── .env.local                 # Local environment variables
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Helpful Commands

```bash
# Start Supabase locally
npm run supabase:start

# Check Supabase status (including URL and keys)
npm run supabase:status

# Stop Supabase
npm run supabase:stop

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Troubleshooting

- **Environment Variables Not Loading**: Make sure your `.env.local` file is created in the root of the project.
- **Authentication Issues**: Check if Supabase is running and your database schema is set up correctly.
- **Database Reset**: If needed, you can reset your local Supabase database with `npx supabase db reset`.

## License

[License information]
