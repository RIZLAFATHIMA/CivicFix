import React, { useState, useEffect } from 'react';
import { Filter, Map, List, BarChart3, Users, Building, TrendingUp } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { ISSUE_STATUS } from '../../config/supabase';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import IssueCard from '../issues/IssueCard';
import MapView from '../map/MapView';

const MainAdminDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, department, status
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [stats, setStats] = useState({
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    totalDepartments: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchIssues(),
        fetchDepartments(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          users!issues_user_id_fkey(name, email),
          departments(name, email),
          upvotes(count)
        `)
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
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching departments:', error);
        return;
      }

      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select('status');

      if (issuesError) {
        console.error('Error fetching stats:', issuesError);
        return;
      }

      const totalIssues = issuesData.length;
      const pendingIssues = issuesData.filter(i => i.status === ISSUE_STATUS.PENDING).length;
      const resolvedIssues = issuesData.filter(i => i.status === ISSUE_STATUS.RESOLVED).length;

      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('id');

      if (deptError) {
        console.error('Error fetching department count:', deptError);
        return;
      }

      setStats({
        totalIssues,
        pendingIssues,
        resolvedIssues,
        totalDepartments: deptData.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterIssues = () => {
    let filtered = [...issues];

    if (filter === 'department' && selectedDepartment) {
      filtered = filtered.filter(issue => 
        issue.departments?.name === selectedDepartment
      );
    }

    if (filter === 'status' && selectedStatus) {
      filtered = filtered.filter(issue => issue.status === selectedStatus);
    }

    return filtered;
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

  const filteredIssues = filterIssues();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Main Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of all civic issues across departments
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalIssues}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.pendingIssues}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.resolvedIssues}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalDepartments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setSelectedDepartment('');
                    setSelectedStatus('');
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Issues</option>
                  <option value="department">Filter by Department</option>
                  <option value="status">Filter by Status</option>
                </select>
              </div>

              {filter === 'department' && (
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              )}

              {filter === 'status' && (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Status</option>
                  <option value={ISSUE_STATUS.PENDING}>Pending</option>
                  <option value={ISSUE_STATUS.IN_PROGRESS}>In Progress</option>
                  <option value={ISSUE_STATUS.RESOLVED}>Resolved</option>
                  <option value={ISSUE_STATUS.REJECTED}>Rejected</option>
                </select>
              )}
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
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No issues found
                </h3>
                <p className="text-gray-600">
                  {filter !== 'all' 
                    ? 'No issues match your current filter. Try adjusting your filters.'
                    : 'No issues have been reported yet.'
                  }
                </p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <MapView issues={filteredIssues} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MainAdminDashboard; 