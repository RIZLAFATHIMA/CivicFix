import React, { useState, useEffect } from 'react';
import { MapPin, ThumbsUp, Filter, Map, List } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { ISSUE_STATUS } from '../../config/supabase';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import IssueCard from '../issues/IssueCard';
import MapView from '../map/MapView';

const PublicDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [filter, setFilter] = useState('all'); // all, location
  const [viewMode, setViewMode] = useState('list'); // list, map
  const [filteredIssues, setFilteredIssues] = useState([]);

  useEffect(() => {
    getCurrentLocation();
    fetchIssues();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [issues, filter, userLocation]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location');
        }
      );
    }
  };

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          users!issues_user_id_fkey(name),
          departments(name, email),
          upvotes(count)
        `)
        .neq('status', ISSUE_STATUS.RESOLVED)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching issues:', error);
        toast.error('Error loading issues');
        return;
      }

      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Error loading issues');
    } finally {
      setLoading(false);
    }
  };

  const filterIssues = () => {
    if (filter === 'location' && userLocation) {
      // Filter issues within 5km of user location
      const nearbyIssues = issues.filter(issue => {
        if (!issue.latitude || !issue.longitude) return false;
        
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          issue.latitude,
          issue.longitude
        );
        
        return distance <= 5; // 5km radius
      });
      
      setFilteredIssues(nearbyIssues);
    } else {
      setFilteredIssues(issues);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleUpvote = async (issueId) => {
    try {
      const { error } = await supabase
        .from('upvotes')
        .insert([{ issue_id: issueId }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('You have already upvoted this issue');
        } else {
          console.error('Error upvoting:', error);
          toast.error('Error upvoting issue');
        }
        return;
      }

      toast.success('Issue upvoted successfully!');
      fetchIssues(); // Refresh issues to update upvote count
    } catch (error) {
      console.error('Error upvoting:', error);
      toast.error('Error upvoting issue');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ISSUE_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ISSUE_STATUS.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case ISSUE_STATUS.RESOLVED:
        return 'bg-green-100 text-green-800';
      case ISSUE_STATUS.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Public Issues Dashboard
          </h1>
          <p className="text-gray-600">
            View and upvote civic issues in your community
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Filter */}
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Issues</option>
                <option value="location">Nearby Issues (5km)</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list' 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-md ${
                  viewMode === 'map' 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Map className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Location Status */}
          {filter === 'location' && (
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              {userLocation ? (
                <span>
                  Showing issues within 5km of your location
                </span>
              ) : (
                <span className="text-yellow-600">
                  Unable to get your location. Please enable location access.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="grid gap-6">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No issues found
                </h3>
                <p className="text-gray-600">
                  {filter === 'location' 
                    ? 'No issues found in your area. Try changing the filter to see all issues.'
                    : 'No issues have been reported yet.'
                  }
                </p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onUpvote={handleUpvote}
                  showUpvote={true}
                  getStatusColor={getStatusColor}
                />
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <MapView issues={filteredIssues} userLocation={userLocation} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDashboard; 