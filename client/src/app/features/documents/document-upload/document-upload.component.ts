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
          <h1>Upload Document</h1>
        </div>
        
        <div class="upload-card card">
          <div class="card-body">
            <form (ngSubmit)="onSubmit()" #uploadForm="ngForm">
              <!-- File Drop Zone -->
              <div 
                class="drop-zone"
                [class.drag-over]="isDragOver"
                [class.has-file]="selectedFile"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
                (click)="fileInput.click()"
              >
                <input
                  type="file"
                  #fileInput
                  hidden
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx"
                  (change)="onFileSelected($event)"
                />
                
                @if (!selectedFile) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p class="drop-text">
                    <strong>Click to upload</strong> or drag and drop
                  </p>
                  <p class="drop-hint">PDF, PNG, JPG, DOCX (max 10MB)</p>
                } @else {
                  <div class="selected-file">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                    <div class="file-info">
                      <p class="file-name">{{ selectedFile.name }}</p>
                      <p class="file-size text-secondary">{{ formatFileSize(selectedFile.size) }}</p>
                    </div>
                    <button type="button" class="btn btn-outline btn-sm" (click)="clearFile($event)">
                      Change
                    </button>
                  </div>
                }
              </div>
              
              <!-- Upload Progress -->
              @if (uploading()) {
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="uploadProgress()"></div>
                  </div>
                  <span class="progress-text">{{ uploadProgress() }}%</span>
                </div>
              }
              
              <!-- Document Details -->
              <div class="form-group">
                <label class="form-label" for="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  class="form-input"
                  [(ngModel)]="title"
                  required
                  placeholder="Enter document title"
                  [disabled]="uploading()"
                />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="description">Description (optional)</label>
                <textarea
                  id="description"
                  name="description"
                  class="form-input"
                  [(ngModel)]="description"
                  rows="3"
                  placeholder="Add a description..."
                  [disabled]="uploading()"
                ></textarea>
              </div>
              
              <div class="form-group">
                <label class="form-label">Tags</label>
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
                  [disabled]="!selectedFile || !title || uploading()"
                >
                  @if (uploading()) {
                    <span class="spinner"></span>
                    Uploading...
                  } @else {
                    Upload Document
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
    
    .drop-zone.has-file {
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
    
    .selected-file {
      display: flex;
      align-items: center;
      gap: 1rem;
      text-align: left;
    }
    
    .file-info {
      flex: 1;
    }
    
    .file-name {
      font-weight: 500;
      word-break: break-all;
    }
    
    .file-size {
      font-size: 0.75rem;
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
  selectedFile: File | null = null;
  title = '';
  description = '';
  tags: string[] = [];
  
  isDragOver = false;
  uploading = signal(false);
  uploadProgress = signal(0);
  error = signal('');

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
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.error.set('File size exceeds 10MB limit');
      return;
    }
    
    this.selectedFile = file;
    this.error.set('');
    
    // Auto-fill title from filename if empty
    if (!this.title) {
      this.title = file.name.replace(/\.[^/.]+$/, '');
    }
  }

  clearFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
  }

  onSubmit(): void {
    if (!this.selectedFile || !this.title) return;
    
    this.uploading.set(true);
    this.uploadProgress.set(0);
    this.error.set('');
    
    this.documentService.uploadDocument(
      this.selectedFile,
      this.title,
      this.description,
      this.tags
    ).subscribe({
      next: (progress) => {
        this.uploadProgress.set(progress.progress);
        
        if (progress.response) {
          this.toast.success('Document uploaded successfully!');
          this.router.navigate(['/documents', progress.response.document.id]);
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
