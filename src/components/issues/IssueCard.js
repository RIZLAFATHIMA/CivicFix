import React from 'react';
import { MapPin, ThumbsUp, Calendar, User, Building } from 'lucide-react';

const IssueCard = ({ issue, onUpvote, showUpvote = false, getStatusColor }) => {
  const handleUpvote = () => {
    if (onUpvote) {
      onUpvote(issue.id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {issue.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            {issue.description}
          </p>
        </div>
        
        {showUpvote && (
          <button
            onClick={handleUpvote}
            className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors ml-4"
          >
            <ThumbsUp className="h-5 w-5" />
            <span className="text-sm font-medium">
              {issue.upvotes?.[0]?.count || 0}
            </span>
          </button>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
          {issue.status.replace('_', ' ').toUpperCase()}
        </span>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(issue.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Location */}
      {issue.location && (
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4" />
          <span>{issue.location}</span>
        </div>
      )}

      {/* Image */}
      {issue.image_url && (
        <div className="mb-4">
          <img
            src={issue.image_url}
            alt="Issue"
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{issue.users?.name || 'Anonymous'}</span>
          </div>
          
          {issue.departments?.name && (
            <div className="flex items-center space-x-1">
              <Building className="h-4 w-4" />
              <span>{issue.departments.name}</span>
            </div>
          )}
        </div>

        {showUpvote && (
          <button
            onClick={handleUpvote}
            className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ThumbsUp className="h-4 w-4" />
            <span>Upvote</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default IssueCard; 