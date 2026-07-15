import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee } from '../../services/employee.service';
import { ReportService } from '../../services/report.service';
import { forkJoin } from 'rxjs';

interface EmployeeWithWorkload extends Employee {
  totalAllocation: number;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="employees-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h1 class="glow-text-blue" style="font-weight: 600;">Quản Lý Nhân Sự</h1>
        <button class="glass-btn" (click)="openAddModal()">➕ Thêm Nhân Viên</button>
      </div>

      <!-- Advanced Search Panel -->
      <div class="glass-panel filter-bar" style="margin-bottom: 24px; padding: 16px 20px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
        <div style="flex: 1; min-width: 120px;">
          <label class="form-label">Mã NV</label>
          <input type="text" class="glass-input" placeholder="Mã NV..." [(ngModel)]="filters.employeeCode" (keyup.enter)="search()" />
        </div>
        <div style="flex: 1.5; min-width: 180px;">
          <label class="form-label">Họ Tên</label>
          <input type="text" class="glass-input" placeholder="Tìm theo tên..." [(ngModel)]="filters.fullName" (keyup.enter)="search()" />
        </div>
        <div style="flex: 1.5; min-width: 180px;">
          <label class="form-label">Email</label>
          <input type="text" class="glass-input" placeholder="Tìm theo email..." [(ngModel)]="filters.email" (keyup.enter)="search()" />
        </div>
        <div style="flex: 1.2; min-width: 150px;">
          <label class="form-label">Vai Trò</label>
          <select class="glass-input glass-select" [(ngModel)]="filters.role">
            <option value="ALL">Tất cả vai trò</option>
            <option *ngFor="let role of availableRoles" [value]="role">{{ role }}</option>
          </select>
        </div>
        <div style="flex: 1.2; min-width: 150px;">
          <label class="form-label">Phòng Ban</label>
          <select class="glass-input glass-select" [(ngModel)]="filters.department">
            <option value="ALL">Tất cả phòng ban</option>
            <option *ngFor="let dept of availableDepartments" [value]="dept">{{ dept }}</option>
          </select>
        </div>
        <div style="margin-top: 22px; display: flex; gap: 8px;">
          <button class="glass-btn" style="padding: 10px 16px; font-weight: 500;" (click)="search()">🔍 Tìm Kiếm</button>
          <button class="glass-btn glass-btn-secondary" style="padding: 10px 16px; font-weight: 500;" (click)="clearFilters()">Clear</button>
        </div>
      </div>

