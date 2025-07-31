import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { USER_ROLES } from '../../config/supabase';
import { MapPin, LogOut, User, Shield, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, userRole, setUser, setUserRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
    }
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case USER_ROLES.USER:
        return '/user/dashboard';
      case USER_ROLES.DEPT_ADMIN:
        return '/dept-admin/dashboard';
      case USER_ROLES.MAIN_ADMIN:
        return '/main-admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">CivicFix</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to="/public" 
              className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Public Issues
            </Link>

            {user ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    {userRole === USER_ROLES.USER && <User className="h-4 w-4" />}
                    {userRole === USER_ROLES.DEPT_ADMIN && <Shield className="h-4 w-4" />}
                    {userRole === USER_ROLES.MAIN_ADMIN && <Settings className="h-4 w-4" />}
                    <span className="capitalize">{userRole?.replace('_', ' ')}</span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/user/login" 
                  className="btn-outline text-sm"
                >
                  User Login
                </Link>
                <Link 
                  to="/admin/login" 
                  className="btn-primary text-sm"
                >
                  Admin Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 