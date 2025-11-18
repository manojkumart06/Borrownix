import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { getUser } from '../utils/auth';
import Layout from '../components/Layout';

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => getUser()); // Get user once on mount
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, usersResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/dashboard');
      } else {
        toast.error('Failed to load admin dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, {
        isActive: !currentStatus
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleViewActivity = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}/activity`);
      if (response.data.success) {
        setUserActivity(response.data.data);
        setSelectedUser(users.find(u => u._id === userId));
        setShowActivityModal(true);
      }
    } catch (error) {
      toast.error('Failed to fetch user activity');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading admin dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="text-sm text-gray-400">
            Logged in as: <span className="text-lime-400 font-semibold">{currentUser?.name}</span>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Users Stats */}
            <div className="card bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-400/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.users.total}</p>
                  <p className="text-blue-400 text-xs mt-2">
                    {stats.users.active} active • {stats.users.admins} admins
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            {/* Recent Logins */}
            <div className="card bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-400/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Recent Logins</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.users.recentLogins}</p>
                  <p className="text-green-400 text-xs mt-2">Last 24 hours</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔐</span>
                </div>
              </div>
            </div>

            {/* Borrowers */}
            <div className="card bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-400/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Borrowers</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.borrowers.total}</p>
                  <p className="text-purple-400 text-xs mt-2">Across all users</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            {/* Collections */}
            <div className="card bg-gradient-to-br from-lime-500/10 to-lime-600/5 border-lime-400/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Collected</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatCurrency(stats.collections.totalAmountCollected)}
                  </p>
                  <p className="text-lime-400 text-xs mt-2">
                    {stats.collections.pending} pending
                  </p>
                </div>
                <div className="w-12 h-12 bg-lime-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">All Users</h2>
            <p className="text-sm text-gray-400">{users.length} total users</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-lime-400/20">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Last Login</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Stats</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-slate-700/50 hover:bg-white/5 transition"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{u.name}</p>
                        <p className="text-gray-400 text-sm">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {u.isOnline && (
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        )}
                        <span
                          className={`text-sm ${
                            u.isActive ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-gray-300 text-sm">{formatDate(u.lastLoginAt)}</p>
                        <p className="text-gray-500 text-xs">
                          {u.loginCount || 0} total logins
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-400">
                        <p>{u.stats.borrowerCount} borrowers</p>
                        <p>{u.stats.pendingCollections} pending</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewActivity(u._id)}
                          className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition"
                        >
                          View Activity
                        </button>
                        {u._id !== currentUser?.id && (
                          <button
                            onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                            className={`px-3 py-1 text-sm rounded transition ${
                              u.isActive
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      {showActivityModal && selectedUser && userActivity && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-lime-400/20">
            {/* Modal Header */}
            <div className="p-6 border-b border-lime-400/20">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">User Activity</h3>
                  <p className="text-gray-400 mt-1">{selectedUser.name} ({selectedUser.email})</p>
                </div>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs">Joined</p>
                    <p className="text-white font-semibold mt-1">
                      {new Date(userActivity.user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs">Last Login</p>
                    <p className="text-white font-semibold mt-1">
                      {formatDate(userActivity.user.lastLoginAt)}
                    </p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs">Total Logins</p>
                    <p className="text-white font-semibold mt-1">{userActivity.user.loginCount}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs">Status</p>
                    <p className={`font-semibold mt-1 ${userActivity.user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {userActivity.user.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                {/* Recent Borrowers */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Recent Borrowers</h4>
                  {userActivity.recentBorrowers.length === 0 ? (
                    <p className="text-gray-400">No borrowers created yet</p>
                  ) : (
                    <div className="space-y-2">
                      {userActivity.recentBorrowers.map((borrower) => (
                        <div key={borrower._id} className="bg-slate-700/50 rounded-lg p-3 flex justify-between items-center">
                          <p className="text-white">{borrower.borrowerName}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(borrower.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Collections */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Recent Collections</h4>
                  {userActivity.recentCollections.length === 0 ? (
                    <p className="text-gray-400">No collections yet</p>
                  ) : (
                    <div className="space-y-2">
                      {userActivity.recentCollections.map((collection) => (
                        <div key={collection._id} className="bg-slate-700/50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">
                                {collection.borrowerId?.borrowerName || 'Unknown'}
                              </p>
                              <p className="text-gray-400 text-sm">
                                Due: {new Date(collection.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                  collection.status === 'received'
                                    ? 'bg-green-500/20 text-green-400'
                                    : collection.status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {collection.status}
                              </span>
                              {collection.status === 'received' && (
                                <p className="text-lime-400 text-sm mt-1">
                                  {formatCurrency(collection.amountCollected)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-lime-400/20">
              <button
                onClick={() => setShowActivityModal(false)}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default AdminDashboard;