      <!-- Employees Grid/Table -->
      <div class="glass-panel" style="overflow-x: auto; padding: 0;">
        <table class="glass-table">
          <thead>
            <tr>
              <th (click)="toggleSort('employeeCode')" class="sortable-header">
                Mã NV
                <span class="sort-icon">{{ getSortIcon('employeeCode') }}</span>
              </th>
              <th (click)="toggleSort('fullName')" class="sortable-header">
                Họ và Tên
                <span class="sort-icon">{{ getSortIcon('fullName') }}</span>
              </th>
              <th>Email</th>
              <th>Vai Trò</th>
              <th (click)="toggleSort('department')" class="sortable-header">
                Phòng Ban
                <span class="sort-icon">{{ getSortIcon('department') }}</span>
              </th>
              <th (click)="toggleSort('workload')" class="sortable-header" style="width: 200px;">
                Tỷ Lệ Phân Bổ (Workload)
                <span class="sort-icon">{{ getSortIcon('workload') }}</span>
              </th>
              <th style="width: 120px; text-align: center;">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let emp of employees">
              <td><code style="color: var(--accent-blue);">{{ emp.employeeCode }}</code></td>
              <td style="font-weight: 500;">{{ emp.fullName }}</td>
              <td style="color: var(--text-secondary);">{{ emp.email }}</td>
              <td>
                <span class="role-badge">{{ emp.role }}</span>
              </td>
              <td>{{ emp.department }}</td>
              <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div class="progress-bar-container" style="flex: 1;">
                    <div class="progress-bar-fill"
                         [style.width.%]="emp.totalAllocation"
                         [ngClass]="{
                           'progress-safe': emp.totalAllocation < 70,
                           'progress-warning': emp.totalAllocation >= 70 && emp.totalAllocation <= 90,
                           'progress-danger': emp.totalAllocation > 90
                         }">
                    </div>
                  </div>
                  <span style="font-size: 13px; font-weight: 600; min-width: 32px;"
                        [ngClass]="{
                          'text-safe': emp.totalAllocation < 70,
                          'text-warning': emp.totalAllocation >= 70 && emp.totalAllocation <= 90,
                          'text-danger': emp.totalAllocation > 90
                        }">{{ emp.totalAllocation }}%</span>
                </div>
              </td>
              <td>
                <div style="display: flex; gap: 8px; justify-content: center;">
                  <button class="action-btn edit-btn" (click)="openEditModal(emp)">✏️</button>
                  <button class="action-btn delete-btn" (click)="deleteEmployee(emp.employeeId!)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="employees.length === 0">
              <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                Không tìm thấy nhân viên nào phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div class="pagination-container" *ngIf="totalElements > 0" style="margin-top: 24px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 14px; color: var(--text-secondary);">
          {{ getRangeText() }}
        </span>
        <div class="pagination-buttons" style="display: flex; gap: 8px;">
          <button class="glass-btn glass-btn-secondary pagination-btn" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">« Trước</button>
          <button class="glass-btn pagination-btn" *ngFor="let p of pageNumbers" [class.glass-btn-secondary]="p !== currentPage" (click)="goToPage(p)">{{ p }}</button>
          <button class="glass-btn glass-btn-secondary pagination-btn" [disabled]="currentPage === totalPages || totalPages === 0" (click)="goToPage(currentPage + 1)">Sau »</button>
        </div>
      </div>

      <!-- Add/Edit Employee Modal (Glassmorphism Overlay) -->
      <div class="modal-overlay" *ngIf="isModalOpen">
        <div class="glass-panel modal-content">
          <h3 style="margin-bottom: 20px; font-weight: 600; text-align: center;">
            {{ isEditMode ? 'Cập Nhật Thông Tin Nhân Sự' : 'Thêm Nhân Sự Mới' }}
          </h3>
          
          <div *ngIf="errorMessage" class="error-banner">{{ errorMessage }}</div>

          <form (ngSubmit)="saveEmployee()">
            <div style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 500;">Mã Nhân Viên *</label>
              <input type="text" class="glass-input" name="employeeCode" [(ngModel)]="newEmployee.employeeCode" placeholder="Ví dụ: EMP012" required />
            </div>

            <div style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 500;">Họ và Tên *</label>
              <input type="text" class="glass-input" name="fullName" [(ngModel)]="newEmployee.fullName" placeholder="Ví dụ: Nguyen Van A" required />
            </div>

            <div style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 500;">Email *</label>
              <input type="email" class="glass-input" name="email" [(ngModel)]="newEmployee.email" placeholder="example@company.com" required />
            </div>

            <div style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 500;">Vai Trò (Chuyên môn) *</label>
              <input type="text" class="glass-input" name="role" [(ngModel)]="newEmployee.role" placeholder="Ví dụ: Developer, QA Engineer" required />
            </div>

            <div style="margin-bottom: 24px;">
              <label class="form-label" style="font-weight: 500;">Phòng Ban *</label>
              <input type="text" class="glass-input" name="department" [(ngModel)]="newEmployee.department" placeholder="Ví dụ: FSOFT-Q1" required />
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button type="button" class="glass-btn glass-btn-secondary" (click)="closeModal()">Hủy</button>
              <button type="submit" class="glass-btn">{{ isEditMode ? 'Lưu Thay Đổi' : 'Thêm Mới' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .role-badge {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 13px;
      color: var(--text-primary);
    }
    .text-safe { color: var(--success); }
    .text-warning { color: var(--warning); }
    .text-danger { color: var(--danger); }
    
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

    /* Modal Styles */
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
    .pagination-btn {
      padding: 8px 16px !important;
      font-size: 14px !important;
    }
    @keyframes modalSlide {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class EmployeesComponent implements OnInit {
  employees: EmployeeWithWorkload[] = [];
  isModalOpen = false;
  isEditMode = false;
  errorMessage = '';
  editingEmployeeId: number | null = null;

  // Pagination states
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pageNumbers: number[] = [];

  // Sorting states
  currentSortBy = 'fullName';
  currentSortDir = 'asc';

  // Advanced Filters
  filters = {
    employeeCode: '',
    fullName: '',
    email: '',
    role: 'ALL',
    department: 'ALL'
  };

  availableRoles = [
    'Developer', 'Senior Developer', 'QA Engineer', 'Project Manager', 
    'Business Analyst', 'DevOps Engineer', 'UI/UX Designer', 'Java Developer', 
    'Angular Developer', 'Backend Developer', 'Frontend Developer', 'Solution Architect', 'Scrum Master'
  ];

  availableDepartments = [
    'FSOFT-Q1', 'FSOFT-Q2', 'QA', 'PMO', 'BA-TEAM', 'DEVOPS', 'DESIGN-UI', 'AI-LAB', 'SECURITY'
  ];

  newEmployee: Employee = {
    employeeCode: '',
    fullName: '',
    email: '',
    role: '',
    department: ''
  };

  constructor(
    private employeeService: EmployeeService,
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    forkJoin({
      empsPage: this.employeeService.getEmployees(this.currentPage - 1, this.pageSize, this.filters, this.currentSortBy, this.currentSortDir),
      utils: this.reportService.getUtilizationReport()
    }).subscribe({
      next: (res: any) => {
        const utilMap = new Map<number, number>();
        res.utils.forEach((u: any) => utilMap.set(u.employeeId, u.totalAllocation));

        const pageContent = res.empsPage.content || [];
        this.employees = pageContent.map((e: any) => ({
          ...e,
          totalAllocation: utilMap.get(e.employeeId!) || 0
        }));

        this.totalElements = res.empsPage.totalElements || 0;
        this.totalPages = res.empsPage.totalPages || 0;
        this.generatePageNumbers();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Lỗi khi tải danh sách nhân viên', err);
      }
    });
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
    this.loadEmployees();
  }

  toggleSort(column: string): void {
    if (this.currentSortBy === column) {
      this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortBy = column;
      this.currentSortDir = 'asc';
    }
    this.currentPage = 1;
    this.loadEmployees();
  }

  getSortIcon(column: string): string {
    if (this.currentSortBy !== column) return '';
    return this.currentSortDir === 'asc' ? ' ▲' : ' ▼';
  }

  search(): void {
    this.currentPage = 1;
    this.loadEmployees();
  }

  clearFilters(): void {
    this.filters = {
      employeeCode: '',
      fullName: '',
      email: '',
      role: 'ALL',
      department: 'ALL'
    };
    this.currentSortBy = 'fullName';
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
    this.editingEmployeeId = null;
    this.newEmployee = {
      employeeCode: '',
      fullName: '',
      email: '',
      role: '',
      department: ''
    };
    this.cdr.detectChanges();
  }

  openEditModal(emp: Employee): void {
    this.isModalOpen = true;
    this.isEditMode = true;
    this.errorMessage = '';
    this.editingEmployeeId = emp.employeeId!;
    this.newEmployee = {
      employeeCode: emp.employeeCode,
      fullName: emp.fullName,
      email: emp.email,
      role: emp.role,
      department: emp.department
    };
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.cdr.detectChanges();
  }

  saveEmployee(): void {
    if (!this.newEmployee.employeeCode || !this.newEmployee.fullName || !this.newEmployee.email || !this.newEmployee.role || !this.newEmployee.department) {
      this.errorMessage = 'Vui lòng điền đầy đủ các trường bắt buộc.';
      this.cdr.detectChanges();
      return;
    }

    if (this.isEditMode && this.editingEmployeeId) {
      this.employeeService.updateEmployee(this.editingEmployeeId, this.newEmployee).subscribe({
        next: () => {
          this.closeModal();
          this.loadEmployees();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Có lỗi xảy ra khi cập nhật nhân sự.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.employeeService.createEmployee(this.newEmployee).subscribe({
        next: () => {
          this.closeModal();
          this.loadEmployees();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Có lỗi xảy ra khi tạo nhân sự.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteEmployee(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa nhân sự này?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (err: any) => {
          alert(err.error?.message || 'Không thể xóa nhân sự này.');
          this.cdr.detectChanges();
        }
      });
    }
  }
}
