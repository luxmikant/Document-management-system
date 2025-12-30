import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { Document } from '../../../core/models';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>My Documents</h1>
        <a routerLink="/documents/upload" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17,8 12,3 7,8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload Document
        </a>
      </div>
      
      <!-- Search & Filter -->
      <div class="search-bar card">
        <div class="search-inputs">
          <input
            type="text"
            class="form-input search-input"
            placeholder="Search documents..."
            [(ngModel)]="searchQuery"
            (keyup.enter)="search()"
          />
          <input
            type="text"
            class="form-input tags-filter"
            placeholder="Filter by tags (comma-separated)"
            [(ngModel)]="tagFilter"
            (keyup.enter)="search()"
          />
          <select class="form-input sort-select" [(ngModel)]="sortBy" (change)="search()">
            <option value="createdAt">Sort by Date</option>
            <option value="title">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
          <button class="btn btn-icon" (click)="toggleSortOrder()" [title]="sortOrder === 'asc' ? 'Ascending' : 'Descending'">
            @if (sortOrder === 'asc') {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
              </svg>
            }
          </button>
          <button class="btn btn-primary" (click)="search()">Search</button>
          @if (searchQuery || tagFilter) {
            <button class="btn btn-outline" (click)="clearFilters()">Clear</button>
          }
        </div>
      </div>
      
      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <span>Loading documents...</span>
        </div>
      }
      
      <!-- Empty State -->
      @if (!loading() && documents().length === 0) {
        <div class="empty-state card">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          <h3>No documents found</h3>
          <p class="text-secondary">Upload your first document to get started</p>
          <a routerLink="/documents/upload" class="btn btn-primary">Upload Document</a>
        </div>
      }
      
      <!-- Document Grid -->
      @if (!loading() && documents().length > 0) {
        <div class="document-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          @for (doc of documents(); track doc.id || doc._id) {
            <a [routerLink]="['/documents', doc.id || doc._id]" class="document-card card">
              <div class="document-icon">
                @if (doc.mimeType.includes('pdf')) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><path d="M9 15v-2h1.5a1.5 1.5 0 0 1 0 3H9"/><path d="M15 13h2"/><path d="M16 13v4"/></svg>
                } @else if (doc.mimeType.includes('image')) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>
                }
              </div>
              
              <div class="document-info">
                <h4 class="document-title truncate">{{ doc.title }}</h4>
                <p class="document-meta text-xs text-secondary">
                  {{ formatFileSize(doc.size) }} • v{{ doc.currentVersionNumber }}
                </p>
                
                @if (doc.tags.length > 0) {
                  <div class="document-tags">
                    @for (tag of doc.tags.slice(0, 3); track tag) {
                      <span class="tag">{{ tag }}</span>
                    }
                    @if (doc.tags.length > 3) {
                      <span class="tag">+{{ doc.tags.length - 3 }}</span>
                    }
                  </div>
                }
              </div>
              
              <div class="document-access">
                @if (doc.isOwner || doc.access === 'owner') {
                  <span class="access-badge owner">Owner</span>
                } @else if (doc.access === 'editor') {
                  <span class="access-badge editor">Editor</span>
                } @else {
                  <span class="access-badge viewer">Viewer</span>
                }
              </div>
            </a>
          }
        </div>
        
        <!-- Pagination -->
        @if (pagination().pages > 1) {
          <div class="pagination">
            <button 
              class="btn btn-outline btn-sm"
              [disabled]="pagination().page <= 1"
              (click)="goToPage(pagination().page - 1)"
            >
              Previous
            </button>
            <span class="pagination-info">
              Page {{ pagination().page }} of {{ pagination().pages }}
            </span>
            <button 
              class="btn btn-outline btn-sm"
              [disabled]="pagination().page >= pagination().pages"
              (click)="goToPage(pagination().page + 1)"
            >
              Next
            </button>
          </div>
        }
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
    
    .search-bar {
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .search-inputs {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    
    .search-input {
      flex: 1;
      min-width: 200px;
    }
    
    .tags-filter {
      width: 200px;
    }
    
    .sort-select {
      width: 140px;
    }
    
    .btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--bg);
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .btn-icon:hover {
      background: var(--bg-secondary);
    }
    
    @media (max-width: 640px) {
      .search-inputs {
        flex-direction: column;
      }
      .tags-filter, .sort-select {
        width: 100%;
      }
    }
    
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem;
      color: var(--text-secondary);
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
      gap: 1rem;
      color: var(--text-secondary);
    }
    
    .empty-state h3 {
      color: var(--text);
      font-weight: 600;
    }
    
    .document-grid {
      margin-bottom: 1.5rem;
    }
    
    .document-card {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      text-decoration: none;
      color: inherit;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    
    .document-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
      text-decoration: none;
    }
    
    .document-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      margin-bottom: 0.75rem;
    }
    
    .document-info {
      flex: 1;
    }
    
    .document-title {
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    
    .document-meta {
      margin-bottom: 0.5rem;
    }
    
    .document-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }
    
    .document-access {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border);
    }
    
    .access-badge {
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    
    .access-badge.owner {
      background: #dbeafe;
      color: #1d4ed8;
    }
    
    .access-badge.editor {
      background: #dcfce7;
      color: #166534;
    }
    
    .access-badge.viewer {
      background: #f3f4f6;
      color: #6b7280;
    }
    
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    
    .pagination-info {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  `]
})
export class DocumentListComponent implements OnInit {
  documents = signal<Document[]>([]);
  loading = signal(true);
  pagination = signal({ page: 1, limit: 20, total: 0, pages: 0 });
  
  searchQuery = '';
  tagFilter = '';
  sortBy: 'createdAt' | 'title' | 'size' = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading.set(true);
    
    this.documentService.getDocuments({
      q: this.searchQuery || undefined,
      tags: this.tagFilter || undefined,
      page: this.pagination().page,
      limit: this.pagination().limit,
      sortBy: this.sortBy,
      order: this.sortOrder
    }).subscribe({
      next: (response) => {
        this.documents.set(response.documents);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.search();
  }

  search(): void {
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.loadDocuments();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.tagFilter = '';
    this.search();
  }

  goToPage(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadDocuments();
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
