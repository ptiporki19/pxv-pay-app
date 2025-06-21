-- Fix RLS recursion issue
-- Migration: 2025-05-23T222946862Z_fix_rls_recursion.sql


      -- Temporarily disable RLS on users table
      ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
      
      -- Drop the problematic recursive policies
      DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
      DROP POLICY IF EXISTS "Super admins can update all users" ON public.users;
      DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
      
      -- Re-enable RLS
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
      
      -- Create simple, non-recursive policies
      -- Users can read their own profile (no recursion)
      CREATE POLICY "users_select_own" ON public.users
        FOR SELECT 
        TO authenticated 
        USING (auth.uid() = id);
      
      -- Service role can do anything (for admin operations)
      CREATE POLICY "users_service_role_all" ON public.users
        FOR ALL 
        TO service_role 
        USING (true)
        WITH CHECK (true);
    