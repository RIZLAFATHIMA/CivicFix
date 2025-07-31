# CivicFix Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from Settings > API
3. Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your_project_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Set up Database
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Run the SQL commands

### 4. Set up Storage
1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `issue-images`
3. Set it to public
4. Add this policy in SQL Editor:

```sql
CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'issue-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'issue-images');
```

### 5. Start the App
```bash
npm start
```

Visit `http://localhost:3000` to see your CivicFix application!

## 🎯 Next Steps

1. **Create Admin Users**: Use the Supabase dashboard to manually update user roles
2. **Test Features**: Try reporting issues, upvoting, and managing them
3. **Customize**: Modify departments, styling, or add new features
4. **Deploy**: Use Vercel or Netlify for production deployment

## 🆘 Need Help?

- Check the full [README.md](README.md) for detailed documentation
- Review the database schema in `database-setup.sql`
- Contact the development team for support 