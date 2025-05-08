'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Download, Filter, ChevronLeft, ChevronRight, X, Info, RefreshCw, Eye, AlertTriangle, User } from 'lucide-react';

const UsersTable = () => {
  // State variables
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    isActive: true,
  });
  const [systemStatus, setSystemStatus] = useState({
    lastUpdated: null,
    connectionStatus: 'connecting',
  });
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    departments: {},
    roles: {},
  });
  
  // Pagination settings
  const itemsPerPage = 10;
  
  // Get auth data from localStorage
  const data = localStorage.getItem('sfAuthData');
  const parsedAuthData = data ? JSON.parse(data) : null;
  const sfAuthData = {
    instanceUrl: parsedAuthData ? parsedAuthData.instanceUrl : '', 
    accessToken: parsedAuthData ? parsedAuthData.accessToken : '',
  };

  // Fetch users from Salesforce
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    setSystemStatus(prev => ({...prev, connectionStatus: 'connecting'}));
    
    try {
      // Try to get from cache first if it exists and is less than 5 minutes old
      const cachedData = localStorage.getItem('sfUserCache');
      const cachedTimestamp = localStorage.getItem('sfUserCacheTime');
      
      if (cachedData && cachedTimestamp) {
        const parsedCache = JSON.parse(cachedData);
        const cacheTime = new Date(cachedTimestamp);
        const now = new Date();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (now - cacheTime < fiveMinutes) {
          setUsers(parsedCache);
          setFilteredUsers(parsedCache);
          calculateUserStats(parsedCache);
          setSystemStatus(prev => ({
            ...prev, 
            lastUpdated: cacheTime.toLocaleTimeString(),
            connectionStatus: 'connected',
          }));
          setLoading(false);
          return;
        }
      }
      // Otherwise, fetch fresh data
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sfAuthData }),
      });
   console.log('Response:', response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data from Salesforce');
      }

      const data = await response.json();
      console.log('Data:', data);
      if (data.success) {
        setUsers(data.users);
        setFilteredUsers(data.users);
        calculateUserStats(data.users);
        
        // Update cache
        localStorage.setItem('sfUserCache', JSON.stringify(data.users));
        localStorage.setItem('sfUserCacheTime', new Date().toISOString());
        
        setSystemStatus(prev => ({
          ...prev, 
          lastUpdated: new Date().toLocaleTimeString(),
          connectionStatus: 'connected',
        }));
      } else {
        setError(data.error || 'Error fetching users');
        setSystemStatus(prev => ({...prev, connectionStatus: 'error'}));
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setSystemStatus(prev => ({...prev, connectionStatus: 'error'}));
    } finally {
      setLoading(false);
    }
  };

  // Calculate user statistics
  const calculateUserStats = (userData) => {
    const stats = {
      total: userData.length,
      active: userData.filter(u => u.isActive).length,
      departments: {},
      roles: {},
    };
    
    userData.forEach(user => {
      // Count by department
      if (user.department) {
        stats.departments[user.department] = (stats.departments[user.department] || 0) + 1;
      }
      
      // Count by role
      if (user.roleName) {
        stats.roles[user.roleName] = (stats.roles[user.roleName] || 0) + 1;
      }
    });
    
    setUserStats(stats);
  };

  // Handle search and filtering
  useEffect(() => {
    if (!users.length) return;
    
    let results = [...users];
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(user => 
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term) ||
        user.title?.toLowerCase().includes(term)
      );
    }
    
    // Apply department filter
    if (filters.department) {
      results = results.filter(user => user.department === filters.department);
    }
    
    // Apply role filter
    if (filters.role) {
      results = results.filter(user => user.roleName === filters.role);
    }
    
    // Apply active filter
    if (filters.isActive !== null) {
      results = results.filter(user => user.isActive === filters.isActive);
    }
    
    setFilteredUsers(results);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, filters, users]);

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers();
  }, [sfAuthData.accessToken]);

  // Export users to CSV
  const exportToCSV = () => {
    if (!filteredUsers.length) return;
    
    const headers = [
      'Name', 'Email', 'Username', 'Title', 'Department', 
      'Role', 'Manager', 'Created Date', 'Last Login Date'
    ];
    
    const csvData = filteredUsers.map(user => [
      user.name,
      user.email,
      user.username,
      user.title,
      user.department,
      user.roleName,
      user.managerName || 'N/A',
      new Date(user.createdDate).toLocaleDateString(),
      new Date(user.lastLoginDate).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `salesforce-users-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique departments and roles for filters
  const departments = useMemo(() => {
    const depts = [...new Set(users.map(user => user.department).filter(Boolean))];
    return depts.sort();
  }, [users]);
  
  const roles = useMemo(() => {
    const rolesList = [...new Set(users.map(user => user.roleName).filter(Boolean))];
    return rolesList.sort();
  }, [users]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // View user details
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Utility function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Connection status indicator
  const ConnectionStatus = () => {
    const statusMap = {
      'connecting': { icon: <RefreshCw className="animate-spin" size={16} />, label: 'Connecting...', color: 'text-yellow-500' },
      'connected': { icon: <Info size={16} />, label: 'Connected', color: 'text-green-500' },
      'error': { icon: <AlertTriangle size={16} />, label: 'Connection Error', color: 'text-red-500' },
    };
    
    const status = statusMap[systemStatus.connectionStatus];
    
    return (
      <div className={`flex items-center gap-1 ${status.color}`}>
        {status.icon}
        <span className="text-xs">{status.label}</span>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Salesforce User Management</h1>
        <div className="flex items-center gap-2">
          <ConnectionStatus />
          {systemStatus.lastUpdated && (
            <span className="text-xs text-gray-500">
              Last updated: {systemStatus.lastUpdated}
            </span>
          )}
        </div>
      </div>

      {/* Analytics summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">User Statistics</h3>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{userStats.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold">{userStats.active}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Departments</p>
              <p className="text-2xl font-bold">{Object.keys(userStats.departments).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Top Departments</h3>
          <div className="space-y-1">
            {Object.entries(userStats.departments)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([dept, count]) => (
                <div key={dept} className="flex justify-between">
                  <span className="text-sm text-gray-600">{dept}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Top Roles</h3>
          <div className="space-y-1">
            {Object.entries(userStats.roles)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([role, count]) => (
                <div key={role} className="flex justify-between">
                  <span className="text-sm text-gray-600">{role}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search users by name, email, username, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={filters.isActive}
              onChange={(e) => setFilters({...filters, isActive: e.target.value === 'true'})}
            >
              <option value="true">Active Users</option>
              <option value="false">Inactive Users</option>
              <option value="">All Users</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchUsers}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw size={16} className="mr-1" />
              Refresh
            </button>
            
            <button
              onClick={exportToCSV}
              disabled={!filteredUsers.length}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Download size={16} className="mr-1" />
              Export CSV
            </button>
            
            {(filters.department || filters.role || searchTerm || filters.isActive !== true) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ department: '', role: '', isActive: true });
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X size={16} className="mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredUsers.length ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          
          {filteredUsers.length > 0 && (
            <div className="flex items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md mr-2 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md ml-2 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && filteredUsers.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.title || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.department || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.roleName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleDateString() : 'Never'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => viewUserDetails(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="flex flex-col items-center justify-center">
            <User size={48} className="text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No users found</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm || filters.department || filters.role || filters.isActive !== true
                ? "Try changing your search or filter criteria"
                : "No users available in your Salesforce instance"}
            </p>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-full overflow-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
                  <User className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500">{selectedUser.title || 'No Title'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Username</p>
                      <p className="text-sm font-medium">{selectedUser.username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Alias</p>
                      <p className="text-sm font-medium">{selectedUser.alias || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Organization Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="text-sm font-medium">{selectedUser.department || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Role</p>
                      <p className="text-sm font-medium">{selectedUser.roleName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Manager</p>
                      <p className="text-sm font-medium">{selectedUser.managerName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">System Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Profile</p>
                      <p className="text-sm font-medium">{selectedUser.profileName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">User Type</p>
                      <p className="text-sm font-medium">{selectedUser.userType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-medium">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {selectedUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Dates</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Created Date</p>
                      <p className="text-sm font-medium">{formatDate(selectedUser.createdDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Login Date</p>
                      <p className="text-sm font-medium">{formatDate(selectedUser.lastLoginDate) || 'Never'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Locale Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Time Zone</p>
                    <p className="text-sm font-medium">{selectedUser.timeZoneSidKey || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Locale</p>
                    <p className="text-sm font-medium">{selectedUser.localeSidKey || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Language</p>
                    <p className="text-sm font-medium">{selectedUser.languageLocaleKey || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email Encoding</p>
                    <p className="text-sm font-medium">{selectedUser.emailEncodingKey || 'N/A'}</p>
                  </div>
                </div>
              </div>
                            {/* Add any additional user permissions or settings sections */}
                            <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Federation ID</p>
                    <p className="text-sm font-medium">{selectedUser.federationIdentifier || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Employee Number</p>
                    <p className="text-sm font-medium">{selectedUser.employeeNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Modal footer with actions */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;