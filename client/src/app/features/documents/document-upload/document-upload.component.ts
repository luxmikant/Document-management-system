import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { ToastService } from '../../../shared/services/toast.service';
import { TagInputComponent } from '../../../shared/components/tag-input/tag-input.component';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TagInputComponent],
  template: `
    <div class="container">
      <div class="upload-page">
        <div class="page-header">
          <a routerLink="/documents" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Documents
          </a>
          <h1>Upload Documents</h1>
          <p class="page-subtitle">Upload up to 5 files at once</p>
        </div>
        
        <div class="upload-card card">
          <div class="card-body">
            <form (ngSubmit)="onSubmit()" #uploadForm="ngForm">
              <!-- File Drop Zone -->
              <div 
                class="drop-zone"
                [class.drag-over]="isDragOver"
                [class.has-files]="selectedFiles.length > 0"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
                (click)="fileInput.click()"
              >
                <input
                  type="file"
                  #fileInput
                  hidden
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.txt"
                  (change)="onFileSelected($event)"
                />
                
                @if (selectedFiles.length === 0) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p class="drop-text">
                    <strong>Click to upload</strong> or drag and drop
                  </p>
                  <p class="drop-hint">PDF, PNG, JPG, DOCX, TXT (max 10MB each, up to 5 files)</p>
                } @else {
                  <div class="selected-files-header">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                    <span>{{ selectedFiles.length }} file(s) selected</span>
                    <button type="button" class="btn btn-outline btn-sm" (click)="clearFiles($event)">
                      Clear All
                    </button>
                  </div>
                }
              </div>
              
              <!-- Selected Files List -->
              @if (selectedFiles.length > 0) {
                <div class="selected-files-list">
                  @for (file of selectedFiles; track file.name; let i = $index) {
                    <div class="selected-file-item">
                      <div class="file-icon">
                        @if (file.type.includes('pdf')) {
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>
                        } @else if (file.type.includes('image')) {
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                        } @else {
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>
                        }
                      </div>
                      <div class="file-info">
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                      </div>
                      <button type="button" class="btn-remove" (click)="removeFile(i, $event)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              }
              
              <!-- Upload Progress -->
              @if (uploading()) {
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="uploadProgress()"></div>
                  </div>
                  <span class="progress-text">{{ uploadProgress() }}%</span>
                </div>
              }
              
              <!-- Common Tags for all files -->
              <div class="form-group">
                <label class="form-label">Tags (applied to all files)</label>
                <app-tag-input
                  [(ngModel)]="tags"
                  name="tags"
                  placeholder="Add tags and press Enter"
                ></app-tag-input>
              </div>
              
              @if (error()) {
                <div class="alert alert-error">
                  {{ error() }}
                  <button type="button" class="btn btn-sm btn-outline" (click)="retryUpload()">
                    Retry
                  </button>
                </div>
              }
              
              <div class="form-actions">
                <a routerLink="/documents" class="btn btn-outline">Cancel</a>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  [disabled]="selectedFiles.length === 0 || uploading()"
                >
                  @if (uploading()) {
                    <span class="spinner"></span>
                    Uploading...
                  } @else {
                    Upload {{ selectedFiles.length }} File(s)
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-page {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .page-header {
      margin-bottom: 1.5rem;
    }
    
    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }
    
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }
    
    .back-link:hover {
      color: var(--primary);
      text-decoration: none;
    }
    
    .page-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
    }
    
    .drop-zone {
      border: 2px dashed var(--border);
      border-radius: var(--radius-lg);
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 1.5rem;
      background: var(--background);
    }
    
    .drop-zone:hover {
      border-color: var(--primary);
      background: rgba(59, 130, 246, 0.05);
    }
    
    .drop-zone.drag-over {
      border-color: var(--primary);
      background: rgba(59, 130, 246, 0.1);
    }
    
    .drop-zone.has-files {
      border-style: solid;
      border-color: var(--success);
      background: rgba(34, 197, 94, 0.05);
    }
    
    .drop-text {
      margin: 0.75rem 0 0.25rem;
    }
    
    .drop-hint {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    
    .selected-files-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }
    
    .selected-files-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      max-height: 250px;
      overflow-y: auto;
    }
    
    .selected-file-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bg-secondary);
      border-radius: 8px;
    }
    
    .file-icon {
      flex-shrink: 0;
    }
    
    .file-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    
    .file-name {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .file-size {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    
    .btn-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s, color 0.2s;
    }
    
    .btn-remove:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
    
    .progress-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .progress-bar {
      flex: 1;
      height: 8px;
      background: var(--border);
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: var(--primary);
      transition: width 0.3s;
    }
    
    .progress-text {
      font-size: 0.875rem;
      font-weight: 500;
      min-width: 45px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    
    textarea.form-input {
      resize: vertical;
      min-height: 80px;
    }
  `]
})
export class DocumentUploadComponent {
  selectedFiles: File[] = [];
  tags: string[] = [];
  
  isDragOver = false;
  uploading = signal(false);
  uploadProgress = signal(0);
  error = signal('');
  
  private readonly MAX_FILES = 5;
  private readonly MAX_SIZE = 10 * 1024 * 1024; // 10MB

  constructor(
    private documentService: DocumentService,
    private router: Router,
    private toast: ToastService
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
    }
    // Reset input so same files can be selected again
    input.value = '';
  }

  handleFiles(files: File[]): void {
    this.error.set('');
    
    // Check max files limit
    const remainingSlots = this.MAX_FILES - this.selectedFiles.length;
    if (files.length > remainingSlots) {
      this.error.set(`You can only upload up to ${this.MAX_FILES} files at once. ${remainingSlots} slot(s) remaining.`);
      files = files.slice(0, remainingSlots);
    }
    
    for (const file of files) {
      // Check file size
      if (file.size > this.MAX_SIZE) {
        this.error.set(`"${file.name}" exceeds 10MB limit and was skipped.`);
        continue;
      }
      
      // Check for duplicates
      if (this.selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        continue;
      }
      
      this.selectedFiles.push(file);
    }
  }

  removeFile(index: number, event: Event): void {
    event.stopPropagation();
    this.selectedFiles.splice(index, 1);
  }

  clearFiles(event: Event): void {
    event.stopPropagation();
    this.selectedFiles = [];
    this.error.set('');
  }

  onSubmit(): void {
    if (this.selectedFiles.length === 0) return;
    
    this.uploading.set(true);
    this.uploadProgress.set(0);
    this.error.set('');
    
    this.documentService.uploadMultipleDocuments(
      this.selectedFiles,
      this.tags
    ).subscribe({
      next: (progress) => {
        this.uploadProgress.set(progress.progress);
        
        if (progress.response) {
          const count = (progress.response as any).documents?.length || this.selectedFiles.length;
          this.toast.success(`${count} document(s) uploaded successfully!`);
          this.router.navigate(['/documents']);
        }
      },
      error: (err) => {
        this.error.set(err.message || 'Upload failed. Please try again.');
        this.uploading.set(false);
      }
    });
  }

  retryUpload(): void {
    this.error.set('');
    this.onSubmit();
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
