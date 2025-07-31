# CivicFix - Community Issue Reporting System

CivicFix is a comprehensive civic issue reporting and management system that enables citizens to report community problems and allows government departments to efficiently track and resolve them.

## 🚀 Features

### For Citizens (Users)
- **User Registration & Login**: Secure authentication system
- **Issue Reporting**: Report civic issues with title, description, optional images, and location
- **Location Services**: Automatic location detection or manual map pinning
- **Issue Tracking**: View and track your reported issues
- **Upvoting**: Support issues reported by other citizens
- **Email Notifications**: Get notified when your issues are resolved

### For Department Admins
- **Department Dashboard**: View and manage issues assigned to your department
- **Issue Management**: Update issue status (pending, in progress, resolved, rejected)
- **Priority Filtering**: Sort issues by upvote count to prioritize high-impact problems
- **Location Filtering**: Filter issues by geographic location
- **Email Notifications**: Receive notifications when new issues are reported
- **Map View**: Visual representation of issues on a map

### For Main Admins
- **System Overview**: View all issues across all departments
- **Analytics Dashboard**: Comprehensive statistics and insights
- **Department Management**: Filter and manage issues by department
- **Status Filtering**: Filter issues by status
- **Map Visualization**: Heatmap view of all reported issues

### Public Features
- **Public Dashboard**: View all reported issues without login
- **Location-based Filtering**: See issues near your location
- **Upvoting System**: Support issues that matter to you
- **Map Integration**: Interactive map showing issue locations

## 🛠️ Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Maps**: Leaflet.js for interactive mapping
- **Email**: EmailJS for automated notifications
- **Icons**: Lucide React for beautiful icons
- **Notifications**: React Hot Toast for user feedback

## 📋 Prerequisites

Before running this project, you need:

1. **Node.js** (v14 or higher)
2. **npm** or **yarn**
3. **Supabase Account** - Create a new project at [supabase.com](https://supabase.com)
4. **EmailJS Account** - For email notifications (optional)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CivicFix
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# EmailJS Configuration (optional)
REACT_APP_EMAILJS_USER_ID=your_emailjs_user_id
REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
REACT_APP_EMAILJS_DEPT_TEMPLATE_ID=your_department_notification_template_id
REACT_APP_EMAILJS_RESOLUTION_TEMPLATE_ID=your_resolution_notification_template_id
```

### 4. Supabase Database Setup

#### Create Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'dept_admin', 'main_admin')),
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issues table
CREATE TABLE issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
  user_id UUID REFERENCES users(id) NOT NULL,
  department_id UUID REFERENCES departments(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Upvotes table
CREATE TABLE upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_issues_user_id ON issues(user_id);
CREATE INDEX idx_issues_department_id ON issues(department_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_created_at ON issues(created_at);
CREATE INDEX idx_upvotes_issue_id ON upvotes(issue_id);
```

#### Insert Sample Departments

```sql
INSERT INTO departments (name, email, description) VALUES
('Roads & Transportation', 'roads@city.gov', 'Handles road maintenance, traffic signals, and transportation issues'),
('Water & Sanitation', 'water@city.gov', 'Manages water supply, sewage, and drainage systems'),
('Electricity & Power', 'power@city.gov', 'Handles electrical infrastructure and power outages'),
('Public Safety', 'safety@city.gov', 'Manages crime, vandalism, and public safety concerns'),
('Parks & Recreation', 'parks@city.gov', 'Maintains parks, playgrounds, and recreational facilities'),
('Public Health', 'health@city.gov', 'Handles health-related issues and sanitation'),
('Education', 'education@city.gov', 'Manages school-related infrastructure issues'),
('General Maintenance', 'maintenance@city.gov', 'Handles general maintenance and miscellaneous issues');
```

#### Set up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Public can read departments
CREATE POLICY "Public can view departments" ON departments
  FOR SELECT USING (true);

-- Users can read all issues
CREATE POLICY "Users can view issues" ON issues
  FOR SELECT USING (true);

-- Users can create issues
CREATE POLICY "Users can create issues" ON issues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own issues
CREATE POLICY "Users can update own issues" ON issues
  FOR UPDATE USING (auth.uid() = user_id);

-- Public can read upvotes
CREATE POLICY "Public can view upvotes" ON upvotes
  FOR SELECT USING (true);

-- Users can create upvotes
CREATE POLICY "Users can create upvotes" ON upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 5. Storage Setup

Create a storage bucket for issue images:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `issue-images`
3. Set the bucket to public
4. Add this policy to allow authenticated users to upload:

```sql
CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'issue-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'issue-images');
```

### 6. Start the Development Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

## 👥 User Roles

### Regular User
- Can register and login
- Can report issues
- Can view and upvote public issues
- Can track their own reported issues
- Receives email notifications when issues are resolved

### Department Admin
- Can login with admin credentials
- Can view and manage issues for their specific department
- Can update issue status
- Can filter issues by location and priority
- Receives email notifications for new issues

### Main Admin
- Can view all issues across all departments
- Can filter by department, location, and status
- Has access to analytics and statistics
- Can manage the overall system

## 📧 Email Setup (Optional)

To enable email notifications:

1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create email templates for:
   - Department notifications (when new issues are reported)
   - Resolution notifications (when issues are resolved)
3. Add your EmailJS credentials to the `.env` file

## 🗺️ Map Integration

The application uses Leaflet.js for interactive maps. Maps are automatically loaded and display:
- User's current location (if permission granted)
- Issue locations with popup information
- Interactive markers for all reported issues

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level security policies
- **Authentication**: Supabase Auth with role-based access
- **Input Validation**: Client and server-side validation
- **File Upload Security**: Secure image upload with validation

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

1. Connect your repository to Vercel or Netlify
2. Set environment variables in the deployment platform
3. Deploy automatically on push to main branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/CivicFix/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Leaflet](https://leafletjs.com/) for interactive maps
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for the frontend framework 