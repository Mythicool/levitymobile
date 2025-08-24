# Supabase Database Setup Guide

This guide will help you set up a production-ready PostgreSQL database using Supabase for the Levity Loyalty mobile app.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. **Go to Supabase**: Visit [supabase.com](https://supabase.com)
2. **Sign up/Login**: Create account or sign in
3. **New Project**: Click "New project"
4. **Project Details**:
   - **Name**: `levity-loyalty-mobile`
   - **Database Password**: Generate a strong password (save it!) OSR%8ipr16!e#Ea1
   - **Region**: Choose closest to your users
   - **Pricing**: Start with Free tier (perfect for development)

### Step 2: Get Project Credentials

After project creation (takes ~2 minutes):

1. **Go to Settings** → **API**
2. **Copy these values**:
   - **Project URL**: `https://ctqhnyvxowuruezekmqo.supabase.co`
   - **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0cWhueXZ4b3d1cnVlemVrbXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA4NjksImV4cCI6MjA3MTYzNjg2OX0.ANA3jw2Byp-7u6o30AH3j8IyclDgx5XivTk_WAfOH6k`

### Step 3: Update Environment Variables

Replace the placeholder values in `.env.production`:

```env
# Replace these with your actual Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_USE_PRODUCTION_DB=true
```

### Step 4: Set Up Database Schema

1. **Go to SQL Editor** in Supabase dashboard
2. **Copy and paste** the complete schema from `src/services/supabase.ts`
3. **Run the SQL** to create all tables, functions, and security policies

### Step 5: Test the Connection

1. **Build and run** your app: `npm run web:build`
2. **Check console** for "Logged in with Supabase service" message
3. **Register a new user** to test database functionality

## 📋 Complete Database Schema

The following SQL creates all necessary tables and security policies:

```sql
-- 1️⃣ Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  join_date TIMESTAMPTZ DEFAULT NOW(),
  last_check_in TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2️⃣ User settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  notifications BOOLEAN DEFAULT TRUE,
  haptic_feedback BOOLEAN DEFAULT TRUE,
  auto_sync BOOLEAN DEFAULT TRUE,
  theme TEXT CHECK (theme IN ('light', 'dark', 'auto')) DEFAULT 'auto',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3️⃣ Points transactions table
CREATE TABLE public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  type TEXT CHECK (type IN ('earned', 'redeemed')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- 4️⃣ Check-ins table
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  location TEXT,
  points_earned INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5️⃣ Redemptions table
CREATE TABLE public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reward_id TEXT NOT NULL,
  reward_name TEXT NOT NULL,
  points_cost INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 6️⃣ Indexes for performance
CREATE INDEX idx_points_transactions_user_id ON public.points_transactions(user_id);
CREATE INDEX idx_points_transactions_created_at ON public.points_transactions(created_at DESC);
CREATE INDEX idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX idx_check_ins_created_at ON public.check_ins(created_at DESC);
CREATE INDEX idx_redemptions_user_id ON public.redemptions(user_id);

-- 7️⃣ Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- 8️⃣ RLS Policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.points_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own check-ins" ON public.check_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own redemptions" ON public.redemptions
  FOR SELECT USING (auth.uid() = user_id);

-- 9️⃣ Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10️⃣ Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11️⃣ Function to update user points
CREATE OR REPLACE FUNCTION public.update_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_reason TEXT,
  p_type TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Insert transaction record
  INSERT INTO public.points_transactions (user_id, points, reason, type)
  VALUES (p_user_id, p_points, p_reason, p_type);

  -- Update user points balance
  UPDATE public.users
  SET points = points + p_points,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔧 Configuration Options

### Authentication Settings

In Supabase Dashboard → Authentication → Settings:

1. **Enable email confirmations**: Recommended for production
2. **Set site URL**: Your deployed app URL
3. **Configure redirect URLs**: Add your app URLs

### Security Settings

1. **RLS Enabled**: ✅ Already configured in schema
2. **API Keys**: Use anon key for client, service key for admin
3. **JWT Settings**: Default settings work well

### Performance Optimization

1. **Database Indexes**: ✅ Already included in schema
2. **Connection Pooling**: Enabled by default
3. **Caching**: Configure based on usage patterns

## 🧪 Testing the Database

### Test User Registration

```javascript
// This should work after setup
const result = await authService.signUp({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
});
console.log('Registration result:', result);
```

### Test Check-in

```javascript
// After login
const checkInResult = await checkinService.checkIn(userId);
console.log('Check-in result:', checkInResult);
```

### Verify Data

Check your Supabase dashboard → Table Editor to see:
- New users in `users` table
- Points transactions in `points_transactions` table
- Check-ins in `check_ins` table

## 🚀 Deployment

### Netlify Environment Variables

Add these to your Netlify site settings:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_USE_PRODUCTION_DB=true
```

### Automatic Deployment

Once configured, your app will automatically:
1. Use Supabase for all data operations
2. Handle user authentication securely
3. Store data with proper security policies
4. Scale automatically with usage

## 📊 Monitoring

### Supabase Dashboard

Monitor your app through:
- **Database**: View tables and data
- **Auth**: See user registrations and logins
- **API**: Monitor request volume and performance
- **Logs**: Debug issues and track usage

### App Logs

Check browser console for:
- "Logged in with Supabase service" (success)
- Database connection status
- Error messages for troubleshooting

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid API key"**: Check environment variables
2. **"RLS policy violation"**: Verify user is authenticated
3. **"Function not found"**: Run the complete SQL schema
4. **"Connection failed"**: Check project URL and network

### Support

- **Supabase Docs**: [docs.supabase.com](https://docs.supabase.com)
- **Community**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Discord**: [discord.supabase.com](https://discord.supabase.com)

---

**Your Levity Loyalty app is now ready for production with a scalable PostgreSQL database!** 🎉
