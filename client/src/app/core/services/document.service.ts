import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Document, 
  DocumentListResponse, 
  DocumentDetailResponse, 
  UploadResponse,
  Version,
  Permission
} from '../models';

export interface UploadProgress {
  progress: number;
  response?: UploadResponse;
}

export interface DashboardData {
  recentDocuments: Document[];
  stats: {
    totalDocuments: number;
    totalSize: number;
    avgSize: number;
  };
  sizeGroups: { _id: string; count: number; totalSize: number }[];
  typeGroups: { _id: string; count: number; totalSize: number }[];
  topTags: { _id: string; count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  // Get dashboard data (top 5 recent, stats, size groups)
  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`).pipe(
      catchError(() => {
        // Return empty dashboard if unauthorized
        return of({
          recentDocuments: [],
          stats: { totalDocuments: 0, totalSize: 0, avgSize: 0 },
          sizeGroups: [],
          typeGroups: [],
          topTags: []
        } as DashboardData);
      })
    );
  }

  // List/search documents with sorting
  getDocuments(params?: { 
    q?: string; 
    tags?: string; 
    page?: number; 
    limit?: number;
    sortBy?: 'size' | 'createdAt' | 'title' | 'updatedAt';
    order?: 'asc' | 'desc';
  }): Observable<DocumentListResponse> {
    let httpParams = new HttpParams();
    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.tags) httpParams = httpParams.set('tags', params.tags);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params?.order) httpParams = httpParams.set('order', params.order);
    
    return this.http.get<DocumentListResponse>(this.apiUrl, { params: httpParams }).pipe(
      catchError(() => of({ documents: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } } as DocumentListResponse))
    );
  }

  // Get shared documents
  getSharedDocuments(params?: { page?: number; limit?: number }): Observable<DocumentListResponse> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    
    return this.http.get<DocumentListResponse>(`${this.apiUrl}/shared`, { params: httpParams }).pipe(
      catchError(() => of({ documents: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } } as DocumentListResponse))
    );
  }

  // Get document details with versions
  getDocument(id: string): Observable<DocumentDetailResponse> {
    return this.http.get<DocumentDetailResponse>(`${this.apiUrl}/${id}`);
  }

  // Upload new document
  uploadDocument(file: File, title: string, description: string, tags: string[]): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', JSON.stringify(tags));

    return this.http.post<UploadResponse>(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<UploadResponse>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
          return { progress };
        } else if (event.type === HttpEventType.Response) {
          return { progress: 100, response: event.body! };
        }
        return { progress: 0 };
      })
    );
  }

  // Upload multiple documents (max 5)
  uploadMultipleDocuments(files: File[], tags: string[]): Observable<UploadProgress> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('tags', JSON.stringify(tags));

    return this.http.post<any>(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
          return { progress };
        } else if (event.type === HttpEventType.Response) {
          return { progress: 100, response: event.body };
        }
        return { progress: 0 };
      })
    );
  }

  // Update document metadata
  updateDocument(id: string, data: { title?: string; description?: string; tags?: string[] }): Observable<{ message: string; document: Document }> {
    return this.http.put<{ message: string; document: Document }>(`${this.apiUrl}/${id}`, data);
  }

  // Upload new version
  uploadVersion(id: string, file: File, changeLog: string): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('changeLog', changeLog);

    return this.http.post<{ message: string; version: Version }>(`${this.apiUrl}/${id}/version`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
          return { progress };
        } else if (event.type === HttpEventType.Response) {
          return { progress: 100, response: event.body };
        }
        return { progress: 0 };
      })
    );
  }

  // Get document versions
  getVersions(id: string): Observable<{ versions: Version[] }> {
    return this.http.get<{ versions: Version[] }>(`${this.apiUrl}/${id}/versions`);
  }

  // Delete document
  deleteDocument(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Download document (returns blob URL)
  getDownloadUrl(id: string): string {
    return `${this.apiUrl}/${id}/download`;
  }

  // Download document as Blob (for authenticated download)
  downloadDocumentBlob(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }

  // Download specific version
  getVersionDownloadUrl(versionId: string): string {
    return `${environment.apiUrl}/versions/${versionId}/download`;
  }

  // Download version as Blob
  downloadVersionBlob(versionId: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/versions/${versionId}/download`, { responseType: 'blob' });
  }

  // === Permissions ===
  
  getPermissions(id: string): Observable<{ ownerId: string; acl: Permission[] }> {
    return this.http.get<{ ownerId: string; acl: Permission[] }>(`${this.apiUrl}/${id}/permissions`);
  }

  addPermission(id: string, userId: string, access: 'viewer' | 'editor'): Observable<{ message: string; acl: Permission[] }> {
    return this.http.post<{ message: string; acl: Permission[] }>(`${this.apiUrl}/${id}/permissions`, { userId, access });
  }

  removePermission(id: string, userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}/permissions/${userId}`);
  }
}
