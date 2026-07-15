import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  projectId?: number;
  projectCode: string;
  projectName: string;
  customer?: string;
  startDate: string;
  endDate?: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:8080/projects';

  constructor(private http: HttpClient) {}

  getProjects(page: number = 0, size: number = 10, filters: any = {}, sortBy: string = 'projectName', sortDir: string = 'asc'): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    if (filters.projectCode) url += `&projectCode=${encodeURIComponent(filters.projectCode)}`;
    if (filters.projectName) url += `&projectName=${encodeURIComponent(filters.projectName)}`;
    if (filters.customer) url += `&customer=${encodeURIComponent(filters.customer)}`;
    if (filters.status && filters.status !== 'ALL') url += `&status=${encodeURIComponent(filters.status)}`;
    return this.http.get<any>(url);
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
