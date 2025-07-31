import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './config/supabase';
import { USER_ROLES } from './config/supabase';

// Components
import HomePage from './components/HomePage';
import UserLogin from './components/auth/UserLogin';
import UserRegister from './components/auth/UserRegister';
import AdminLogin from './components/auth/AdminLogin';
import UserDashboard from './components/dashboard/UserDashboard';
import DeptAdminDashboard from './components/dashboard/DeptAdminDashboard';
import MainAdminDashboard from './components/dashboard/MainAdminDashboard';
import PublicDashboard from './components/dashboard/PublicDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

// Context
import { AuthContext } from './context/AuthContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserRole(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole(USER_ROLES.USER);
      } else {
        setUserRole(data.role || USER_ROLES.USER);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(USER_ROLES.USER);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={{ user, userRole, setUser, setUserRole }}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/public" element={<PublicDashboard />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected User Routes */}
            <Route 
              path="/user/dashboard" 
              element={
                user && userRole === USER_ROLES.USER ? 
                <UserDashboard /> : 
                <Navigate to="/user/login" replace />
              } 
            />

            {/* Protected Dept Admin Routes */}
            <Route 
              path="/dept-admin/dashboard" 
              element={
                user && userRole === USER_ROLES.DEPT_ADMIN ? 
                <DeptAdminDashboard /> : 
                <Navigate to="/admin/login" replace />
              } 
            />

            {/* Protected Main Admin Routes */}
            <Route 
              path="/main-admin/dashboard" 
              element={
                user && userRole === USER_ROLES.MAIN_ADMIN ? 
                <MainAdminDashboard /> : 
                <Navigate to="/admin/login" replace />
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </Router>
    </AuthContext.Provider>
  );
}

export default App; 