import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { TagInputComponent } from '../../../shared/components/tag-input/tag-input.component';
import { Document, Version, Permission, User } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TagInputComponent],
  template: `
    <div class="container">
      @if (loading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <span>Loading document...</span>
        </div>
      }
      
      @if (!loading() && document()) {
        <div class="detail-layout">
          <!-- Main Content -->
          <div class="main-content">
            <div class="page-header">
              <a routerLink="/documents" class="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </a>
            </div>
            
            <!-- Document Info Card -->
            <div class="card document-info-card">
              <div class="card-body">
                <div class="document-header">
                  <div class="document-icon">
                    @if (document()?.mimeType?.includes('pdf')) {
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>
                    } @else if (document()?.mimeType?.includes('image')) {
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>
                    }
                  </div>
                  
                  <div class="document-title-section">
                    @if (!editing()) {
                      <h1>{{ document()?.title }}</h1>
                      <p class="text-secondary text-sm">{{ document()?.originalFilename }}</p>
                    } @else {
                      <input
                        type="text"
                        class="form-input title-input"
                        [(ngModel)]="editTitle"
                        placeholder="Document title"
                      />
                    }
                  </div>
                  
                  <div class="document-actions">
                    <button 
                      class="btn btn-primary"
                      (click)="downloadFile()"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download
                    </button>
                    
                    <button 
                      class="btn btn-outline"
                      (click)="previewFile()"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Preview
                    </button>
                    
                    @if (document()?.canEdit || document()?.isOwner) {
                      @if (!editing()) {
                        <button class="btn btn-outline" (click)="startEditing()">Edit</button>
                      } @else {
                        <button class="btn btn-primary" (click)="saveChanges()" [disabled]="saving()">
                          @if (saving()) { <span class="spinner"></span> }
                          Save
                        </button>
                        <button class="btn btn-outline" (click)="cancelEditing()">Cancel</button>
                      }
                    }
                    
                    @if (document()?.isOwner) {
                      <button class="btn btn-danger btn-sm" (click)="deleteDocument()">Delete</button>
                    }
                  </div>
                </div>
                
                <!-- Metadata -->
                <div class="document-meta-grid">
                  <div class="meta-item">
                    <span class="meta-label">Size</span>
                    <span class="meta-value">{{ formatFileSize(document()?.size || 0) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Type</span>
                    <span class="meta-value">{{ document()?.mimeType }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Version</span>
                    <span class="meta-value">v{{ document()?.currentVersionNumber }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Updated</span>
                    <span class="meta-value">{{ formatDate(document()?.updatedAt) }}</span>
                  </div>
                </div>
                
                <!-- Description -->
                <div class="document-description">
                  <h3>Description</h3>
                  @if (!editing()) {
                    <p class="text-secondary">{{ document()?.description || 'No description' }}</p>
                  } @else {
                    <textarea
                      class="form-input"
                      [(ngModel)]="editDescription"
                      rows="3"
                      placeholder="Add a description..."
                    ></textarea>
                  }
                </div>
                
                <!-- Tags -->
                <div class="document-tags-section">
                  <h3>Tags</h3>
                  @if (!editing()) {
                    <div class="tags-list">
                      @for (tag of document()?.tags || []; track tag) {
                        <span class="tag">{{ tag }}</span>
                      }
                      @if ((document()?.tags || []).length === 0) {
                        <span class="text-secondary text-sm">No tags</span>
                      }
                    </div>
                  } @else {
                    <app-tag-input [(ngModel)]="editTags"></app-tag-input>
                  }
                </div>
              </div>
            </div>
            
            <!-- Upload New Version -->
            @if (document()?.canEdit || document()?.isOwner) {
              <div class="card version-upload-card">
                <div class="card-header">
                  <h3>Upload New Version</h3>
                </div>
                <div class="card-body">
                  <div 
                    class="drop-zone-sm"
                    [class.has-file]="newVersionFile"
                    (click)="versionFileInput.click()"
                  >
                    <input
                      type="file"
                      #versionFileInput
                      hidden
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx"
                      (change)="onVersionFileSelected($event)"
                    />
                    @if (!newVersionFile) {
                      <span>Click to select a file</span>
                    } @else {
                      <span>{{ newVersionFile.name }} ({{ formatFileSize(newVersionFile.size) }})</span>
                      <button class="btn btn-sm btn-outline" (click)="clearVersionFile($event)">Remove</button>
                    }
                  </div>
                  
                  <div class="form-group mt-2">
                    <input
                      type="text"
                      class="form-input"
                      [(ngModel)]="changeLog"
                      placeholder="What changed? (optional)"
                    />
                  </div>
                  
                  @if (uploadingVersion()) {
                    <div class="progress-container">
                      <div class="progress-bar">
                        <div class="progress-fill" [style.width.%]="versionProgress()"></div>
                      </div>
                      <span>{{ versionProgress() }}%</span>
                    </div>
                  }
                  
                  <button 
                    class="btn btn-primary"
                    [disabled]="!newVersionFile || uploadingVersion()"
                    (click)="uploadNewVersion()"
                  >
                    @if (uploadingVersion()) {
                      <span class="spinner"></span> Uploading...
                    } @else {
                      Upload Version
                    }
                  </button>
                </div>
              </div>
            }
            
            <!-- Version History -->
            <div class="card versions-card">
              <div class="card-header">
                <h3>Version History</h3>
              </div>
              <div class="card-body">
                @if (versions().length === 0) {
                  <p class="text-secondary">No version history</p>
                } @else {
                  <div class="version-list">
                    @for (version of versions(); track version._id) {
                      <div class="version-item">
                        <div class="version-info">
                          <span class="version-number">v{{ version.versionNumber }}</span>
                          <span class="version-date">{{ formatDate(version.createdAt) }}</span>
                          @if (version.changeLog) {
                            <span class="version-log text-secondary">{{ version.changeLog }}</span>
                          }
                        </div>
                        <div class="version-meta">
                          <span class="text-sm text-secondary">{{ formatFileSize(version.size) }}</span>
                          <button 
                            class="btn btn-sm btn-outline"
                            (click)="downloadVersion(version)"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
          
          <!-- Sidebar - Permissions (Owner Only) -->
          @if (document()?.isOwner) {
            <div class="sidebar">
              <div class="card permissions-card">
                <div class="card-header">
                  <h3>Permissions</h3>
                </div>
                <div class="card-body">
                  <!-- Add Permission -->
                  <div class="add-permission">
                    <div class="form-group">
                      <input
                        type="email"
                        class="form-input"
                        [(ngModel)]="searchEmail"
                        placeholder="Search user by email"
                        (input)="searchUsers()"
                      />
                    </div>
                    
                    @if (searchResults().length > 0) {
                      <div class="search-results">
                        @for (user of searchResults(); track user.id) {
                          <div class="search-result-item" (click)="selectUser(user)">
                            <span>{{ user.firstName }} {{ user.lastName }}</span>
                            <span class="text-secondary text-sm">{{ user.email }}</span>
                          </div>
                        }
                      </div>
                    }
                    
                    @if (selectedUser()) {
                      <div class="selected-user">
                        <span>{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</span>
                        <select class="form-input access-select" [(ngModel)]="selectedAccess">
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                        </select>
                        <button 
                          class="btn btn-primary btn-sm"
                          (click)="addPermission()"
                          [disabled]="addingPermission()"
                        >
                          Add
                        </button>
                      </div>
                    }
                  </div>
                  
                  <!-- Current Permissions -->
                  <div class="permissions-list">
                    <h4>Shared With</h4>
                    @if ((document()?.acl || []).length === 0) {
                      <p class="text-secondary text-sm">Not shared with anyone</p>
                    } @else {
                      @for (perm of document()?.acl || []; track getPermUserId(perm)) {
                        <div class="permission-item">
                          <div class="perm-user">
                            <span class="perm-name">{{ getPermUserName(perm) }}</span>
                            <span class="perm-email text-secondary text-sm">{{ getPermUserEmail(perm) }}</span>
                          </div>
                          <div class="perm-actions">
                            <span class="access-badge" [class]="perm.access">{{ perm.access }}</span>
                            <button 
                              class="btn btn-sm btn-outline"
                              (click)="removePermission(getPermUserId(perm))"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem;
      color: var(--text-secondary);
    }
    
    .detail-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    @media (min-width: 1024px) {
      .detail-layout {
        grid-template-columns: 1fr 320px;
      }
    }
    
    .page-header {
      margin-bottom: 1rem;
    }
    
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
    
    .back-link:hover {
      color: var(--primary);
      text-decoration: none;
    }
    
    .document-header {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    
    .document-icon {
      flex-shrink: 0;
    }
    
    .document-title-section {
      flex: 1;
      min-width: 200px;
    }
    
    .document-title-section h1 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .title-input {
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .document-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .document-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: var(--background);
      border-radius: var(--radius);
    }
    
    @media (min-width: 640px) {
      .document-meta-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    
    .meta-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }
    
    .meta-value {
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .document-description,
    .document-tags-section {
      margin-bottom: 1rem;
    }
    
    .document-description h3,
    .document-tags-section h3 {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }
    
    .card {
      margin-bottom: 1rem;
    }
    
    .card-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border);
    }
    
    .card-header h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }
    
    .drop-zone-sm {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border: 1px dashed var(--border);
      border-radius: var(--radius);
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
    }
    
    .drop-zone-sm:hover {
      border-color: var(--primary);
    }
    
    .drop-zone-sm.has-file {
      border-style: solid;
      border-color: var(--success);
      color: var(--text);
    }
    
    .progress-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    
    .progress-bar {
      flex: 1;
      height: 6px;
      background: var(--border);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: var(--primary);
      transition: width 0.2s;
    }
    
    .version-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .version-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: var(--background);
      border-radius: var(--radius);
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .version-info {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }
    
    .version-number {
      font-weight: 600;
      color: var(--primary);
    }
    
    .version-date {
      font-size: 0.875rem;
    }
    
    .version-log {
      font-size: 0.875rem;
    }
    
    .version-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    /* Permissions Sidebar */
    .sidebar {
      position: sticky;
      top: 80px;
    }
    
    .add-permission {
      margin-bottom: 1.5rem;
    }
    
    .search-results {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      max-height: 200px;
      overflow-y: auto;
      margin-bottom: 0.5rem;
    }
    
    .search-result-item {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 0.75rem;
      cursor: pointer;
    }
    
    .search-result-item:hover {
      background: var(--background);
    }
    
    .selected-user {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      padding: 0.5rem;
      background: var(--background);
      border-radius: var(--radius);
    }
    
    .access-select {
      width: auto;
      padding: 0.375rem 0.5rem;
      font-size: 0.875rem;
    }
    
    .permissions-list {
      margin-top: 1rem;
    }
    
    .permissions-list h4 {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    
    .permission-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: var(--background);
      border-radius: var(--radius);
      margin-bottom: 0.5rem;
    }
    
    .perm-user {
      display: flex;
      flex-direction: column;
    }
    
    .perm-name {
      font-weight: 500;
      font-size: 0.875rem;
    }
    
    .perm-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .access-badge {
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    
    .access-badge.viewer {
      background: #f3f4f6;
      color: #6b7280;
    }
    
    .access-badge.editor {
      background: #dcfce7;
      color: #166534;
    }
  `]
})
export class DocumentDetailComponent implements OnInit {
  document = signal<Document | null>(null);
  versions = signal<Version[]>([]);
  loading = signal(true);
  
