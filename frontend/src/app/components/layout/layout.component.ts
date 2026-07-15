import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AiGeminiComponent } from '../ai-gemini/ai-gemini.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AiGeminiComponent],
  template: `
    <div class="app-layout">
      <!-- Left Sidebar Navigation -->
      <aside class="app-sidebar glass-panel">
        <div class="brand">
          <span class="brand-logo">⚡</span>
          <span class="brand-name glow-text-blue">RAMS</span>
        </div>
        
        <nav class="nav-menu">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span> Dashboard
          </a>
          <a routerLink="/employees" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👥</span> Nhân Sự
          </a>
          <a routerLink="/projects" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💼</span> Dự Án
          </a>
          <a routerLink="/allocations" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">⚡</span> Phân Bổ
          </a>
        </nav>

        <div class="sidebar-footer">
          <div style="font-size: 12px; color: var(--text-secondary);">Resource Allocation</div>
          <div style="font-size: 11px; color: var(--accent-purple); font-weight: 600; margin-top: 4px;">Version 1.0.0</div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="app-content-wrapper">
        <!-- Top Header -->
        <header class="app-header glass-panel">
          <div class="header-search">
            <span style="color: var(--text-secondary); font-size: 14px;">Hệ Thống Quản Lý Phân Bổ Nguồn Lực</span>
          </div>
          <div class="header-profile">
            <div class="avatar">AD</div>
            <span style="font-weight: 500; font-size: 14px;">Administrator</span>
          </div>
        </header>

        <!-- Main Dynamic Router Outlet -->
        <div class="app-page-content">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- AI Gemini Panel Component -->
      <app-ai-gemini></app-ai-gemini>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      width: 100vw;
    }
    
    /* Sidebar styling */
    .app-sidebar {
      width: 260px;
      height: calc(100vh - 32px);
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 100;
      display: flex;
      flex-direction: column;
      padding: 24px;
      border-radius: 20px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 40px;
    }
    .brand-logo {
      font-size: 24px;
      background: rgba(59, 130, 246, 0.1);
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }
    .brand-name {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    
    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 10px;
      font-weight: 500;
      font-size: 15px;
      transition: var(--transition-smooth);
      border: 1px solid transparent;
    }
    .nav-item:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.02);
    }
    .nav-item.active {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.06);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    }
    .nav-icon {
      font-size: 18px;
    }
    .sidebar-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.04);
      padding-top: 16px;
      text-align: center;
    }

    /* Content Area */
    .app-content-wrapper {
      flex: 1;
      margin-left: 292px; /* 260px sidebar + 16px left gap + 16px content gap */
      padding: 16px 16px 16px 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .app-header {
      height: 64px;
      border-radius: 16px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 13px;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
    }
    .app-page-content {
      flex: 1;
      padding: 8px 0;
    }
  `]
})
export class LayoutComponent {}
