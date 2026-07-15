import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UtilizationReport {
  employeeId: number;
  fullName: string;
  totalAllocation: number;
}

export interface AvailableResourceReport {
  employeeId: number;
  fullName: string;
  role: string;
  availablePercent: number;
}

export interface OverloadedResourceReport {
  employeeId: number;
  fullName: string;
  totalAllocation: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8080/reports';

  constructor(private http: HttpClient) {}

  getUtilizationReport(): Observable<UtilizationReport[]> {
    return this.http.get<UtilizationReport[]>(`${this.apiUrl}/utilization`);
  }

  getAvailableReport(): Observable<AvailableResourceReport[]> {
    return this.http.get<AvailableResourceReport[]>(`${this.apiUrl}/available`);
  }

  getOverloadedReport(): Observable<OverloadedResourceReport[]> {
    return this.http.get<OverloadedResourceReport[]>(`${this.apiUrl}/overloaded`);
  }

  getIdleEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/idle-employees`);
  }

  getProjectMemberCounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/project-members`);
  }
}