  // Edit state
  editing = signal(false);
  saving = signal(false);
  editTitle = '';
  editDescription = '';
  editTags: string[] = [];
  
  // New version upload
  newVersionFile: File | null = null;
  changeLog = '';
  uploadingVersion = signal(false);
  versionProgress = signal(0);
  
  // Permissions
  searchEmail = '';
  searchResults = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  selectedAccess: 'viewer' | 'editor' = 'viewer';
  addingPermission = signal(false);
  
  private searchTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private userService: UserService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDocument(id);
    }
  }

  loadDocument(id: string): void {
    this.loading.set(true);
    
    this.documentService.getDocument(id).subscribe({
      next: (response) => {
        this.document.set(response.document);
        this.versions.set(response.versions);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error('Failed to load document');
        this.router.navigate(['/documents']);
      }
    });
  }

  getDownloadUrl(): string {
    const doc = this.document();
    if (!doc) return '';
    return this.documentService.getDownloadUrl(doc.id || (doc as any)._id);
  }

  downloadFile(): void {
    const doc = this.document();
    if (!doc) return;
    
    this.documentService.downloadDocumentBlob(doc.id || (doc as any)._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.originalFilename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toast.error('Failed to download file')
    });
  }

  previewFile(): void {
    const doc = this.document();
    if (!doc) return;
    
    this.documentService.downloadDocumentBlob(doc.id || (doc as any)._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 60000); // 1 minute cleanup
      },
      error: () => this.toast.error('Failed to preview file')
    });
  }

  getVersionDownloadUrl(versionId: string): string {
    return this.documentService.getVersionDownloadUrl(versionId);
  }

  downloadVersion(version: Version): void {
    this.documentService.downloadVersionBlob(version._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = version.originalFilename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.toast.error('Failed to download version')
    });
  }

  startEditing(): void {
    const doc = this.document();
    if (doc) {
      this.editTitle = doc.title;
      this.editDescription = doc.description;
      this.editTags = [...doc.tags];
      this.editing.set(true);
    }
  }

  cancelEditing(): void {
    this.editing.set(false);
  }

  saveChanges(): void {
    const doc = this.document();
    if (!doc) return;
    
    this.saving.set(true);
    
    this.documentService.updateDocument(doc.id || (doc as any)._id, {
      title: this.editTitle,
      description: this.editDescription,
      tags: this.editTags
    }).subscribe({
      next: (response) => {
        this.document.update(d => d ? {
          ...d,
          title: this.editTitle,
          description: this.editDescription,
          tags: this.editTags
        } : null);
        this.editing.set(false);
        this.saving.set(false);
        this.toast.success('Document updated');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Failed to update document');
      }
    });
  }

  deleteDocument(): void {
    const doc = this.document();
    if (!doc) return;
    
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    this.documentService.deleteDocument(doc.id || (doc as any)._id).subscribe({
      next: () => {
        this.toast.success('Document deleted');
        this.router.navigate(['/documents']);
      },
      error: () => {
        this.toast.error('Failed to delete document');
      }
    });
  }

  // Version upload
  onVersionFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.newVersionFile = input.files[0];
    }
  }

  clearVersionFile(event: Event): void {
    event.stopPropagation();
    this.newVersionFile = null;
  }

  uploadNewVersion(): void {
    const doc = this.document();
    if (!doc || !this.newVersionFile) return;
    
    this.uploadingVersion.set(true);
    this.versionProgress.set(0);
    
    this.documentService.uploadVersion(
      doc.id || (doc as any)._id,
      this.newVersionFile,
      this.changeLog
    ).subscribe({
      next: (progress) => {
        this.versionProgress.set(progress.progress);
        
        if (progress.response) {
          this.toast.success('New version uploaded');
          this.newVersionFile = null;
          this.changeLog = '';
          this.uploadingVersion.set(false);
          // Reload document
          this.loadDocument(doc.id || (doc as any)._id);
        }
      },
      error: () => {
        this.uploadingVersion.set(false);
        this.toast.error('Failed to upload version');
      }
    });
  }

  // Permissions
  searchUsers(): void {
    clearTimeout(this.searchTimeout);
    
    if (!this.searchEmail || this.searchEmail.length < 2) {
      this.searchResults.set([]);
      return;
    }
    
    this.searchTimeout = setTimeout(() => {
      this.userService.searchUsers(this.searchEmail).subscribe({
        next: (response) => {
          // Filter out owner and already added users
          const doc = this.document();
          const ownerId = this.getOwnerId();
          const existingUserIds = doc?.acl.map(p => this.getPermUserId(p)) || [];
          
          this.searchResults.set(
            response.users.filter(u => 
              u.id !== ownerId && !existingUserIds.includes(u.id)
            )
          );
        }
      });
    }, 300);
  }

  selectUser(user: User): void {
    this.selectedUser.set(user);
    this.searchResults.set([]);
    this.searchEmail = '';
  }

  addPermission(): void {
    const doc = this.document();
    const user = this.selectedUser();
    if (!doc || !user) return;
    
    this.addingPermission.set(true);
    
    this.documentService.addPermission(
      doc.id || (doc as any)._id,
      user.id,
      this.selectedAccess
    ).subscribe({
      next: (response) => {
        this.document.update(d => d ? { ...d, acl: response.acl } : null);
        this.selectedUser.set(null);
        this.addingPermission.set(false);
        this.toast.success('Permission added');
      },
      error: () => {
        this.addingPermission.set(false);
        this.toast.error('Failed to add permission');
      }
    });
  }

  removePermission(userId: string): void {
    const doc = this.document();
    if (!doc) return;
    
    this.documentService.removePermission(doc.id || (doc as any)._id, userId).subscribe({
      next: () => {
        this.document.update(d => d ? {
          ...d,
          acl: d.acl.filter(p => this.getPermUserId(p) !== userId)
        } : null);
        this.toast.success('Permission removed');
      },
      error: () => {
        this.toast.error('Failed to remove permission');
      }
    });
  }

  // Helpers
  getOwnerId(): string {
    const owner = this.document()?.ownerId;
    if (typeof owner === 'string') return owner;
    return owner?._id || '';
  }

  getPermUserId(perm: Permission): string {
    if (typeof perm.userId === 'string') return perm.userId;
    return perm.userId._id;
  }

  getPermUserName(perm: Permission): string {
    if (typeof perm.userId === 'string') return 'Unknown';
    return `${perm.userId.firstName} ${perm.userId.lastName}`;
  }

  getPermUserEmail(perm: Permission): string {
    if (typeof perm.userId === 'string') return '';
    return perm.userId.email;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
