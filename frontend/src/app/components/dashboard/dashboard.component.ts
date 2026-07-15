import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService, UtilizationReport, AvailableResourceReport, OverloadedResourceReport } from '../../services/report.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1 class="glow-text-blue" style="margin-bottom: 12px; font-weight: 600;">Hệ Thống Phân Bổ Nguồn Lực - Dashboard</h1>

      <!-- Top KPI Cards Row -->
      <div class="kpi-grid">
        <div class="glass-panel kpi-card">
          <div class="kpi-icon">👥</div>
          <div>
            <div class="kpi-label">Tổng Nhân Sự</div>
            <div class="kpi-value">{{ totalEmployees }}</div>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-icon">💼</div>
          <div>
            <div class="kpi-label">Dự Án Hoạt Động</div>
            <div class="kpi-value">{{ totalActiveProjects }}</div>
          </div>
        </div>

        <div class="glass-panel kpi-card">
          <div class="kpi-icon">⚡</div>
          <div>
            <div class="kpi-label">Tổng Phân Bổ</div>
            <div class="kpi-value">{{ totalAllocations }}</div>
          </div>
        </div>

        <div class="glass-panel kpi-card card-alert">
          <div class="kpi-icon icon-alert">⚠️</div>
          <div>
            <div class="kpi-label">Nhân Sự Quá Tải</div>
            <div class="kpi-value text-danger">{{ overloadedList.length }}</div>
          </div>
        </div>
      </div>

      <!-- Main Visualizations Grid -->
      <div class="panels-grid" style="margin-bottom: 12px;">
        <!-- Left Column: Custom Bar Chart (Scrollable Horizontal) -->
        <div class="glass-panel chart-panel">
          <h3 style="margin-bottom: 16px; font-weight: 600;">Hiệu Suất Phân Bổ Nhân Sự (Sắp xếp giảm dần, lướt ngang)</h3>
          
          <div class="chart-container">
            <div class="bar-chart" *ngIf="utilizationList.length > 0">
              <div class="chart-bar-wrapper" *ngFor="let item of utilizationList">
                <div class="bar-value-label">{{ item.totalAllocation }}%</div>
                <div class="chart-bar-container">
                  <div class="chart-bar-fill" 
                       [style.height.%]="item.totalAllocation"
                       [ngClass]="{
                         'bar-safe': item.totalAllocation < 70,
                         'bar-warning': item.totalAllocation >= 70 && item.totalAllocation <= 90,
                         'bar-danger': item.totalAllocation > 90
                       }">
                  </div>
                </div>
                <!-- Xoay nghiêng tên đầy đủ -->
                <div class="bar-name-label" [title]="item.fullName">{{ item.fullName }}</div>
              </div>
            </div>
            
            <div *ngIf="utilizationList.length === 0" class="empty-state">
              Không có dữ liệu hiệu suất.
            </div>
          </div>
        </div>

        <div class="glass-panel" style="display: flex; flex-direction: column; min-height: 250px;">
          <h3 class="text-danger" style="margin-bottom: 16px; font-weight: 600;">Nhân Sự Cần Điều Chỉnh (Overloaded > 90%)</h3>
          
          <div class="overload-list" style="flex: 1; overflow-y: auto;">
            <div class="overload-item glass-input" *ngFor="let emp of overloadedList" style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-color: rgba(239, 68, 68, 0.2);">
              <div>
                <div style="font-weight: 600; color: #ffffff;">{{ emp.fullName }}</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">ID: #{{ emp.employeeId }}</div>
              </div>
              <span class="badge-danger">{{ emp.totalAllocation }}% Allocation</span>
            </div>

            <div *ngIf="overloadedList.length === 0" class="empty-state" style="padding: 60px 0;">
              🎉 Tuyệt vời! Không có nhân sự nào bị quá tải.
            </div>
          </div>
        </div>
      </div>

      <!-- Lower Visualization Row (Idle Employees & Project Members count) -->
      <div class="panels-grid lower-grid">
        <!-- Left: Idle Employees List (0% allocation) -->
        <div class="glass-panel" style="display: flex; flex-direction: column; min-height: 200px; flex: 1;">
          <h3 class="text-success" style="margin-bottom: 16px; font-weight: 600;">Nhân Sự Đang Rảnh (0% Phân Bổ)</h3>
          
          <div class="idle-list" style="flex: 1; overflow-y: auto; max-height: 160px;">
            <table class="glass-table-simple" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px; color: var(--text-secondary);">
                  <th style="padding: 8px 0;">Mã NV</th>
                  <th style="padding: 8px 0;">Họ và Tên</th>
                  <th style="padding: 8px 0;">Vai Trò</th>
                  <th style="padding: 8px 0;">Phòng Ban</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let emp of idleEmployees" style="border-bottom: 1px solid rgba(255, 255, 255, 0.04); font-size: 13.5px; color: var(--text-primary);">
                  <td style="padding: 10px 0;"><code style="color: var(--accent-blue);">{{ emp.employeeCode }}</code></td>
                  <td style="padding: 10px 0; font-weight: 500;">{{ emp.fullName }}</td>
                  <td style="padding: 10px 0; color: var(--text-secondary);">{{ emp.role }}</td>
                  <td style="padding: 10px 0;">{{ emp.department }}</td>
                </tr>
                <tr *ngIf="idleEmployees.length === 0">
                  <td colspan="4" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    Tất cả nhân sự đã được phân bổ vào các dự án.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Project Member Count counts -->
        <div class="glass-panel" style="display: flex; flex-direction: column; min-height: 200px; flex: 1;">
          <h3 class="glow-text-purple" style="margin-bottom: 16px; font-weight: 600;">Số Lượng Thành Viên Từng Dự Án</h3>
          
          <div class="project-members-list" style="flex: 1; overflow-y: auto; max-height: 160px;">
            <div class="project-member-item glass-input" *ngFor="let pm of projectMembers" style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border-color: rgba(139, 92, 246, 0.15);">
              <div>
                <div style="font-weight: 600; color: #ffffff;">{{ pm.projectName }}</div>
                <div style="font-size: 12px; color: var(--accent-blue); margin-top: 4px;">Mã DA: {{ pm.projectCode }}</div>
              </div>
              <span class="member-count-badge">{{ pm.memberCount }} Nhân Sự</span>
            </div>
            
            <div *ngIf="projectMembers.length === 0" class="empty-state">
              Chưa có dự án nào được khởi tạo.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      padding-bottom: 24px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 12px;
    }
    .kpi-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
    }
    .kpi-icon {
      font-size: 20px;
      width: 38px;
      height: 38px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kpi-label {
      font-size: 11.5px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .kpi-value {
      font-size: 18px;
      font-weight: 700;
      margin-top: 2px;
      color: #ffffff;
    }
    .card-alert {
      border: 1px solid rgba(239, 68, 68, 0.2) !important;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%) !important;
    }
    .icon-alert {
      border-color: rgba(239, 68, 68, 0.2);
    }
    
    .panels-grid {
      display: grid;
      grid-template-columns: 2fr 1.2fr;
      gap: 16px;
    }

    @media (max-width: 1100px) {
      .panels-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .chart-panel {
      min-height: 250px;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .chart-container {
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;
      max-width: 100%;
      padding-bottom: 16px;
      display: flex;
      align-items: flex-end;
    }
    .chart-container::-webkit-scrollbar {
      height: 6px;
    }
    .chart-container::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 3px;
    }
    .chart-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    .chart-container::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    /* Cải tiến biểu đồ cột và nhãn xoay nghiêng */
    .bar-chart {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      min-width: max-content;
      height: 210px;
      padding: 15px 10px 60px 10px; /* Thừa khoảng trống 60px phía dưới cho nhãn tên xoay */
    }
    .chart-bar-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 60px;
      flex-shrink: 0;
      position: relative;
    }
    .chart-bar-container {
      width: 20px;
      height: 100px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .chart-bar-fill {
      width: 100%;
      border-radius: 10px;
      transition: height 1s ease-out;
    }
    .bar-safe {
      background: linear-gradient(180deg, #10b981 0%, #059669 100%);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
    }
    .bar-warning {
      background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
    }
    .bar-danger {
      background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
    }
    .bar-value-label {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--text-primary);
    }
    
    /* Xoay nghiêng tên 45 độ chuyên nghiệp */
    .bar-name-label {
      font-size: 11px;
      color: var(--text-secondary);
      margin-top: 10px;
      text-align: left;
      white-space: nowrap;
      transform: rotate(-45deg);
      transform-origin: top left;
      display: inline-block;
      width: 80px;
      position: absolute;
      left: 16px;
      top: 124px;
      transition: var(--transition-smooth);
    }
    .chart-bar-wrapper:hover .bar-name-label {
      color: #ffffff;
    }

    .badge-danger {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }
    .member-count-badge {
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: var(--accent-purple);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    .empty-state {
      padding: 40px;
      text-align: center;
      color: var(--text-secondary);
      font-size: 15px;
      width: 100%;
    }

    /* Styles cho bảng kính rảnh rỗi */
    .glass-table-simple th {
      font-weight: 500;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glass-table-simple td {
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
  `]
})
export class DashboardComponent implements OnInit {
  totalEmployees = 0;
  totalActiveProjects = 0;
  totalAllocations = 0;

  utilizationList: UtilizationReport[] = [];
  overloadedList: OverloadedResourceReport[] = [];
  
  // Idle Employees and Project Member Counts (Mới)
  idleEmployees: any[] = [];
  projectMembers: any[] = [];

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    forkJoin({
      utilization: this.reportService.getUtilizationReport(),
      overloaded: this.reportService.getOverloadedReport(),
      idle: this.reportService.getIdleEmployees(),
      projectMembers: this.reportService.getProjectMemberCounts()
    }).subscribe({
      next: (res: any) => {
        // Sắp xếp giảm dần theo tỷ lệ phân bổ (người bận nhất đứng đầu)
        this.utilizationList = (res.utilization || []).sort((a: any, b: any) => b.totalAllocation - a.totalAllocation);
        this.overloadedList = res.overloaded || [];
        this.idleEmployees = res.idle || [];
        this.projectMembers = res.projectMembers || [];

        // Tính các số liệu KPI
        this.totalEmployees = this.utilizationList.length;
        this.totalActiveProjects = this.projectMembers.filter((p: any) => p.memberCount > 0).length;
        this.totalAllocations = res.utilization.reduce((sum: number, item: any) => sum + (item.totalAllocation > 0 ? 1 : 0), 0);

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Lỗi khi tải thông tin Dashboard', err);
      }
    });
  }
}
