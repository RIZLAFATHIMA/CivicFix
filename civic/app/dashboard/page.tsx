"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapClickHandler } from "./components/MapClickHandler";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

type IssueStatus = "open" | "in-progress" | "resolved" | "closed";
type IssuePriority = "low" | "medium" | "high" | "critical";
type UserRole = "user" | "admin" | "super-admin";
type IssueCategory =
  | "infrastructure"
  | "safety"
  | "environment"
  | "transportation"
  | "utilities"
  | "other";

interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location: string;
  reportedBy: string;
  reportedDate?: string; // For backward compatibility
  createdAt?: string; // From database
  updatedAt?: string; // From database
  assignedTo?: string;
  votes: number;
  images: string[];
  reporterAvatar?: string;
  coordinates?: { lat: number; lng: number }; // For map coordinates
  latitude?: number; // From database
  longitude?: number; // From database
  reportedByUserId?: number; // From database
}

const mockIssues: Issue[] = [
  {
    id: "ISS001",
    title: "Pothole on Main Street",
    description:
      "Large pothole causing damage to vehicles near the intersection of Main St and 5th Ave",
    category: "infrastructure",
    priority: "high",
    status: "open",
    location: "Main St & 5th Ave",
    reportedBy: "John Doe",
    reportedDate: "2025-07-25",
    votes: 23,
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format&crop=focalpoint&fp-x=0.7&fp-y=0.3",
    ],
    reporterAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: "ISS002",
    title: "Broken Street Light",
    description:
      "Street light has been out for 2 weeks, creating safety concerns for pedestrians",
    category: "safety",
    priority: "medium",
    status: "in-progress",
    location: "Oak Street, Block 200",
    reportedBy: "Sarah Smith",
    reportedDate: "2025-07-20",
    assignedTo: "City Maintenance",
    votes: 15,
    images: [
      "https://images.unsplash.com/photo-1541411735051-2c7c2ba7fa8b?w=400&h=300&fit=crop",
    ],
    reporterAvatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b15c?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: "ISS003",
    title: "Illegal Dumping Site",
    description: "Construction debris and household waste dumped in vacant lot",
    category: "environment",
    priority: "high",
    status: "open",
    location: "Vacant lot, Pine St",
    reportedBy: "Mike Johnson",
    reportedDate: "2025-07-28",
    votes: 31,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
    ],
    reporterAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: "ISS004",
    title: "Bus Stop Shelter Damaged",
    description: "Glass panels broken, bench damaged, needs repair",
    category: "transportation",
    priority: "low",
    status: "resolved",
    location: "Bus Stop #47, Central Ave",
    reportedBy: "Lisa Wang",
    reportedDate: "2025-07-15",
    assignedTo: "Transit Authority",
    votes: 8,
    images: [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop",
    ],
    reporterAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: "ISS005",
    title: "Water Main Leak",
    description: "Water bubbling up from street, possible water main break",
    category: "utilities",
    priority: "critical",
    status: "in-progress",
    location: "Elm Street, near #450",
    reportedBy: "Robert Chen",
    reportedDate: "2025-07-30",
    assignedTo: "Water Department",
    votes: 42,
    images: [
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop",
    ],
    reporterAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
  },
];

