import { useState } from 'react';
import { 
  Users, 
  Search, 
  MoreVertical, 
  Shield, 
  Edit, 
  Eye,
  UserCheck,
  UserX,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { UserRole, useUIStore } from '../store';
import { toast } from 'sonner@2.0.3';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  joinedAt: Date;
  lastActive: Date;
  documentsCount: number;
}

const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    name: 'Alex Morgan',
    email: 'alex@example.com',
    role: 'admin',
    status: 'active',
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date(),
    documentsCount: 24
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'editor',
    status: 'active',
    joinedAt: new Date('2024-02-20'),
    lastActive: new Date('2024-12-29'),
    documentsCount: 18
  },
  {
    id: '3',
    name: 'Michael Rodriguez',
    email: 'michael@example.com',
    role: 'editor',
    status: 'active',
    joinedAt: new Date('2024-03-10'),
    lastActive: new Date('2024-12-28'),
    documentsCount: 32
  },
  {
    id: '4',
    name: 'Emily Johnson',
    email: 'emily@example.com',
    role: 'viewer',
    status: 'active',
    joinedAt: new Date('2024-04-05'),
    lastActive: new Date('2024-12-27'),
    documentsCount: 5
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david@example.com',
    role: 'editor',
    status: 'inactive',
    joinedAt: new Date('2024-01-20'),
    lastActive: new Date('2024-11-15'),
    documentsCount: 12
  },
];

export function AdminPanel() {
  const [users] = useState<MockUser[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { setCurrentView } = useUIStore();

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    toast.success(`User role updated to ${newRole}`);
  };

  const handleStatusToggle = (userId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'editor':
        return 'bg-blue-100 text-blue-700';
      case 'viewer':
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'editor':
        return Edit;
      case 'viewer':
        return Eye;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-slate-900 mb-2">User Management</h1>
            <p className="text-slate-600">Manage users, roles, and permissions across your organization</p>
          </div>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            onClick={() => toast.info('Invite functionality coming soon')}
          >
            Invite users
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Total Users</p>
              <p className="text-slate-900 text-xl">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Active</p>
              <p className="text-slate-900 text-xl">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Admins</p>
              <p className="text-slate-900 text-xl">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
              <UserX className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Inactive</p>
              <p className="text-slate-900 text-xl">
                {users.filter(u => u.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs text-slate-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs text-slate-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs text-slate-600 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-4 text-left text-xs text-slate-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs text-slate-600 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-700">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-slate-900">{user.name}</p>
                          <p className="text-slate-600 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className={`px-3 py-1.5 rounded-lg text-sm capitalize ${getRoleBadgeClass(user.role)} border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusToggle(user.id, user.status)}
                        className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {user.documentsCount}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {formatDate(user.joinedAt)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {formatDate(user.lastActive)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="More actions"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-600" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No users found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Results count */}
      {filteredUsers.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-slate-600">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      )}
    </div>
  );
}
