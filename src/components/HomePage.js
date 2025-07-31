import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, AlertTriangle, Users, Shield, TrendingUp } from 'lucide-react';
import Navbar from './common/Navbar';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <MapPin className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to CivicFix
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Report and track civic issues in your community. 
              Together, let's make our city better.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/user/register" 
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
              >
                Report an Issue
              </Link>
              <Link 
                to="/public" 
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
              >
                View Issues
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How CivicFix Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to improve your community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Report Issues
              </h3>
              <p className="text-gray-600">
                Easily report civic issues with photos and location. 
                Our AI automatically routes to the right department.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Department Management
              </h3>
              <p className="text-gray-600">
                Department admins receive notifications and can 
                track, prioritize, and resolve issues efficiently.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600">
                Get notified when your issues are resolved. 
                View real-time updates and community progress.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to make a difference?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of citizens who are actively improving their communities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/user/register" 
              className="btn-primary text-lg px-8 py-3"
            >
              Get Started
            </Link>
            <Link 
              to="/public" 
              className="btn-outline text-lg px-8 py-3"
            >
              Browse Issues
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">
            © 2024 CivicFix. Empowering communities through better civic engagement.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 