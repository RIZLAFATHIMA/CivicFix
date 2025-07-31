import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Camera, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { ISSUE_STATUS } from '../../config/supabase';
import { classifyDepartment } from '../../utils/departmentClassifier';
import { sendIssueNotificationToDept } from '../../utils/emailService';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import IssueCard from '../issues/IssueCard';
import MapView from '../map/MapView';

const UserDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    latitude: null,
    longitude: null
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCurrentLocation();
    fetchUserIssues();
  }, [user]);

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
        }
      );
    }
  };

  const fetchUserIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          departments(name, email),
          upvotes(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching issues:', error);
        toast.error('Error loading your issues');
        return;
      }

      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Error loading your issues');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = () => {
    if (userLocation) {
      setFormData({
        ...formData,
        latitude: userLocation.lat,
        longitude: userLocation.lng
      });
      toast.success('Location set to your current position');
    } else {
      toast.error('Unable to get your location');
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `issue-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('issue-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('issue-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      // Classify department based on description
      const department = classifyDepartment(formData.description);

      // Get department details
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('id, email')
        .eq('name', department)
        .single();

      if (deptError) {
        console.error('Error fetching department:', deptError);
        toast.error('Error determining department');
        return;
      }

      // Upload image if selected
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      // Create issue
      const { data: issueData, error: issueError } = await supabase
        .from('issues')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            location: formData.location,
            latitude: formData.latitude,
            longitude: formData.longitude,
            image_url: imageUrl,
            user_id: user.id,
            department_id: deptData.id,
            status: ISSUE_STATUS.PENDING
          }
        ])
        .select()
        .single();

      if (issueError) {
        console.error('Error creating issue:', issueError);
        toast.error('Error creating issue');
        return;
      }

      // Send email notification to department
      if (deptData.email) {
        await sendIssueNotificationToDept(deptData.email, {
          ...issueData,
          department: department,
          reporter_name: user.user_metadata?.name || user.email
        });
      }

      toast.success('Issue reported successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        latitude: null,
        longitude: null
      });
      setSelectedImage(null);
      setImagePreview(null);
      setShowReportForm(false);
      
      // Refresh issues
      fetchUserIssues();
    } catch (error) {
      console.error('Error submitting issue:', error);
      toast.error('Error submitting issue');
    } finally {
      setSubmitting(false);
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
            Your Dashboard
          </h1>
          <p className="text-gray-600">
            Report issues and track your submissions
          </p>
        </div>

        {/* Report Issue Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Report New Issue</span>
          </button>
        </div>

        {/* Report Issue Form */}
        {showReportForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Report a New Issue
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Detailed description of the issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Address or landmark"
                  />
                  <button
                    type="button"
                    onClick={handleLocationSelect}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Issue'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User's Issues */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Reported Issues
            </h2>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list' 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-md ${
                  viewMode === 'map' 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Map View
              </button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="grid gap-6">
              {issues.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No issues reported yet
                  </h3>
                  <p className="text-gray-600">
                    Start by reporting your first issue above.
                  </p>
                </div>
              ) : (
                issues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    showUpvote={false}
                    getStatusColor={getStatusColor}
                  />
                ))
              )}
            </div>
          ) : (
            <MapView issues={issues} userLocation={userLocation} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 