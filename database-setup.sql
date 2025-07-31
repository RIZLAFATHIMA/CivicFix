-- CivicFix Database Setup
-- Run this in your Supabase SQL Editor

-- Create departments table
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'dept_admin', 'main_admin')),
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create issues table
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

-- Create upvotes table
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

-- Insert sample departments
INSERT INTO departments (name, email, description) VALUES
('Roads & Transportation', 'roads@city.gov', 'Handles road maintenance, traffic signals, and transportation issues'),
('Water & Sanitation', 'water@city.gov', 'Manages water supply, sewage, and drainage systems'),
('Electricity & Power', 'power@city.gov', 'Handles electrical infrastructure and power outages'),
('Public Safety', 'safety@city.gov', 'Manages crime, vandalism, and public safety concerns'),
('Parks & Recreation', 'parks@city.gov', 'Maintains parks, playgrounds, and recreational facilities'),
('Public Health', 'health@city.gov', 'Handles health-related issues and sanitation'),
('Education', 'education@city.gov', 'Manages school-related infrastructure issues'),
('General Maintenance', 'maintenance@city.gov', 'Handles general maintenance and miscellaneous issues');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Departments policies
CREATE POLICY "Public can view departments" ON departments
  FOR SELECT USING (true);

-- Issues policies
CREATE POLICY "Users can view issues" ON issues
  FOR SELECT USING (true);

CREATE POLICY "Users can create issues" ON issues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own issues" ON issues
  FOR UPDATE USING (auth.uid() = user_id);

-- Upvotes policies
CREATE POLICY "Public can view upvotes" ON upvotes
  FOR SELECT USING (true);

CREATE POLICY "Users can create upvotes" ON upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for issues updated_at
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE
    ON issues FOR EACH ROW EXECUTE PROCEDURE
    update_updated_at_column(); 