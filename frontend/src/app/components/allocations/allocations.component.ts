import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AllocationService, Allocation, AllocationRequest } from '../../services/allocation.service';
import { EmployeeService, Employee } from '../../services/employee.service';
import { ProjectService, Project } from '../../services/project.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-allocations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="allocations-container" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h1 class="glow-text-blue" style="font-weight: 600;">Quản Lý Phân Bổ Nhân Lực</h1>
        <button class="glass-btn" (click)="openAddModal()">➕ Tạo Phân Bổ Mới</button>
      </div>

      <!-- Advanced Search Panel -->
      <div class="glass-panel filter-bar" style="margin-bottom: 8px; padding: 10px 16px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
        <div style="flex: 1.5; min-width: 180px;">
          <label class="form-label">Tên Nhân Sự</label>
          <input type="text" class="glass-input" placeholder="Tìm theo tên nhân sự..." [(ngModel)]="filters.employeeName" (keyup.enter)="search()" />
        </div>
        <div style="flex: 1.5; min-width: 180px;">
          <label class="form-label">Tên Dự Án</label>
          <input type="text" class="glass-input" placeholder="Tìm theo tên dự án..." [(ngModel)]="filters.projectName" (keyup.enter)="search()" />
        </div>
        <div style="flex: 1.2; min-width: 150px;">
          <label class="form-label">Vai Trò trong Dự Án</label>
          <select class="glass-input glass-select" [(ngModel)]="filters.roleInProject">
            <option value="ALL">Tất cả vai trò</option>
            <option *ngFor="let role of availableRoles" [value]="role">{{ role }}</option>
          </select>
        </div>
        <!-- Ô lọc tỷ lệ phần trăm phân bổ (mặc định là 10, tăng giảm 10) -->
        <div style="flex: 0.8; min-width: 100px;">
          <label class="form-label">Tỷ Lệ Phân Bổ (%)</label>
          <input type="number" class="glass-input" placeholder="10" [(ngModel)]="filters.allocationPercent" min="0" max="100" step="10" (keyup.enter)="search()" />
        </div>
        <div style="margin-top: 22px; display: flex; gap: 8px;">
          <button class="glass-btn" style="padding: 10px 16px; font-weight: 500;" (click)="search()">🔍 Tìm Kiếm</button>
          <button class="glass-btn glass-btn-secondary" style="padding: 10px 16px; font-weight: 500;" (click)="clearFilters()">Clear</button>
        </div>
      </div>

      <div class="glass-panel" style="flex: 1; overflow-y: auto; overflow-x: auto; padding: 0; min-height: 0;">
        <table class="glass-table">
          <thead>
            <tr>
              <th (click)="toggleSort('employee.fullName')" class="sortable-header">
                Nhân Sự
                <span class="sort-icon">{{ getSortIcon('employee.fullName') }}</span>
              </th>
              <th (click)="toggleSort('project.projectName')" class="sortable-header">
                Dự Án
                <span class="sort-icon">{{ getSortIcon('project.projectName') }}</span>
              </th>
              <th>Vai Trò Trong Dự Án</th>
              <th (click)="toggleSort('allocationPercent')" class="sortable-header">
                Phần Trăm (%)
                <span class="sort-icon">{{ getSortIcon('allocationPercent') }}</span>
              </th>
              <th (click)="toggleSort('startDate')" class="sortable-header">
                Thời Gian Phân Bổ
                <span class="sort-icon">{{ getSortIcon('startDate') }}</span>
              </th>
              <th style="width: 120px; text-align: center;">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let alloc of allocations; let idx = index">
              <!-- Cột Nhân sự gộp dòng -->
              <td *ngIf="rowSpans[idx] > 0" [attr.rowspan]="rowSpans[idx]" class="merged-employee-cell">
                <div style="font-weight: 500; color: #ffffff;">{{ alloc.employee?.fullName }}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">{{ alloc.employee?.role }}</div>
              </td>
              <td>
                <div style="font-weight: 500;">{{ alloc.project?.projectName }}</div>
                <div style="font-size: 12px; color: var(--accent-blue);">{{ alloc.project?.projectCode }}</div>
              </td>
              <td>
                <span class="role-badge">{{ alloc.roleInProject }}</span>
              </td>
              <td>
                <span class="percent-badge" [ngClass]="{
                  'percent-safe': alloc.allocationPercent < 50,
                  'percent-warning': alloc.allocationPercent >= 50 && alloc.allocationPercent < 80,
                  'percent-danger': alloc.allocationPercent >= 80
                }">{{ alloc.allocationPercent }}%</span>
              </td>
              <td>
                <div style="font-size: 14px;">{{ alloc.startDate }}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">đến {{ alloc.endDate || 'Chưa xác định' }}</div>
              </td>
              <td>
                <div style="display: flex; gap: 8px; justify-content: center;">
                  <button class="action-btn edit-btn" (click)="openEditModal(alloc)">✏️</button>
                  <button class="action-btn delete-btn" (click)="deleteAllocation(alloc.allocationId!)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="allocations.length === 0">
              <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                Không tìm thấy bản ghi phân bổ nào phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div class="pagination-container" *ngIf="totalElements > 0" style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
        <span style="font-size: 14px; color: var(--text-secondary);">
          {{ getRangeText() }}
        </span>
        <div class="pagination-buttons" style="display: flex; gap: 8px;">
          <button class="glass-btn glass-btn-secondary pagination-btn" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">« Trước</button>
          <button class="glass-btn pagination-btn" *ngFor="let p of pageNumbers" [class.glass-btn-secondary]="p !== currentPage" (click)="goToPage(p)">{{ p }}</button>
          <button class="glass-btn glass-btn-secondary pagination-btn" [disabled]="currentPage === totalPages || totalPages === 0" (click)="goToPage(currentPage + 1)">Sau »</button>
        </div>
      </div>

      <!-- Add/Edit Allocation Modal -->
      <div class="modal-overlay" *ngIf="isModalOpen">
        <div class="glass-panel modal-content">
          <h3 style="margin-bottom: 20px; font-weight: 600; text-align: center;">
            {{ isEditMode ? 'Cập Nhật Phân Bổ' : 'Tạo Phân Bổ Nhân Lực Mới' }}
          </h3>
          
          <div *ngIf="errorMessage" class="error-banner">{{ errorMessage }}</div>

          <form (ngSubmit)="saveAllocation()">
            <!-- Employee Dropdown (Disabled in Edit Mode) -->
            <div style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 500;">Nhân Sự *</label>
              <select class="glass-input glass-select" name="employeeId" [(ngModel)]="requestPayload.employeeId" [disabled]="isEditMode" required>
                <option value="0" disabled>-- Chọn nhân sự --</option>
                <option *ngFor="let emp of employees" [value]="emp.employeeId">
                  {{ emp.fullName }} ({{ emp.role }})
                </option>
              </select>
            </div>

            <!-- Project Dropdown (Disabled in Edit Mode) -->
            <div style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 500;">Dự Án *</label>
              <select class="glass-input glass-select" name="projectId" [(ngModel)]="requestPayload.projectId" [disabled]="isEditMode" required>
                <option value="0" disabled>-- Chọn dự án --</option>
                <option *ngFor="let proj of projects" [value]="proj.projectId" [disabled]="proj.status === 'COMPLETED'">
                  {{ proj.projectName }} ({{ proj.status === 'COMPLETED' ? 'ĐÃ HOÀN THÀNH - KHÔNG THỂ CHỌN' : proj.status }})
                </option>
              </select>
            </div>

            <!-- Allocation Percent -->
            <div style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 500;">Tỷ Lệ Phân Bổ (%) *</label>
              <input type="number" class="glass-input" name="allocationPercent" [(ngModel)]="requestPayload.allocationPercent" min="1" max="100" placeholder="1 đến 100" required />
            </div>

            <!-- Role in Project -->
            <div style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 500;">Vai Trò trong Dự Án *</label>
              <input type="text" class="glass-input" name="roleInProject" [(ngModel)]="requestPayload.roleInProject" placeholder="Ví dụ: Backend Developer, QA Lead" required />
            </div>

            <!-- Dates -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
              <div>
                <label class="form-label" style="font-weight: 500;">Ngày Bắt Đầu *</label>
                <input type="date" class="glass-input" name="startDate" [(ngModel)]="requestPayload.startDate" required />
              </div>
              <div>
                <label class="form-label" style="font-weight: 500;">Ngày Kết Thúc</label>
                <input type="date" class="glass-input" name="endDate" [(ngModel)]="requestPayload.endDate" />
              </div>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button type="button" class="glass-btn glass-btn-secondary" (click)="closeModal()">Hủy</button>
              <button type="submit" class="glass-btn">{{ isEditMode ? 'Cập Nhật' : 'Tạo Mới' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .role-badge {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 13px;
    }
    .percent-badge {
      font-weight: 600;
      font-size: 14px;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .percent-safe {
      color: var(--success);
      background: rgba(16, 185, 129, 0.08);
    }
    .percent-warning {
      color: var(--warning);
      background: rgba(245, 158, 11, 0.08);
    }
    .percent-danger {
      color: var(--danger);
      background: rgba(239, 68, 68, 0.08);
    }

    .sortable-header {
      cursor: pointer;
      user-select: none;
      transition: color var(--transition-smooth);
    }
    .sortable-header:hover {
      color: #ffffff;
    }
    .sort-icon {
      font-size: 11px;
      margin-left: 4px;
      color: var(--accent-blue);
    }

    .action-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-smooth);
    }
    .action-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }
    .edit-btn:hover {
      border-color: var(--accent-blue);
    }
    .delete-btn:hover {
      border-color: var(--danger);
    }
    .merged-employee-cell {
      background: rgba(255, 255, 255, 0.01) !important;
      border-right: 1px solid rgba(255, 255, 255, 0.04) !important;
      vertical-align: middle !important;
      text-align: left !important;
    }
    .pagination-btn {
      padding: 8px 16px !important;
      font-size: 14px !important;
    }
    
    /* Modal Overlay */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      width: 100%;
      max-width: 480px;
      animation: modalSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .form-label {
      display: block;
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }
    .error-banner {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: var(--danger);
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 16px;
      text-align: center;
    }
    @keyframes modalSlide {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class AllocationsComponent implements OnInit {
  allocations: Allocation[] = [];
  employees: Employee[] = [];
  projects: Project[] = [];
  rowSpans: number[] = [];
  
  isModalOpen = false;
  isEditMode = false;
  errorMessage = '';
  editingAllocationId: number | null = null;

  // Pagination states
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pageNumbers: number[] = [];

  // Sorting states
  currentSortBy = 'employee.fullName';
  currentSortDir = 'asc';

  // Advanced Filters
  filters = {
    employeeName: '',
    projectName: '',
    roleInProject: 'ALL',
    allocationPercent: null as any
  };

  availableRoles = [
    'Backend Developer', 'Frontend Developer', 'Fullstack Developer', 'Java Developer', 'Angular Developer',
    'QA Engineer', 'QA Tester', 'QA Lead', 'Automation Tester', 'Project Manager', 'Project Lead',
    'Business Analyst', 'Senior BA', 'DevOps Engineer', 'DevOps Support', 'UI/UX Designer',
    'Data Scientist', 'Security Specialist', 'Solution Architect', 'Scrum Master', 'Agile Coach'
  ];

  requestPayload: AllocationRequest = {
    employeeId: 0,
    projectId: 0,
    allocationPercent: 50,
    roleInProject: '',
    startDate: '',
    endDate: ''
  };

  constructor(
    private allocationService: AllocationService,
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      allocsPage: this.allocationService.getAllocations(this.currentPage - 1, this.pageSize, this.filters, this.currentSortBy, this.currentSortDir),
      empsPage: this.employeeService.getEmployees(0, 1000, {}),
      projsPage: this.projectService.getProjects(0, 1000, {})
    }).subscribe({
      next: (res: any) => {
        this.allocations = res.allocsPage.content || [];
        this.totalElements = res.allocsPage.totalElements || 0;
        this.totalPages = res.allocsPage.totalPages || 0;

        this.employees = res.empsPage.content || [];
        this.projects = res.projsPage.content || [];

        this.calculateRowSpans();
        this.generatePageNumbers();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Lỗi khi tải dữ liệu phân bổ', err);
      }
    });
  }

  calculateRowSpans(): void {
    this.rowSpans = [];
    let i = 0;
    while (i < this.allocations.length) {
      let span = 1;
      const currentEmpId = this.allocations[i].employee?.employeeId;
      while (i + span < this.allocations.length && this.allocations[i + span].employee?.employeeId === currentEmpId) {
        span++;
      }
      this.rowSpans[i] = span;
      for (let j = 1; j < span; j++) {
        this.rowSpans[i + j] = 0;
      }
      i += span;
    }
  }

  generatePageNumbers(): void {
    this.pageNumbers = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pageNumbers.push(i);
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadData();
  }

  toggleSort(column: string): void {
    if (this.currentSortBy === column) {
      this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortBy = column;
      this.currentSortDir = 'asc';
    }
    this.currentPage = 1;
    this.loadData();
  }

  getSortIcon(column: string): string {
    if (this.currentSortBy !== column) return '';
    return this.currentSortDir === 'asc' ? ' ▲' : ' ▼';
  }

  search(): void {
    this.currentPage = 1;
    this.loadData();
  }

  clearFilters(): void {
    this.filters = {
      employeeName: '',
      projectName: '',
      roleInProject: 'ALL',
      allocationPercent: null as any
    };
    this.currentSortBy = 'employee.fullName';
    this.currentSortDir = 'asc';
    this.search();
  }

  getRangeText(): string {
    if (this.totalElements === 0) return 'Hiển thị 0 bản ghi';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = this.currentPage * this.pageSize > this.totalElements ? this.totalElements : this.currentPage * this.pageSize;
    return `Hiển thị từ ${start} đến ${end} trên tổng số ${this.totalElements} bản ghi`;
  }

  openAddModal(): void {
    this.isModalOpen = true;
    this.isEditMode = false;
    this.errorMessage = '';
    this.editingAllocationId = null;
    const today = new Date().toISOString().substring(0, 10);
    this.requestPayload = {
      employeeId: 0,
      projectId: 0,
      allocationPercent: 50,
      roleInProject: '',
      startDate: today,
      endDate: ''
    };
    this.cdr.detectChanges();
  }

  openEditModal(alloc: Allocation): void {
    this.isModalOpen = true;
    this.isEditMode = true;
    this.errorMessage = '';
    this.editingAllocationId = alloc.allocationId!;
    this.requestPayload = {
      employeeId: alloc.employee?.employeeId || 0,
      projectId: alloc.project?.projectId || 0,
      allocationPercent: alloc.allocationPercent,
      roleInProject: alloc.roleInProject,
      startDate: alloc.startDate,
      endDate: alloc.endDate || ''
    };
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.cdr.detectChanges();
  }

  saveAllocation(): void {
    if (this.requestPayload.employeeId === 0 || this.requestPayload.projectId === 0 || !this.requestPayload.roleInProject || !this.requestPayload.startDate) {
      this.errorMessage = 'Vui lòng điền đầy đủ các thông tin bắt buộc.';
      this.cdr.detectChanges();
      return;
    }

    if (this.requestPayload.allocationPercent < 1 || this.requestPayload.allocationPercent > 100) {
      this.errorMessage = 'Phần trăm phân bổ phải nằm trong khoảng từ 1% đến 100%.';
      this.cdr.detectChanges();
      return;
    }

    if (this.requestPayload.endDate && this.requestPayload.startDate > this.requestPayload.endDate) {
      this.errorMessage = 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu.';
      this.cdr.detectChanges();
      return;
    }

    if (this.isEditMode && this.editingAllocationId) {
      this.allocationService.updateAllocation(this.editingAllocationId, this.requestPayload).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Lỗi khi cập nhật phân bổ.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.allocationService.createAllocation(this.requestPayload).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Lỗi khi tạo phân bổ.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteAllocation(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa bản ghi phân bổ này?')) {
      this.allocationService.deleteAllocation(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err: any) => {
          alert(err.error?.message || 'Lỗi khi xóa phân bổ.');
          this.cdr.detectChanges();
        }
      });
    }
  }
}
