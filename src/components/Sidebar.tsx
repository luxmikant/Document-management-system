import { 
  FileText, 
  Home, 
  Share2, 
  Upload, 
  Star, 
  Trash2, 
  Settings, 
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUIStore, useAuthStore, DashboardFilter } from '../store';

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, dashboardFilter, setDashboardFilter, setCurrentView } = useUIStore();
  const { currentUser } = useAuthStore();

  const navItems = [
    { id: 'all' as DashboardFilter, icon: Home, label: 'All Documents', badge: null },
    { id: 'shared' as DashboardFilter, icon: Share2, label: 'Shared with me', badge: null },
    { id: 'my-uploads' as DashboardFilter, icon: Upload, label: 'My uploads', badge: null },
    { id: 'starred' as DashboardFilter, icon: Star, label: 'Starred', badge: null },
    { id: 'trash' as DashboardFilter, icon: Trash2, label: 'Trash', badge: null },
  ];

  const handleNavClick = (filterId: DashboardFilter) => {
    setDashboardFilter(filterId);
    setCurrentView('dashboard');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 z-50 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-slate-900">DocuVault</span>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = dashboardFilter === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : ''}`} />
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.badge && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin Section */}
            {currentUser?.role === 'admin' && (
              <>
                <div className={`pt-4 mt-4 border-t border-slate-200 ${sidebarCollapsed ? 'mx-auto w-12' : ''}`}>
                  {!sidebarCollapsed && (
                    <p className="px-3 mb-2 text-xs text-slate-500 uppercase tracking-wider">
                      Admin
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                  title={sidebarCollapsed ? 'User Management' : undefined}
                >
                  <Users className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="flex-1 text-left">User Management</span>}
                </button>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                  title={sidebarCollapsed ? 'Settings' : undefined}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="flex-1 text-left">Settings</span>}
                </button>
              </>
            )}
          </nav>

          {/* Collapse Toggle - Desktop Only */}
          <div className="hidden lg:block p-4 border-t border-slate-200">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
