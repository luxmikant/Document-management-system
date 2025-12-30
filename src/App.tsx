import { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { AppShell } from './components/AppShell';
import { DocumentsDashboard } from './components/DocumentsDashboard';
import { DocumentDetails } from './components/DocumentDetails';
import { UploadFlow } from './components/UploadFlow';
import { PermissionsManagement } from './components/PermissionsManagement';
import { AdminPanel } from './components/AdminPanel';
import { useAuthStore, useDocumentStore, useUIStore } from './store';

export default function App() {
  const { isAuthenticated, currentUser } = useAuthStore();
  const { currentView, selectedDocumentId, uploadModalOpen } = useUIStore();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <>
      <AppShell>
        {currentView === 'dashboard' && <DocumentsDashboard />}
        {currentView === 'document-details' && selectedDocumentId && <DocumentDetails />}
        {currentView === 'permissions' && selectedDocumentId && <PermissionsManagement />}
        {currentView === 'admin' && currentUser?.role === 'admin' && <AdminPanel />}
      </AppShell>
      
      {/* Upload Modal */}
      {uploadModalOpen && <UploadFlow />}
    </>
  );
}