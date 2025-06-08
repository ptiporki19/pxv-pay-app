# 🚀 Deploy PXV Pay to Vercel

## Quick Deployment Steps

### Option 1: Direct Vercel Deployment (Recommended)

1. **Visit Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Repository**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your `combo-1` repository
   - Select the `pxv-pay` folder as the root directory

3. **Configure Build Settings**
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Environment Variables**
   Add these environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Get your live URL!

### Option 2: Vercel CLI (Alternative)

If you prefer command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from pxv-pay directory
vercel --prod

# Follow prompts and add environment variables
```

## Important Notes

### 🔐 Production Credentials
Your app will be deployed with these working credentials:
- **Super Admin**: bozard@gmail.com / TempPassword123!
- **Regular User**: afriglobalimports@gmail.com / [your password]

### 🔒 Security Checklist
- [ ] Environment variables properly set in Vercel
- [ ] Supabase RLS policies active
- [ ] No sensitive data in code
- [ ] HTTPS enabled (automatic with Vercel)

### 🧪 Testing Checklist
After deployment, test:
- [ ] Homepage loads
- [ ] User signup works
- [ ] User login works
- [ ] Super admin login works
- [ ] Dashboard functionality
- [ ] Product template creation
- [ ] Checkout link generation

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-app-name.vercel.app
```

## Post-Deployment

1. **Test Authentication**
   - Try logging in with super admin credentials
   - Create a new user account
   - Test all major app flows

2. **Share for Feedback**
   - Share the live URL for user testing
   - Monitor for any issues
   - Collect feedback for improvements

3. **Monitor Performance**
   - Check Vercel analytics
   - Monitor Supabase usage
   - Watch for any errors

## Support

If you encounter any issues during deployment:
1. Check Vercel build logs
2. Verify environment variables
3. Ensure Supabase is accessible
4. Test locally first

🎉 **Your PXV Pay app is ready for the world!** 