import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocumentService, DashboardData } from '../../core/services/document.service';
import { Document } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Dashboard</h1>
        <a routerLink="/documents/upload" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17,8 12,3 7,8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload Document
        </a>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <span>Loading dashboard...</span>
        </div>
      }

      @if (!loading() && dashboardData()) {
        <!-- Stats Overview -->
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ dashboardData()?.stats?.totalDocuments || 0 }}</span>
              <span class="stat-label">Total Documents</span>
            </div>
          </div>

          <div class="stat-card card">
            <div class="stat-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ formatFileSize(dashboardData()?.stats?.totalSize || 0) }}</span>
              <span class="stat-label">Total Storage</span>
            </div>
          </div>

          <div class="stat-card card">
            <div class="stat-icon purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ recentDocuments().length }}</span>
              <span class="stat-label">Recent Uploads</span>
            </div>
          </div>

          <div class="stat-card card">
            <div class="stat-icon orange">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ sharedDocuments().length }}</span>
              <span class="stat-label">Shared With Me</span>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Recent Documents -->
          <div class="dashboard-section card">
            <div class="section-header">
              <h2>Recently Uploaded</h2>
              <a routerLink="/documents" class="btn btn-outline btn-sm">View All</a>
            </div>
            
            @if (recentDocuments().length === 0) {
              <div class="empty-state-small">
                <p>No documents yet. Upload your first document!</p>
              </div>
            } @else {
              <div class="document-list">
                @for (doc of recentDocuments(); track doc.id || doc._id) {
                  <a [routerLink]="['/documents', doc.id || doc._id]" class="document-row">
                    <div class="doc-icon">
                      @if (doc.mimeType?.includes('pdf')) {
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>
                      } @else if (doc.mimeType?.includes('image')) {
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>
                      }
                    </div>
                    <div class="doc-info">
                      <span class="doc-title">{{ doc.title }}</span>
                      <span class="doc-meta">{{ formatFileSize(doc.size) }} • {{ formatDate(doc.createdAt) }}</span>
                    </div>
                    <span class="doc-version">v{{ doc.currentVersionNumber }}</span>
                  </a>
                }
              </div>
            }
          </div>

          <!-- Size Distribution -->
          <div class="dashboard-section card">
            <div class="section-header">
              <h2>Size Distribution</h2>
            </div>
            
            @if (dashboardData()?.sizeGroups && dashboardData()!.sizeGroups.length > 0) {
              <div class="size-groups">
                @for (group of dashboardData()!.sizeGroups; track group._id) {
                  <div class="size-group-item">
                    <div class="size-group-info">
                      <span class="size-group-label">{{ getSizeLabel(group._id) }}</span>
                      <span class="size-group-count">{{ group.count }} files</span>
                    </div>
                    <div class="size-group-bar">
                      <div 
                        class="size-group-fill"
                        [style.width.%]="getPercentage(group.count)"
                        [class]="'fill-' + group._id"
                      ></div>
                    </div>
                    <span class="size-group-total">{{ formatFileSize(group.totalSize) }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state-small">
                <p>No data available</p>
              </div>
            }
          </div>

          <!-- File Types -->
          <div class="dashboard-section card">
            <div class="section-header">
              <h2>File Types</h2>
            </div>
            
            @if (dashboardData()?.typeGroups && dashboardData()!.typeGroups.length > 0) {
              <div class="type-groups">
                @for (type of dashboardData()!.typeGroups; track type._id) {
                  <div class="type-group-item">
                    <div class="type-icon" [class]="'type-' + getTypeClass(type._id)">
                      {{ getTypeIcon(type._id) }}
                    </div>
                    <div class="type-info">
                      <span class="type-label">{{ type._id || 'Unknown' }}</span>
                      <span class="type-count">{{ type.count }} files</span>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state-small">
                <p>No data available</p>
              </div>
            }
          </div>

          <!-- Top Tags -->
          <div class="dashboard-section card">
            <div class="section-header">
              <h2>Popular Tags</h2>
            </div>
            
            @if (dashboardData()?.topTags && dashboardData()!.topTags.length > 0) {
              <div class="tag-cloud">
                @for (tag of dashboardData()!.topTags; track tag._id) {
                  <span class="tag-item" [style.font-size.rem]="getTagSize(tag.count)">
                    {{ tag._id }} <span class="tag-count">{{ tag.count }}</span>
                  </span>
                }
              </div>
            } @else {
              <div class="empty-state-small">
                <p>No tags yet</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem;
      color: var(--text-secondary);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
    }

    .stat-icon.blue { background: #dbeafe; color: #3b82f6; }
    .stat-icon.green { background: #dcfce7; color: #22c55e; }
    .stat-icon.purple { background: #f3e8ff; color: #a855f7; }
    .stat-icon.orange { background: #ffedd5; color: #f97316; }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    .dashboard-section {
      padding: 1.25rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
    }

    .section-header h2 {
      font-size: 1rem;
      font-weight: 600;
    }

    .empty-state-small {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .document-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .document-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      transition: background-color 0.2s;
    }

    .document-row:hover {
      background: var(--bg-secondary);
    }

    .doc-icon {
      flex-shrink: 0;
    }

    .doc-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .doc-title {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .doc-meta {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .doc-version {
      font-size: 0.75rem;
      color: var(--text-secondary);
      background: var(--bg-secondary);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .size-groups {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .size-group-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .size-group-info {
      width: 100px;
      flex-shrink: 0;
    }

    .size-group-label {
      font-size: 0.875rem;
      font-weight: 500;
      display: block;
    }

    .size-group-count {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .size-group-bar {
      flex: 1;
      height: 8px;
      background: var(--bg-secondary);
      border-radius: 4px;
      overflow: hidden;
    }

    .size-group-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .fill-small { background: #22c55e; }
    .fill-medium { background: #f59e0b; }
    .fill-large { background: #ef4444; }

    .size-group-total {
      font-size: 0.75rem;
      color: var(--text-secondary);
      width: 70px;
      text-align: right;
    }

    .type-groups {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.75rem;
    }

    .type-group-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--bg-secondary);
      border-radius: 8px;
    }

    .type-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .type-pdf { background: #fee2e2; color: #dc2626; }
    .type-image { background: #dcfce7; color: #16a34a; }
    .type-doc { background: #dbeafe; color: #2563eb; }
    .type-other { background: #f3f4f6; color: #6b7280; }

    .type-info {
      display: flex;
      flex-direction: column;
    }

    .type-label {
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .type-count {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .tag-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .tag-item {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.75rem;
      background: var(--primary-light);
      color: var(--primary);
      border-radius: 9999px;
      font-weight: 500;
    }

    .tag-count {
      font-size: 0.625rem;
      background: var(--primary);
      color: white;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboardData = signal<DashboardData | null>(null);
  recentDocuments = signal<Document[]>([]);
  sharedDocuments = signal<Document[]>([]);
  loading = signal(true);

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);

    // Load dashboard data
    this.documentService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.recentDocuments.set(data.recentDocuments || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });

    // Load shared documents
    this.documentService.getSharedDocuments().subscribe({
      next: (response) => {
        this.sharedDocuments.set(response.documents || []);
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  }

  getSizeLabel(sizeGroup: string): string {
    const labels: Record<string, string> = {
      'small': 'Small (<100KB)',
      'medium': 'Medium (100KB-1MB)',
      'large': 'Large (>1MB)'
    };
    return labels[sizeGroup] || sizeGroup;
  }

  getPercentage(count: number): number {
    const total = this.dashboardData()?.stats?.totalDocuments || 1;
    return Math.min((count / total) * 100, 100);
  }

  getTypeClass(mimeType: string): string {
    if (!mimeType) return 'other';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    return 'other';
  }

  getTypeIcon(mimeType: string): string {
    if (!mimeType) return '?';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('image')) return 'IMG';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'DOC';
    if (mimeType.includes('text')) return 'TXT';
    return 'FILE';
  }

  getTagSize(count: number): number {
    // Scale tag size based on count (0.75rem to 1.25rem)
    const maxCount = Math.max(...(this.dashboardData()?.topTags?.map(t => t.count) || [1]));
    const scale = count / maxCount;
    return 0.75 + (scale * 0.5);
  }
}
