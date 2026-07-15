import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, Project } from '../../services/project.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="projects-container" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h1 class="glow-text-blue" style="font-weight: 600;">Quản Lý Dự Án</h1>
        <button class="glass-btn" (click)="openAddModal()">➕ Thêm Dự Án</button>
      </div>

      <!-- Advanced Search Panel -->
      <div class="glass-panel filter-bar" style="margin-bottom: 8px; padding: 10px 16px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
        <div style="flex: 1; min-width: 120px;">
          <label class="form-label">Mã Dự Án</label>
          <input type="text" class="glass-input" placeholder="Mã dự án..." [(ngModel)]="filters.projectCode" (keyup.enter)="search()" />
        </div>
        <div style="flex: 1.5; min-width: 180px;">
          <label class="form-label">Tên Dự Án</label>
          <input type="text" class="glass-input" placeholder="Tìm theo tên..." [(ngModel)]="filters.projectName" (keyup.enter)="search()" />
        </div>
        <div style="flex: 1.5; min-width: 180px;">
          <label class="form-label">Khách Hàng</label>
          <input type="text" class="glass-input" placeholder="Tìm khách hàng..." [(ngModel)]="filters.customer" (keyup.enter)="search()" />
        </div>
        <div style="flex: 1.2; min-width: 150px;">
          <label class="form-label">Trạng Thái</label>
          <select class="glass-input glass-select" [(ngModel)]="filters.status">
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PLANNING">Lập Kế Hoạch (PLANNING)</option>
            <option value="ACTIVE">Đang Hoạt Động (ACTIVE)</option>
            <option value="COMPLETED">Đã Hoàn Thành (COMPLETED)</option>
          </select>
        </div>
        <!-- Dropdown select sắp xếp dự án -->
        <div style="flex: 1.2; min-width: 150px;">
          <label class="form-label">Sắp Xếp</label>
          <select class="glass-input glass-select" [(ngModel)]="currentSort" (ngModelChange)="onSortChange()">
            <option value="projectName,asc">Tên dự án (A-Z)</option>
            <option value="projectName,desc">Tên dự án (Z-A)</option>
            <option value="startDate,desc">Mới nhất trước</option>
            <option value="startDate,asc">Cũ nhất trước</option>
            <option value="status,asc">Trạng thái (A-Z)</option>
          </select>
        </div>
        <div style="margin-top: 22px; display: flex; gap: 8px;">
          <button class="glass-btn" style="padding: 10px 16px; font-weight: 500;" (click)="search()">🔍 Tìm Kiếm</button>
          <button class="glass-btn glass-btn-secondary" style="padding: 10px 16px; font-weight: 500;" (click)="clearFilters()">Clear</button>
        </div>
      </div>

      <!-- Projects Grid -->
      <div class="projects-grid">
        <div class="glass-panel project-card" *ngFor="let proj of filteredProjects">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
              <span class="project-code">{{ proj.projectCode }}</span>
              <h3 style="margin-top: 8px; font-weight: 600; font-size: 18px;">{{ proj.projectName }}</h3>
            </div>
            <span class="status-badge" [ngClass]="{
              'status-planning': proj.status === 'PLANNING',
              'status-active': proj.status === 'ACTIVE',
              'status-completed': proj.status === 'COMPLETED'
            }">
              {{ 
                proj.status === 'PLANNING' ? 'Lập kế hoạch' : 
                proj.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã hoàn thành' 
              }}
            </span>
          </div>

          <div style="margin-bottom: 12px;">
            <span style="font-size: 13px; color: var(--text-secondary);">Khách hàng:</span>
            <span style="font-size: 14px; font-weight: 500; margin-left: 6px;">{{ proj.customer || 'N/A' }}</span>
          </div>

          <div class="project-dates" style="display: flex; gap: 16px; border-top: 1px solid rgba(255, 255, 255, 0.04); padding-top: 12px; font-size: 13px; color: var(--text-secondary);">
            <div>
              <div>Bắt đầu</div>
              <div style="color: var(--text-primary); font-weight: 500; margin-top: 4px;">{{ proj.startDate }}</div>
            </div>
            <div>
              <div>Kết thúc</div>
              <div style="color: var(--text-primary); font-weight: 500; margin-top: 4px;">{{ proj.endDate || 'Chưa xác định' }}</div>
            </div>
          </div>

          <!-- Edit/Delete Action row for Projects Grid Card -->
          <div class="action-container">
            <button class="action-btn edit-btn" (click)="openEditModal(proj)">✏️</button>
            <button class="action-btn delete-btn" (click)="deleteProject(proj.projectId!)">🗑️</button>
          </div>
        </div>
      </div>

      <div *ngIf="filteredProjects.length === 0" class="glass-panel" style="text-align: center; padding: 40px; color: var(--text-secondary); margin-top: 20px;">
        Không tìm thấy dự án nào phù hợp.
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

      <!-- Add/Edit Project Modal -->
      <div class="modal-overlay" *ngIf="isModalOpen">
        <div class="glass-panel modal-content">
          <h3 style="margin-bottom: 20px; font-weight: 600; text-align: center;">
            {{ isEditMode ? 'Cập Nhật Dự Án' : 'Tạo Dự Án Mới' }}
          </h3>
          
          <div *ngIf="errorMessage" class="error-banner">{{ errorMessage }}</div>

          <form (ngSubmit)="saveProject()">
            <div style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 500;">Mã Dự Án *</label>
              <input type="text" class="glass-input" name="projectCode" [(ngModel)]="newProject.projectCode" [disabled]="isEditMode" placeholder="Ví dụ: NCG" required />
            </div>

            <div style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 500;">Tên Dự Án *</label>
              <input type="text" class="glass-input" name="projectName" [(ngModel)]="newProject.projectName" placeholder="Ví dụ: NCG Digital Platform" required />
            </div>

            <div style="margin-bottom: 16px;">
              <label class="form-label" style="font-weight: 500;">Khách Hàng</label>
              <input type="text" class="glass-input" name="customer" [(ngModel)]="newProject.customer" placeholder="Ví dụ: Customer A" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
              <div>
                <label class="form-label" style="font-weight: 500;">Ngày Bắt Đầu *</label>
                <input type="date" class="glass-input" name="startDate" [(ngModel)]="newProject.startDate" required />
              </div>
              <div>
                <label class="form-label" style="font-weight: 500;">Ngày Kết Thúc</label>
                <input type="date" class="glass-input" name="endDate" [(ngModel)]="newProject.endDate" />
              </div>
            </div>

            <div style="margin-bottom: 24px;">
              <label class="form-label" style="font-weight: 500;">Trạng Thái *</label>
              <select class="glass-input glass-select" name="status" [(ngModel)]="newProject.status" required>
                <option value="PLANNING">Lập Kế Hoạch (PLANNING)</option>
                <option value="ACTIVE">Đang Hoạt Động (ACTIVE)</option>
                <option value="COMPLETED">Đã Hoàn Thành (COMPLETED)</option>
              </select>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button type="button" class="glass-btn glass-btn-secondary" (click)="closeModal()">Hủy</button>
              <button type="submit" class="glass-btn">{{ isEditMode ? 'Lưu Thay Đổi' : 'Tạo Dự Án' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 20px;
      flex: 1;
      overflow-y: auto;
      padding: 4px;
      min-height: 0;
    }
    @media (max-width: 1600px) {
      .projects-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    @media (max-width: 1200px) {
      .projects-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    @media (max-width: 900px) {
      .projects-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 600px) {
      .projects-grid {
        grid-template-columns: 1fr;
      }
    }
    .project-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 250px;
    }
    .project-code {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--accent-blue);
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .status-badge {
      font-size: 12px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .status-planning {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.25);
      color: var(--warning);
    }
    .status-active {
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.25);
      color: var(--accent-blue);
    }
    .status-completed {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: var(--success);
    }

    .action-container {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: auto;
      border-top: 1px solid rgba(255, 255, 255, 0.04);
      padding-top: 12px;
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
    
    /* Modal styles */
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
export class ProjectsComponent implements OnInit {
  filteredProjects: Project[] = [];
  isModalOpen = false;
  isEditMode = false;
  errorMessage = '';
  editingProjectId: number | null = null;

  // Pagination states
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  pageNumbers: number[] = [];

  // Sorting states
  currentSort = 'projectName,asc';
  currentSortBy = 'projectName';
  currentSortDir = 'asc';

  // Advanced Filters
  filters = {
    projectCode: '',
    projectName: '',
    customer: '',
    status: 'ALL'
  };

  newProject: Project = {
    projectCode: '',
    projectName: '',
    customer: '',
    startDate: '',
    endDate: '',
    status: 'PLANNING'
  };

  constructor(
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects(this.currentPage - 1, this.pageSize, this.filters, this.currentSortBy, this.currentSortDir).subscribe({
      next: (res: any) => {
        this.filteredProjects = res.content || [];
        this.totalElements = res.totalElements || 0;
        this.totalPages = res.totalPages || 0;
        this.generatePageNumbers();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Lỗi khi tải danh sách dự án', err);
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
    this.loadProjects();
  }

  onSortChange(): void {
    const parts = this.currentSort.split(',');
    this.currentSortBy = parts[0];
    this.currentSortDir = parts[1];
    this.currentPage = 1;
    this.loadProjects();
  }

  search(): void {
    this.currentPage = 1;
    this.loadProjects();
  }

  clearFilters(): void {
    this.filters = {
      projectCode: '',
      projectName: '',
      customer: '',
      status: 'ALL'
    };
    this.currentSort = 'projectName,asc';
    this.currentSortBy = 'projectName';
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
    this.editingProjectId = null;
    const today = new Date().toISOString().substring(0, 10);
    this.newProject = {
      projectCode: '',
      projectName: '',
      customer: '',
      startDate: today,
      endDate: '',
      status: 'PLANNING'
    };
    this.cdr.detectChanges();
  }

  openEditModal(proj: Project): void {
    this.isModalOpen = true;
    this.isEditMode = true;
    this.errorMessage = '';
    this.editingProjectId = proj.projectId!;
    this.newProject = {
      projectCode: proj.projectCode,
      projectName: proj.projectName,
      customer: proj.customer || '',
      startDate: proj.startDate,
      endDate: proj.endDate || '',
      status: proj.status
    };
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.cdr.detectChanges();
  }

  saveProject(): void {
    if (!this.newProject.projectCode || !this.newProject.projectName || !this.newProject.startDate) {
      this.errorMessage = 'Vui lòng điền đầy đủ các thông tin bắt buộc.';
      this.cdr.detectChanges();
      return;
    }

    if (this.newProject.endDate && this.newProject.startDate > this.newProject.endDate) {
      this.errorMessage = 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu.';
      this.cdr.detectChanges();
      return;
    }

    if (this.isEditMode && this.editingProjectId) {
      this.projectService.updateProject(this.editingProjectId, this.newProject).subscribe({
        next: () => {
          this.closeModal();
          this.loadProjects();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Có lỗi xảy ra khi cập nhật dự án.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.projectService.createProject(this.newProject).subscribe({
        next: () => {
          this.closeModal();
          this.loadProjects();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Có lỗi xảy ra khi tạo dự án.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteProject(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => {
          this.loadProjects();
        },
        error: (err: any) => {
          alert(err.error?.message || 'Không thể xóa dự án này.');
          this.cdr.detectChanges();
        }
      });
    }
  }
}
