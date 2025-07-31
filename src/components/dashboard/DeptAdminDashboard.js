import React, { useState, useEffect } from 'react';
import { Filter, Map, List, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { ISSUE_STATUS } from '../../config/supabase';
import { sendResolutionNotificationToUser } from '../../utils/emailService';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import IssueCard from '../issues/IssueCard';
import MapView from '../map/MapView';

const DeptAdminDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState(null);
  const [filter, setFilter] = useState('all'); // all, location, priority
  const [viewMode, setViewMode] = useState('list');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDepartmentInfo();
    fetchDepartmentIssues();
  }, [user]);

  const fetchDepartmentInfo = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('department_id')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user department:', userError);
        return;
      }

      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .eq('id', userData.department_id)
        .single();

      if (deptError) {
        console.error('Error fetching department:', deptError);
        return;
      }

      setDepartment(deptData);
    } catch (error) {
      console.error('Error fetching department info:', error);
    }
  };

  const fetchDepartmentIssues = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('department_id')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user department:', userError);
        return;
      }

      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          users!issues_user_id_fkey(name, email),
          departments(name, email),
          upvotes(count)
        `)
        .eq('department_id', userData.department_id)
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
    let filtered = [...issues];

    if (filter === 'priority') {
      // Sort by upvote count (highest first)
      filtered.sort((a, b) => {
        const aUpvotes = a.upvotes?.[0]?.count || 0;
        const bUpvotes = b.upvotes?.[0]?.count || 0;
        return bUpvotes - aUpvotes;
      });
    }

    return filtered;
  };

  const handleStatusUpdate = async () => {
    if (!selectedIssue || !newStatus) return;

    setUpdating(true);

    try {
      const { error } = await supabase
        .from('issues')
        .update({ status: newStatus })
        .eq('id', selectedIssue.id);

      if (error) {
        console.error('Error updating issue status:', error);
        toast.error('Error updating issue status');
        return;
      }

      // Send email notification if resolved
      if (newStatus === ISSUE_STATUS.RESOLVED && selectedIssue.users?.email) {
        await sendResolutionNotificationToUser(selectedIssue.users.email, {
          ...selectedIssue,
          department: department?.name
        });
      }

      toast.success('Issue status updated successfully!');
      setShowStatusModal(false);
      setSelectedIssue(null);
      setNewStatus('');
      fetchDepartmentIssues(); // Refresh issues
    } catch (error) {
      console.error('Error updating issue status:', error);
      toast.error('Error updating issue status');
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = (issue) => {
    setSelectedIssue(issue);
    setNewStatus(issue.status);
    setShowStatusModal(true);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case ISSUE_STATUS.PENDING:
        return <Clock className="h-4 w-4" />;
      case ISSUE_STATUS.IN_PROGRESS:
        return <Clock className="h-4 w-4" />;
      case ISSUE_STATUS.RESOLVED:
        return <CheckCircle className="h-4 w-4" />;
      case ISSUE_STATUS.REJECTED:
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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

  const filteredIssues = filterIssues();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Department Dashboard
          </h1>
          <p className="text-gray-600">
            Managing issues for {department?.name || 'your department'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {issues.filter(i => i.status === ISSUE_STATUS.PENDING).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {issues.filter(i => i.status === ISSUE_STATUS.IN_PROGRESS).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {issues.filter(i => i.status === ISSUE_STATUS.RESOLVED).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {issues.filter(i => i.status === ISSUE_STATUS.REJECTED).length}
                </p>
              </div>
            </div>
          </div>
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
                <option value="priority">Sort by Priority (Upvotes)</option>
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
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="grid gap-6">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No issues to manage
                </h3>
                <p className="text-gray-600">
                  All issues in your department have been resolved.
                </p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <div key={issue.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <IssueCard
                    issue={issue}
                    showUpvote={false}
                    getStatusColor={getStatusColor}
                  />
                  
                  {/* Admin Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Current Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {getStatusIcon(issue.status)}
                          <span className="ml-1">{issue.status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </div>
                      
                      <button
                        onClick={() => openStatusModal(issue)}
                        className="btn-primary text-sm"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <MapView issues={filteredIssues} />
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedIssue && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Issue Status
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Issue:</strong> {selectedIssue.title}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Current Status:</strong> {selectedIssue.status.replace('_', ' ').toUpperCase()}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={ISSUE_STATUS.PENDING}>Pending</option>
                  <option value={ISSUE_STATUS.IN_PROGRESS}>In Progress</option>
                  <option value={ISSUE_STATUS.RESOLVED}>Resolved</option>
                  <option value={ISSUE_STATUS.REJECTED}>Rejected</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedIssue(null);
                    setNewStatus('');
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptAdminDashboard; 