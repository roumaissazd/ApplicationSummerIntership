import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 10;

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('http://localhost:5001/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        console.error(data.error || 'Error fetching users');
      }
    } catch (err) {
      console.error('Server error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredUsers(filtered);
      setPage(1);
    }
  }, [searchTerm, users]);

  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-primary font-sans">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-tertiary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary font-sans mb-2">Users Management</h1>
            <p className="text-text-secondary font-sans">Manage system users and their permissions</p>
          </div>
          <Link
            to="/register"
            className="bg-gradient-to-r from-accent-green to-accent-blue text-white font-semibold py-3 px-6 rounded-lg hover:from-accent-blue hover:to-accent-purple transition-all duration-300 font-sans shadow-glow"
          >
            + Add New User
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary font-sans text-sm">Total Users</p>
                <p className="text-2xl font-bold text-text-primary font-mono">{users.length}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary font-sans text-sm">Active Users</p>
                <p className="text-2xl font-bold text-accent-green font-mono">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <div className="text-3xl">🟢</div>
            </div>
          </div>
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary font-sans text-sm">Admins</p>
                <p className="text-2xl font-bold text-accent-purple font-mono">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <div className="text-3xl">👑</div>
            </div>
          </div>
          <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary font-sans text-sm">Inactive</p>
                <p className="text-2xl font-bold text-accent-red font-mono">
                  {users.filter(u => !u.isActive).length}
                </p>
              </div>
              <div className="text-3xl">🔴</div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-glass backdrop-blur-md rounded-2xl border border-glass-border shadow-glass overflow-hidden">
          {/* Table Header */}
          <div className="p-6 border-b border-glass-border">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="text-text-primary font-sans font-semibold">Show</span>
                <select
                  value={PAGE_SIZE}
                  onChange={(e) => setPage(1)}
                  disabled
                  className="px-3 py-1 bg-dark-secondary/50 border border-glass-border rounded-lg text-text-primary font-sans"
                >
                  <option>10</option>
                </select>
                <span className="text-text-primary font-sans">entries</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-text-primary font-sans">Search:</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="px-4 py-2 bg-dark-secondary/50 border border-glass-border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-300 text-text-primary placeholder-text-secondary font-sans"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-secondary/30">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input type="checkbox" className="rounded border-glass-border" />
                  </th>
                  <th className="px-6 py-4 text-left text-text-primary font-sans font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-text-primary font-sans font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-text-primary font-sans font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-text-primary font-sans font-semibold">Role</th>
                  <th className="px-6 py-4 text-left text-text-primary font-sans font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-text-primary font-sans font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-text-secondary font-sans">
                      No users found
                    </td>
                  </tr>
                ) : paginatedUsers.map(user => (
                  <tr key={user._id} className="border-b border-glass-border hover:bg-dark-secondary/20 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-glass-border" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {(user.firstName || ' ').charAt(0)}{(user.lastName || ' ').charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-text-primary font-sans font-semibold">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-text-secondary font-sans text-sm capitalize">
                            {user.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-primary font-sans">{user.email}</td>
                    <td className="px-6 py-4 text-text-primary font-mono text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold font-sans capitalize ${
                        user.role === 'admin'
                          ? 'bg-accent-purple/20 text-accent-purple'
                          : 'bg-accent-blue/20 text-accent-blue'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold font-sans ${
                        user.isActive
                          ? 'bg-accent-green/20 text-accent-green'
                          : 'bg-accent-red/20 text-accent-red'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors duration-200">
                          ✏️
                        </button>
                        <button className="p-2 text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors duration-200">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-glass-border">
              <div className="flex justify-end space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`px-3 py-2 rounded-lg font-sans transition-all duration-300 ${
                      pageNumber === page
                        ? 'bg-accent-blue text-white shadow-glow'
                        : 'bg-dark-secondary/50 text-text-primary hover:bg-dark-secondary border border-glass-border'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UsersTable;
