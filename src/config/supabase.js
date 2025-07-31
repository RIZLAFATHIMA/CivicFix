import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  USERS: 'users',
  DEPARTMENTS: 'departments',
  ISSUES: 'issues',
  UPVOTES: 'upvotes'
}

// Issue statuses
export const ISSUE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected'
}

// User roles
export const USER_ROLES = {
  USER: 'user',
  DEPT_ADMIN: 'dept_admin',
  MAIN_ADMIN: 'main_admin'
} 