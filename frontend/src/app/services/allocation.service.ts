import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from './employee.service';
import { Project } from './project.service';

export interface Allocation {
  allocationId?: number;
  employee?: Employee;
  project?: Project;
  allocationPercent: number;
  roleInProject: string;
  startDate: string;
  endDate?: string;
  createdAt?: string;
}

export interface AllocationRequest {
  employeeId: number;
  projectId: number;
  allocationPercent: number;
  roleInProject: string;
  startDate: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AllocationService {
  private apiUrl = 'http://localhost:8080/allocations';

  constructor(private http: HttpClient) {}

  getAllocations(page: number = 0, size: number = 10, filters: any = {}, sortBy: string = 'employee.fullName', sortDir: string = 'asc'): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    if (filters.employeeName) url += `&employeeName=${encodeURIComponent(filters.employeeName)}`;
    if (filters.projectName) url += `&projectName=${encodeURIComponent(filters.projectName)}`;
    if (filters.roleInProject && filters.roleInProject !== 'ALL') url += `&roleInProject=${encodeURIComponent(filters.roleInProject)}`;
    if (filters.allocationPercent !== undefined && filters.allocationPercent !== null && filters.allocationPercent !== '') {
      url += `&allocationPercent=${filters.allocationPercent}`;
    }
    return this.http.get<any>(url);
  }

  createAllocation(request: AllocationRequest): Observable<Allocation> {
    return this.http.post<Allocation>(this.apiUrl, request);
  }

  updateAllocation(id: number, request: AllocationRequest): Observable<Allocation> {
    return this.http.put<Allocation>(`${this.apiUrl}/${id}`, request);
  }

  deleteAllocation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
