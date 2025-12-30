import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Bell, 
  Menu,
  X,
  SlidersHorizontal,
  Calendar,
  Tag,
  User,
  FileType,
  LogOut
} from 'lucide-react';
import { useUIStore, useAuthStore } from '../store';

export function TopBar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { 
    searchQuery, 
    setSearchQuery, 
    setUploadModalOpen, 
    toggleSidebar,
    sidebarCollapsed,
    searchFilters,
    updateSearchFilters 
  } = useUIStore();
  const { currentUser, logout } = useAuthStore();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-2xl">
            <div
              className={`flex items-center gap-3 px-4 py-2.5 bg-slate-50 border rounded-xl transition-all ${
                searchFocused
                  ? 'border-indigo-300 bg-white shadow-sm shadow-indigo-100'
                  : 'border-slate-200'
              }`}
            >
              <Search className={`w-5 h-5 flex-shrink-0 ${searchFocused ? 'text-indigo-600' : 'text-slate-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search documents, tags, or owners..."
                className="flex-1 bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showFilters ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-400'
                }`}
                title="Advanced filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Advanced Filters Dropdown */}
            {showFilters && (
              <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-slate-200 rounded-xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-slate-700 mb-2">
                      <FileType className="w-4 h-4" />
                      Document Type
                    </label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">All types</option>
                      <option value="pdf">PDF</option>
                      <option value="image">Images</option>
                      <option value="doc">Documents</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-slate-700 mb-2">
                      <User className="w-4 h-4" />
                      Owner
                    </label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">All owners</option>
                      <option value="me">Me</option>
                      <option value="others">Others</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-slate-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      Date Range
                    </label>
                    <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Any time</option>
                      <option value="today">Today</option>
                      <option value="week">This week</option>
                      <option value="month">This month</option>
                      <option value="year">This year</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-slate-700 mb-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </label>
                    <input
                      type="text"
                      placeholder="Enter tags..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Clear filters
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Apply filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions + Profile */}
        <div className="flex items-center gap-2">
          {/* Upload Button */}
          <button
            onClick={() => setUploadModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm hover:shadow-md"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>

          {/* Mobile Upload Button */}
          <button
            onClick={() => setUploadModalOpen(true)}
            className="md:hidden p-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all"
            aria-label="Upload"
          >
            <Upload className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button
            className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div className="hidden lg:block text-left">
                <p className="text-slate-900 text-sm">{currentUser?.name}</p>
                <p className="text-slate-500 text-xs capitalize">{currentUser?.role}</p>
              </div>
            </button>

            {showProfile && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="text-slate-900">{currentUser?.name}</p>
                  <p className="text-slate-600 text-sm">{currentUser?.email}</p>
                  <p className="text-slate-500 text-xs mt-1 capitalize">
                    Role: {currentUser?.role}
                  </p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setShowProfile(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
