import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, AiGeminiResponse } from '../../services/ai.service';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  type?: 'text' | 'recommendation' | 'risk';
  data?: any;
}

@Component({
  selector: 'app-ai-gemini',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Action Button to toggle Sidebar (only when closed) -->
    <button class="gemini-toggle-btn" *ngIf="!isOpen" (click)="toggleSidebar()">
      <span>💬 RAMS AI Assistant</span>
    </button>

    <!-- Sidebar Container -->
    <div class="gemini-sidebar glass-panel" [class.sidebar-open]="isOpen">
      <div class="gemini-header">
        <h3 class="glow-text-purple">🤖 RAMS AI Assistant</h3>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="status-indicator">Online</span>
          <button class="close-sidebar-btn" (click)="toggleSidebar()">✖</button>
        </div>
      </div>

      <!-- Chat History -->
      <div class="chat-history" #scrollContainer>
        <div class="welcome-message" *ngIf="messages.length === 0">
          <p>Tôi có thể giúp gì cho anh?</p>
          <div class="suggestions-list">
            <span class="suggestion-tag" *ngFor="let suggestion of getSuggestions()" (click)="useSuggestion(suggestion)">
              {{ suggestion }}
            </span>
          </div>
        </div>

        <div class="message-wrapper" *ngFor="let msg of messages" [ngClass]="{'msg-user': msg.sender === 'user', 'msg-ai': msg.sender === 'ai'}">
          <div class="message-bubble" [ngClass]="{'bubble-user': msg.sender === 'user', 'bubble-ai': msg.sender === 'ai'}">
            <!-- Text message -->
            <p *ngIf="msg.text" style="margin: 0; white-space: pre-wrap; line-height: 1.5;">{{ msg.text }}</p>

            <!-- Recommendation Result -->
            <div *ngIf="msg.type === 'recommendation'" class="result-recommendation" style="margin-top: 10px;">
              <div *ngIf="msg.data.length === 0" class="empty-result">
                Không tìm thấy nhân sự phù hợp thỏa mãn điều kiện.
              </div>
              <div class="recommended-card glass-input" *ngFor="let item of msg.data" style="margin-top: 8px; border-color: rgba(59, 130, 246, 0.2);">
                <div style="font-weight: 600; color: #ffffff;">{{ item.employee }}</div>
                <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                  Độ khả dụng: <span style="color: var(--success); font-weight: 600;">{{ item.available }}%</span>
                </div>
              </div>
            </div>

            <!-- Risk Result -->
            <div *ngIf="msg.type === 'risk'" class="result-risk" style="margin-top: 10px;">
              <div *ngIf="msg.data.length === 0" class="empty-result">
                Không phát hiện rủi ro nào đáng kể.
              </div>
              <div class="risk-card glass-input" *ngFor="let item of msg.data" style="margin-top: 6px; border-color: rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.03);">
                <span style="color: var(--danger); font-weight: 500;">🚨 {{ item }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="message-wrapper msg-ai" *ngIf="isLoading">
          <div class="message-bubble bubble-ai loading-bubble">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chat-input-area">
        <input type="text" class="glass-input" placeholder="Nhập câu hỏi của anh..." [(ngModel)]="userInput" (keyup.enter)="sendMessage()" [disabled]="isLoading" />
        <button class="glass-btn send-btn" (click)="sendMessage()" [disabled]="isLoading">Gửi</button>
      </div>
    </div>
  `,
  styles: [`
    /* Toggle Button */
    .gemini-toggle-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1001;
      background: linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%);
      border: none;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14.5px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all var(--transition-smooth);
      animation: pulsePurple 2s infinite;
    }
    .gemini-toggle-btn:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 24px rgba(139, 92, 246, 0.5);
    }

    /* Sidebar Container */
    .gemini-sidebar {
      position: fixed;
      top: 24px;
      right: -420px; /* Hidden initially */
      width: 380px;
      height: calc(100vh - 48px);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      padding: 20px;
      transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
    }
    .sidebar-open {
      right: 24px;
    }

    /* Header */
    .gemini-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .status-indicator {
      font-size: 11px;
      font-weight: 600;
      color: var(--success);
      background: rgba(16, 185, 129, 0.1);
      padding: 2px 8px;
      border-radius: 20px;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .close-sidebar-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 16px;
      transition: color var(--transition-smooth);
    }
    .close-sidebar-btn:hover {
      color: var(--danger);
    }

    /* Chat History */
    .chat-history {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 16px;
      padding-right: 4px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .chat-history::-webkit-scrollbar {
      width: 4px;
    }
    .chat-history::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 2px;
    }

    /* Welcome state */
    .welcome-message {
      text-align: center;
      padding: 30px 10px;
      color: var(--text-secondary);
    }
    .suggestions-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 20px;
    }
    .suggestion-tag {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      transition: all var(--transition-smooth);
      text-align: left;
      color: var(--text-primary);
    }
    .suggestion-tag:hover {
      background: rgba(139, 92, 246, 0.08);
      border-color: rgba(139, 92, 246, 0.3);
      transform: translateX(4px);
    }

    /* Chat bubbles */
    .message-wrapper {
      display: flex;
      width: 100%;
    }
    .msg-user {
      justify-content: flex-end;
    }
    .msg-ai {
      justify-content: flex-start;
    }
    .message-bubble {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 14px;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    .bubble-user {
      background: linear-gradient(135deg, var(--accent-blue) 0%, #2563eb 100%);
      color: #ffffff;
      border-bottom-right-radius: 2px;
    }
    .bubble-ai {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: var(--text-primary);
      border-bottom-left-radius: 2px;
    }

    /* Loading state */
    .loading-bubble {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 12px 20px;
    }
    .loading-dot {
      width: 6px;
      height: 6px;
      background: var(--text-secondary);
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    .loading-dot:nth-child(1) { animation-delay: -0.32s; }
    .loading-dot:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
    }
    @keyframes pulsePurple {
      0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
      100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
    }

    /* Input area */
    .chat-input-area {
      display: flex;
      gap: 8px;
    }
    .send-btn {
      padding: 12px 16px;
    }
  `]
})
export class AiGeminiComponent {
  isOpen = false;
  userInput = '';
  isLoading = false;
  messages: ChatMessage[] = [];

  constructor(
    private aiService: AiService,
    private cdr: ChangeDetectorRef
  ) {}

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
    this.cdr.detectChanges();
  }

  getSuggestions(): string[] {
    return [
      'nhân sự nào còn rảnh >50%?',
      'Tìm QA Engineer rảnh 30%',
      'Tìm Developer trống 20%',
      'Sprint tới cần thêm 2 Senior Developer',
      'Cần 3 Developer cho dự án E-COMM',
      'Cần thêm 1 QA Engineer cho sprint sau'
    ];
  }

  useSuggestion(suggestion: string): void {
    this.userInput = suggestion;
    this.sendMessage();
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading) return;

    const userPrompt = this.userInput.trim();
    this.messages.push({ sender: 'user', text: userPrompt });
    this.userInput = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    // Scroll to bottom (timeout to allow DOM rendering)
    setTimeout(() => this.scrollToBottom(), 50);

    this.aiService.askGemini(userPrompt).subscribe({
      next: (res: AiGeminiResponse) => {
        this.isLoading = false;

        const text = res.text || '';
        const mode = res.mode || 'text';

        if (mode === 'recommend') {
          const recs = res.recommendedResources || [];
          if (recs.length === 1 && recs[0].employee.includes("cấu hình")) {
            this.messages.push({
              sender: 'ai',
              text: recs[0].employee,
              type: 'text'
            });
          } else {
            this.messages.push({
              sender: 'ai',
              text: text,
              type: 'recommendation',
              data: recs
            });
          }
        } else if (mode === 'risk') {
          const risks = res.risk || [];
          if (risks.length === 1 && risks[0].includes("cấu hình")) {
            this.messages.push({
              sender: 'ai',
              text: risks[0],
              type: 'text'
            });
          } else {
            this.messages.push({
              sender: 'ai',
              text: text,
              type: 'risk',
              data: risks
            });
          }
        } else {
          this.messages.push({
            sender: 'ai',
            text: text,
            type: 'text'
          });
        }

        this.cdr.detectChanges();
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.messages.push({ sender: 'ai', text: 'Có lỗi xảy ra khi gọi AI: ' + (err.error?.message || err.message) });
        this.cdr.detectChanges();
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  private scrollToBottom(): void {
    const chatHistory = document.querySelector('.chat-history');
    if (chatHistory) {
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }
  }
}