// Add some issues reported by current user (will be updated dynamically)
const getUserSpecificIssues = (currentUser: string): Issue[] => [
  {
    id: "ISS006",
    title: "Broken Traffic Signal",
    description: "Traffic light stuck on red for 30+ minutes during peak hours",
    category: "infrastructure",
    priority: "high",
    status: "open",
    location: "Main St & Oak Ave",
    reportedBy: currentUser,
    reportedDate: "2025-07-31",
    votes: 12,
    images: [
      "https://images.unsplash.com/photo-1549317336-206569e8475c?w=400&h=300&fit=crop",
    ],
    reporterAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: "ISS007",
    title: "Graffiti on Public Building",
    description:
      "Offensive graffiti on city hall exterior wall facing the main street",
    category: "environment",
    priority: "medium",
    status: "in-progress",
    location: "City Hall, Front Entrance",
    reportedBy: currentUser,
    reportedDate: "2025-07-29",
    assignedTo: "City Maintenance",
    votes: 8,
    images: [
      "https://images.unsplash.com/photo-1541411735051-2c7c2ba7fa8b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    ],
    reporterAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  },
];

const getAllIssues = (currentUser: string) => [
  ...mockIssues,
  ...getUserSpecificIssues(currentUser),
];

const Dashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState("John Doe");
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("user");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "my-issues" | "resolved">("all");
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage and fetch issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const fullName = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.email;
          setCurrentUser(fullName);
          setCurrentUserRole(user.role || "user");
          setCurrentUserId(user.id);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
      
      // Fetch issues from API
      fetchIssues();
    }
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/issues');
      const data = await response.json();
      
      if (response.ok) {
        setIssues(data.issues || []);
      } else {
        console.error('Failed to fetch issues:', data.error);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };
  const [newIssueForm, setNewIssueForm] = useState({
    title: "",
    description: "",
    category: "other" as IssueCategory,
    priority: "medium" as IssuePriority,
    location: "",
    coordinates: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
    images: [] as string[],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [filter, setFilter] = useState<{
    status: IssueStatus | "all";
    category: IssueCategory | "all";
    priority: IssuePriority | "all";
  }>({
    status: "all",
    category: "all",
    priority: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to check if current user is admin
  const isAdmin = () => {
    return currentUserRole === "admin" || currentUserRole === "super-admin";
  };

  // Function to toggle user role (for testing purposes)
  const toggleUserRole = () => {
    if (currentUserRole === "user") {
      setCurrentUserRole("admin");
      setCurrentUser("Admin User");
    } else {
      setCurrentUserRole("user");
      setCurrentUser("John Doe");
    }
    setIssues(getAllIssues(currentUserRole === "user" ? "Admin User" : "John Doe"));
  };

  // Logout function
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  };

  // Load Leaflet CSS on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
      setMapLoaded(true);
    }
  }, []);

  // Helper functions for new issue form
  const handleNewIssueChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setNewIssueForm({ ...newIssueForm, [e.target.name]: e.target.value });
  };

  const handleNewIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', newIssueForm.title);
      formData.append('description', newIssueForm.description);
      formData.append('category', newIssueForm.category);
      formData.append('priority', newIssueForm.priority);
      formData.append('location', newIssueForm.location);
      formData.append('latitude', newIssueForm.coordinates.lat.toString());
      formData.append('longitude', newIssueForm.coordinates.lng.toString());
      formData.append('reportedBy', currentUser);
      if (currentUserId) {
        formData.append('reportedByUserId', currentUserId.toString());
      }

      // Add image files if any
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file, index) => {
          formData.append('images', file);
        });
      } else if (newIssueForm.images.length > 0) {
        // For sample images, use URLs as fallback
        newIssueForm.images.forEach((imageUrl, index) => {
          formData.append('imageUrls', imageUrl);
        });
      }

      const response = await fetch('/api/issues', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form
        setNewIssueForm({
          title: "",
          description: "",
          category: "other",
          priority: "medium",
          location: "",
          coordinates: { lat: 37.7749, lng: -122.4194 },
          images: [],
        });
        setSelectedFiles([]);
        setShowNewIssueModal(false);
        
        // Refresh issues list
        await fetchIssues();
        
        // Switch to appropriate tab after creating issue
        if (isAdmin()) {
          setActiveTab("all"); // Admins go to all issues
        } else {
          setActiveTab("my-issues"); // Regular users go to their issues
        }
      } else {
        alert('Error creating issue: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Error creating issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSampleImage = () => {
    const sampleImages = [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1541411735051-2c7c2ba7fa8b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1549317336-206569e8475c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop",
    ];
    const randomImage =
      sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setNewIssueForm({
      ...newIssueForm,
      images: [...newIssueForm.images, randomImage],
    });
  };

  const removeImage = (index: number) => {
    setNewIssueForm({
      ...newIssueForm,
      images: newIssueForm.images.filter((_, i) => i !== index),
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/issues?id=${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          userRole: currentUserRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh issues list to show updated status
        await fetchIssues();
      } else {
        alert('Error updating status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
      alert('Error updating status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewIssueDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedIssue(null);
  };

  // Map-related functions
  const handleMapClick = (lat: number, lng: number) => {
    setNewIssueForm({
      ...newIssueForm,
      coordinates: { lat, lng },
      location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setNewIssueForm({
            ...newIssueForm,
            coordinates: { lat: latitude, lng: longitude },
            location: `Current Location (${latitude.toFixed(
              6
            )}, ${longitude.toFixed(6)})`,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Unable to get your location. ";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Location access was denied.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "An unknown error occurred.";
              break;
          }
          alert(errorMessage + " Please select manually on the map.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      alert(
        "Geolocation is not supported by this browser. Please select manually on the map."
      );
    }
  };

  const predefinedLocations = [
    { name: "City Hall", lat: 37.7749, lng: -122.4194 },
    { name: "Main Street", lat: 37.7849, lng: -122.4094 },
    { name: "Central Park", lat: 37.7649, lng: -122.4294 },
    { name: "Public Library", lat: 37.7949, lng: -122.3994 },
    { name: "Community Center", lat: 37.7549, lng: -122.4394 },
  ];

  const selectPredefinedLocation = (location: {
    name: string;
    lat: number;
    lng: number;
  }) => {
    setNewIssueForm({
      ...newIssueForm,
      coordinates: { lat: location.lat, lng: location.lng },
      location: location.name,
    });
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        return data.display_name;
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const filteredIssues = issues.filter((issue) => {
    // Filter by tab first
    if (activeTab === "my-issues" && issue.reportedBy !== currentUser) {
      return false;
    }
    if (activeTab === "resolved" && issue.status !== "resolved") {
      return false;
    }

    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filter.status === "all" || issue.status === filter.status;
    const matchesCategory =
      filter.category === "all" || issue.category === filter.category;
    const matchesPriority =
      filter.priority === "all" || issue.priority === filter.priority;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const getStatusBadge = (status: IssueStatus) => {
    const statusColors = {
      open: "bg-red-100 text-red-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`;
  };

  const getPriorityBadge = (priority: IssuePriority) => {
    const priorityColors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-orange-100 text-orange-800",
      high: "bg-red-100 text-red-800",
      critical: "bg-purple-100 text-purple-800",
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority]}`;
  };

  const getCategoryIcon = (category: IssueCategory) => {
    const icons = {
      infrastructure: "🏗️",
      safety: "⚠️",
      environment: "🌱",
      transportation: "🚌",
      utilities: "⚡",
      other: "📋",
    };
    return icons[category];
  };

  const stats = {
    total:
      activeTab === "my-issues"
        ? issues.filter((i) => i.reportedBy === currentUser).length
        : issues.length,
    open:
      activeTab === "my-issues"
        ? issues.filter(
            (i) => i.status === "open" && i.reportedBy === currentUser
          ).length
        : issues.filter((i) => i.status === "open").length,
    inProgress:
      activeTab === "my-issues"
        ? issues.filter(
            (i) => i.status === "in-progress" && i.reportedBy === currentUser
          ).length
        : issues.filter((i) => i.status === "in-progress").length,
    resolved:
      activeTab === "my-issues"
        ? issues.filter(
            (i) => i.status === "resolved" && i.reportedBy === currentUser
          ).length
        : issues.filter((i) => i.status === "resolved").length,
    critical:
      activeTab === "my-issues"
        ? issues.filter(
            (i) => i.priority === "critical" && i.reportedBy === currentUser
          ).length
        : issues.filter((i) => i.priority === "critical").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-300/20 to-purple-300/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-200/10 to-blue-200/10 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      {/* Modern Header */}
      <header className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-cyan-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-100/30 via-transparent to-cyan-100/30"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-200/20 to-blue-200/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                  <span className="text-white text-2xl">🏛️</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-violet-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent leading-tight">
                  Civic Dashboard
                </h1>
                <p className="mt-2 text-lg font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
                  Smart city issue management platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Live Status */}
              <div className="hidden md:flex items-center space-x-3 bg-white/80 backdrop-blur-lg rounded-2xl px-5 py-3 shadow-xl border border-white/40 hover:bg-white/90 transition-all duration-300">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span className="text-sm font-bold text-gray-700">Live Updates</span>
              </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-lg rounded-2xl px-6 py-3 shadow-xl border border-white/40 hover:bg-white/90 transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={toggleUserRole}
                    className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                      isAdmin()
                        ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl"
                        : "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl"
                    }`}
                    title="Click to toggle between User and Admin roles"
                  >
                    <div className={`absolute inset-0 rounded-xl blur opacity-30 ${
                      isAdmin() 
                        ? "bg-gradient-to-r from-purple-400 to-violet-500" 
                        : "bg-gradient-to-r from-blue-400 to-cyan-500"
                    }`}></div>
                    <span className="relative">{isAdmin() ? "👨‍💼 Admin" : "👤 User"}</span>
                  </button>
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-gray-900">{currentUser}</p>
                    <p className="text-xs text-gray-500">Online now</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 hover:bg-red-50 rounded-xl group"
                  title="Logout"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
              
              {/* CTA Button */}
              <button
                onClick={() => setShowNewIssueModal(true)}
                className="relative group bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 hover:from-violet-700 hover:via-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-2">
                  <span className="animate-pulse">✨</span>
                  <span>New Issue</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Tab Navigation */}
        <div className="mb-10">
          <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-3">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-50/50 via-blue-50/50 to-cyan-50/50 rounded-3xl"></div>
            <div className="relative flex space-x-3">
              <button
                onClick={() => setActiveTab("all")}
                className={`group flex-1 px-8 py-5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-4 relative overflow-hidden ${
                  activeTab === "all"
                    ? "bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 text-white shadow-xl transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:shadow-lg"
                }`}
              >
                {activeTab === "all" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 rounded-2xl blur opacity-30"></div>
                )}
                <span className="relative text-2xl group-hover:scale-110 transition-transform">🌍</span>
                <span className="relative text-lg">All Issues</span>
                <span className={`relative px-3 py-1 rounded-full text-sm font-bold ${
                  activeTab === "all" 
                    ? "bg-white/30 text-white" 
                    : "bg-gray-100 text-gray-700 group-hover:bg-white"
                }`}>
                  {issues.length}
                </span>
              </button>
              
              {/* Role-based second tab */}
              {isAdmin() ? (
                <button
                  onClick={() => setActiveTab("resolved")}
                  className={`group flex-1 px-8 py-5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-4 relative overflow-hidden ${
                    activeTab === "resolved"
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl transform scale-105"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:shadow-lg"
                  }`}
                >
                  {activeTab === "resolved" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl blur opacity-30"></div>
                  )}
                  <span className="relative text-2xl group-hover:scale-110 transition-transform">✅</span>
                  <span className="relative text-lg">Resolved Issues</span>
                  <span className={`relative px-3 py-1 rounded-full text-sm font-bold ${
                    activeTab === "resolved" 
                      ? "bg-white/30 text-white" 
                      : "bg-gray-100 text-gray-700 group-hover:bg-white"
                  }`}>
                    {issues.filter((i) => i.status === "resolved").length}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab("my-issues")}
                  className={`group flex-1 px-8 py-5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-4 relative overflow-hidden ${
                    activeTab === "my-issues"
                      ? "bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 text-white shadow-xl transform scale-105"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:shadow-lg"
                  }`}
                >
                  {activeTab === "my-issues" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 rounded-2xl blur opacity-30"></div>
                  )}
                  <span className="relative text-2xl group-hover:scale-110 transition-transform">👤</span>
                  <span className="relative text-lg">My Issues</span>
                  <span className={`relative px-3 py-1 rounded-full text-sm font-bold ${
                    activeTab === "my-issues" 
                      ? "bg-white/30 text-white" 
                      : "bg-gray-100 text-gray-700 group-hover:bg-white"
                  }`}>
                    {issues.filter((i) => i.reportedBy === currentUser).length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {stats.total}
                </div>
                <div className="text-sm font-semibold text-gray-600 mt-2">Total Issues</div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-rose-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-4xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  {stats.open}
                </div>
                <div className="text-sm font-semibold text-gray-600 mt-2">Open Issues</div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-3xl">🚨</span>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.inProgress}
                </div>
                <div className="text-sm font-semibold text-gray-600 mt-2">In Progress</div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-3xl">⚡</span>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {stats.resolved}
                </div>
                <div className="text-sm font-semibold text-gray-600 mt-2">Resolved</div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 hover:bg-white/90 transition-all duration-500 hover:scale-105 hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-violet-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {stats.critical}
                </div>
                <div className="text-sm font-semibold text-gray-600 mt-2">Critical</div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Panel - Only visible to admins */}
        {isAdmin() && (
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl shadow-xl p-6 mb-8 border border-purple-200">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">👨‍💼</span>
              <h3 className="text-lg font-semibold text-purple-900">
                Admin Dashboard
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">Pending Review</div>
                <div className="text-2xl font-bold text-purple-800">
                  {issues.filter(i => i.status === "open").length}
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">Assignments Needed</div>
                <div className="text-2xl font-bold text-purple-800">
                  {issues.filter(i => !i.assignedTo && i.status !== "resolved").length}
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">High Priority</div>
                <div className="text-2xl font-bold text-purple-800">
                  {issues.filter(i => i.priority === "high" || i.priority === "critical").length}
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">Resolution Rate</div>
                <div className="text-2xl font-bold text-purple-800">
                  {Math.round((issues.filter(i => i.status === "resolved").length / issues.length) * 100)}%
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-purple-600 bg-purple-50 p-2 rounded-lg">
              💡 <strong>Admin Privileges:</strong> You can update issue statuses, assign tickets, and access administrative reports.
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
          <div className="flex items-center mb-6">
            <span className="text-2xl mr-3">🔍</span>
            <h3 className="text-lg font-semibold text-gray-900">
              Search & Filters
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status
              </label>
              <select
                value={filter.status}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    status: e.target.value as IssueStatus | "all",
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="open">🔴 Open</option>
                <option value="in-progress">🟡 In Progress</option>
                <option value="resolved">🟢 Resolved</option>
                <option value="closed">⚫ Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <select
                value={filter.category}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    category: e.target.value as IssueCategory | "all",
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white"
              >
                <option value="all">All Categories</option>
                <option value="infrastructure">🏗️ Infrastructure</option>
                <option value="safety">⚠️ Safety</option>
                <option value="environment">🌱 Environment</option>
                <option value="transportation">🚌 Transportation</option>
                <option value="utilities">⚡ Utilities</option>
                <option value="other">📋 Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priority
              </label>
              <select
                value={filter.priority}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    priority: e.target.value as IssuePriority | "all",
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white"
              >
                <option value="all">All Priorities</option>
                <option value="low">🔵 Low</option>
                <option value="medium">🟠 Medium</option>
                <option value="high">🔴 High</option>
                <option value="critical">🟣 Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="text-2xl mr-3">
                  {activeTab === "my-issues" ? "�" : "�📋"}
                </span>
                {activeTab === "my-issues" ? "My Issues" : "All Issues"} (
                {filteredIssues.length})
              </h2>
              <div className="flex items-center space-x-4">
                {activeTab === "my-issues" && (
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <span className="text-blue-500">👤</span>
                    <span>Logged in as {currentUser}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Real-time updates</span>
                </div>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-8 hover:bg-gray-50/50 transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image Gallery */}
                  <div className="lg:w-1/3">
                    <div className="grid grid-cols-2 gap-2">
                      {issue.images.map((image, index) => (
                        <div
                          key={index}
                          className={`relative overflow-hidden rounded-xl ${
                            index === 0 && issue.images.length > 1
                              ? "col-span-2"
                              : ""
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Issue ${issue.id} - Image ${index + 1}`}
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      ))}
                      {issue.images.length > 2 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">
                          +{issue.images.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:w-2/3 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">
                            {getCategoryIcon(issue.category)}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {issue.title}
                          </h3>
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                            #{issue.id}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {issue.description}
                        </p>

                        {/* Reporter Info */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                issue.reporterAvatar ||
                                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                              }
                              alt={issue.reportedBy}
                              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {issue.reportedBy}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">•</div>
                          <span className="text-sm text-gray-600">
                            📅{" "}
                            {new Date(issue.reportedDate || issue.createdAt || new Date()).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        {/* Location and Assignment */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-blue-500">�</span>
                            <span className="font-medium">
                              {issue.location}
                            </span>
                          </div>
                          {issue.assignedTo && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="text-green-500">👨‍💼</span>
                              <span>
                                Assigned to:{" "}
                                <span className="font-medium">
                                  {issue.assignedTo}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Badges and Votes */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={getStatusBadge(issue.status)}>
                              {issue.status.replace("-", " ").toUpperCase()}
                            </span>
                            <span className={getPriorityBadge(issue.priority)}>
                              {issue.priority.toUpperCase()}
                            </span>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                              {issue.category.replace("-", " ").toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <button className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                              <span>👍</span>
                              <span className="font-medium">{issue.votes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="lg:w-auto flex lg:flex-col gap-3">
                    <button 
                      onClick={() => viewIssueDetails(issue)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-medium"
                    >
                      📖 View Details
                    </button>

                    {activeTab === "my-issues" &&
                    issue.reportedBy === currentUser ? (
                      <>
                        <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-medium">
                          ✏️ Edit Issue
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-medium">
                          🗑️ Delete
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Only admins can update status */}
                        {isAdmin() ? (
                          <div className="relative">
                            <select
                              value={issue.status}
                              onChange={(e) => updateIssueStatus(issue.id, e.target.value)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-medium border-none cursor-pointer appearance-none pr-8"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 0.5rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.5em 1.5em'
                              }}
                            >
                              <option value="open" className="bg-white text-gray-900">Open</option>
                              <option value="in-progress" className="bg-white text-gray-900">In Progress</option>
                              <option value="resolved" className="bg-white text-gray-900">Resolved</option>
                              <option value="closed" className="bg-white text-gray-900">Closed</option>
                            </select>
                          </div>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed text-sm font-medium"
                            title="Only administrators can update issue status"
                          >
                            🔒 Status (Admin Only)
                          </button>
                        )}
                        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-medium">
                          📧 Contact Reporter
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredIssues.length === 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">
                {activeTab === "my-issues" ? "�" : "�🔍"}
              </span>
            </div>
            <div className="text-gray-500 text-xl font-semibold mb-3">
              {activeTab === "my-issues"
                ? "No issues reported by you yet"
                : "No issues found"}
            </div>
            <p className="text-gray-400 mb-6">
              {activeTab === "my-issues"
                ? "Start by reporting your first issue to help improve your community"
                : "Try adjusting your filters or search terms to find what you're looking for"}
            </p>
            <div className="flex gap-4 justify-center">
              {activeTab === "my-issues" ? (
                <button
                  onClick={() => setShowNewIssueModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                >
                  ✨ Report New Issue
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilter({
                      status: "all",
                      category: "all",
                      priority: "all",
                    });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                >
                  🔄 Reset Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Issue Modal */}
      {showNewIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="text-3xl">✨</span>
                  Report New Issue
                </h2>
                <button
                  onClick={() => setShowNewIssueModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleNewIssueSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Issue Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newIssueForm.title}
                    onChange={handleNewIssueChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Detailed Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newIssueForm.description}
                    onChange={handleNewIssueChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Provide detailed information about the issue"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={newIssueForm.category}
                      onChange={handleNewIssueChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="infrastructure">🏗️ Infrastructure</option>
                      <option value="safety">⚠️ Safety</option>
                      <option value="environment">🌱 Environment</option>
                      <option value="transportation">🚌 Transportation</option>
                      <option value="utilities">⚡ Utilities</option>
                      <option value="other">📋 Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="priority"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Priority *
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={newIssueForm.priority}
                      onChange={handleNewIssueChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">🔵 Low</option>
                      <option value="medium">🟠 Medium</option>
                      <option value="high">🔴 High</option>
                      <option value="critical">🟣 Critical</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 mb-3"
                    >
                      Location * 📍
                    </label>

                    <div className="space-y-4">
                      {/* Location Input */}
                      <div className="relative">
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={newIssueForm.location}
                          onChange={handleNewIssueChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-32"
                          placeholder="Select location on map or enter manually"
                        />
                        <button
                          type="button"
                          onClick={() => setShowMap(!showMap)}
                          className="absolute right-2 top-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs"
                        >
                          {showMap ? "Hide Map" : "Show Map"}
                        </button>
                      </div>

                      {/* Quick Location Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            getCurrentLocation();
                            setShowMap(true);
                          }}
                          className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs flex items-center gap-1"
                        >
                          📍 Use My Location
                        </button>
                        <span className="text-xs text-gray-500 self-center">
                          or select from:
                        </span>
                        {predefinedLocations.slice(0, 3).map((loc) => (
                          <button
                            key={loc.name}
                            type="button"
                            onClick={() => selectPredefinedLocation(loc)}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs"
                          >
                            {loc.name}
                          </button>
                        ))}
                      </div>

                      {/* Interactive Map */}
                      {showMap && (
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-100 p-3 border-b">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                Click on the map to select location
                              </span>
                              <span className="text-xs text-gray-500">
                                📍 {newIssueForm.coordinates.lat.toFixed(4)},{" "}
                                {newIssueForm.coordinates.lng.toFixed(4)}
                              </span>
                            </div>
                          </div>

                          {/* Real Leaflet Map */}
                          <div className="h-64 relative">
                            {!mapLoaded ? (
                              <div className="h-full bg-gray-100 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                  <span className="text-gray-600">
                                    Loading map...
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <MapContainer
                                center={[
                                  newIssueForm.coordinates.lat,
                                  newIssueForm.coordinates.lng,
                                ]}
                                zoom={13}
                                style={{ height: "100%", width: "100%" }}
                                className="z-0"
                              >
                                <TileLayer
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {/* Map Click Handler */}
                                <MapClickHandler
                                  onLocationSelect={async (lat, lng) => {
                                    const address = await reverseGeocode(
                                      lat,
                                      lng
                                    );
                                    setNewIssueForm({
                                      ...newIssueForm,
                                      coordinates: { lat, lng },
                                      location: address,
                                    });
                                  }}
                                />

                                {/* Selected Location Marker */}
                                <Marker
                                  position={[
                                    newIssueForm.coordinates.lat,
                                    newIssueForm.coordinates.lng,
                                  ]}
                                >
                                  <Popup>
                                    <div className="text-center">
                                      <strong>Selected Location</strong>
                                      <br />
                                      {newIssueForm.location}
                                    </div>
                                  </Popup>
                                </Marker>

                                {/* User's Current Location Marker */}
                                {userLocation && (
                                  <Marker
                                    position={[
                                      userLocation.lat,
                                      userLocation.lng,
                                    ]}
                                  >
                                    <Popup>
                                      <div className="text-center">
                                        <strong>Your Current Location</strong>
                                        <br />
                                        📍 You are here
                                      </div>
                                    </Popup>
                                  </Marker>
                                )}

                                {/* Predefined Location Markers */}
                                {predefinedLocations.map((loc, index) => (
                                  <Marker
                                    key={loc.name}
                                    position={[loc.lat, loc.lng]}
                                  >
                                    <Popup>
                                      <div className="text-center">
                                        <strong>{loc.name}</strong>
                                        <br />
                                        <button
                                          onClick={() =>
                                            selectPredefinedLocation(loc)
                                          }
                                          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                        >
                                          Select This Location
                                        </button>
                                      </div>
                                    </Popup>
                                  </Marker>
                                ))}
                              </MapContainer>
                            )}
                          </div>

                          {/* Quick Actions for Map */}
                          <div className="bg-gray-50 p-3 border-t">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                              {predefinedLocations.map((loc) => (
                                <button
                                  key={loc.name}
                                  type="button"
                                  onClick={() => selectPredefinedLocation(loc)}
                                  className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                >
                                  {loc.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Selected Coordinates Display */}
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <strong>Selected:</strong>{" "}
                        {newIssueForm.location || "No location selected"}
                        {newIssueForm.location && (
                          <span className="ml-2">
                            ({newIssueForm.coordinates.lat.toFixed(6)},{" "}
                            {newIssueForm.coordinates.lng.toFixed(6)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Photos (Optional)
                  </label>
                  <div className="space-y-4">
                    {/* File Upload Input */}
                    <div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Select up to 5 images (JPG, PNG, max 5MB each)
                      </p>
                    </div>

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Selected Files:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                              <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm text-gray-600 text-center px-2">
                                  {file.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sample Images */}
                    {newIssueForm.images.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Sample Images:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {newIssueForm.images.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={addSampleImage}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                    >
                      <span className="text-xl">📷</span>
                      Add Sample Photo
                    </button>
                    <p className="text-xs text-gray-500">
                      Note: Sample photos are for demonstration. Use the file upload above for real photos.
                    </p>
                  </div>
                </div>

                {/* Reporter Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                      alt={currentUser}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Reporting as:
                      </p>
                      <p className="text-sm text-gray-600">{currentUser}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowNewIssueModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                  >
                    🚀 Submit Issue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Issue Details Modal */}
      {showDetailsModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">Issue Details</h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Issue Header */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedIssue.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {selectedIssue.description}
                    </p>
                  </div>
                  <div className="ml-6 text-right">
                    <p className="text-sm text-gray-500 mb-1">Issue ID</p>
                    <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {selectedIssue.id}
                    </p>
                  </div>
                </div>

                {/* Status and Priority Badges */}
                <div className="flex flex-wrap gap-3">
                  <span className={getStatusBadge(selectedIssue.status)}>
                    {selectedIssue.status.replace("-", " ").toUpperCase()}
                  </span>
                  <span className={getPriorityBadge(selectedIssue.priority)}>
                    {selectedIssue.priority.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                    {selectedIssue.category.replace("-", " ").toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Location and Map */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📍 Location</h4>
                  <p className="text-gray-700 mb-2">{selectedIssue.location}</p>
                  {(selectedIssue.coordinates || (selectedIssue.latitude && selectedIssue.longitude)) && (
                    <p className="text-sm text-gray-500">
                      Coordinates: {
                        selectedIssue.coordinates 
                          ? `${selectedIssue.coordinates.lat.toFixed(6)}, ${selectedIssue.coordinates.lng.toFixed(6)}`
                          : `${selectedIssue.latitude?.toFixed(6)}, ${selectedIssue.longitude?.toFixed(6)}`
                      }
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">👤 Reporter Information</h4>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedIssue.reporterAvatar}
                      alt={selectedIssue.reportedBy}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{selectedIssue.reportedBy}</p>
                      <p className="text-sm text-gray-500">
                        Reported on {new Date(selectedIssue.reportedDate || selectedIssue.createdAt || new Date()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              {selectedIssue.images && selectedIssue.images.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📸 Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedIssue.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Issue image ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                          <button
                            onClick={() => window.open(image, '_blank')}
                            className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium transition-opacity"
                          >
                            View Full Size
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Votes and Actions */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <span>👍</span>
                      <span className="font-medium">{selectedIssue.votes || 0} votes</span>
                    </button>
                    
                    {/* Admin Status Update */}
                    {isAdmin() && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Status:</label>
                        <select
                          value={selectedIssue.status}
                          onChange={(e) => {
                            updateIssueStatus(selectedIssue.id, e.target.value);
                            setSelectedIssue({...selectedIssue, status: e.target.value as any});
                          }}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={closeDetailsModal}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all">
                      📧 Contact Reporter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
