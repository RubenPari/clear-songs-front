/**
 * Skeleton Loading Component
 *
 * Reusable skeleton placeholders for loading states.
 * Improves perceived performance and reduces layout shift.
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (type) {
      @case ('stat') {
        <div class="skeleton-stat">
          <div class="skeleton-icon"></div>
          <div class="skeleton-content">
            <div class="skeleton-value"></div>
            <div class="skeleton-label"></div>
          </div>
        </div>
      }
      @case ('table') {
        <div class="skeleton-table">
          <div class="skeleton-header-row">
            <div class="skeleton-cell" style="flex: 2;"></div>
            <div class="skeleton-cell" style="flex: 1;"></div>
            <div class="skeleton-cell" style="width: 80px;"></div>
          </div>
          @for (i of [1,2,3,4,5]; track i) {
            <div class="skeleton-data-row">
              <div class="skeleton-cell" style="flex: 2;">
                <div class="skeleton-avatar-text">
                  <div class="skeleton-avatar"></div>
                  <div class="skeleton-text"></div>
                </div>
              </div>
              <div class="skeleton-cell" style="flex: 1;">
                <div class="skeleton-badge"></div>
              </div>
              <div class="skeleton-cell" style="width: 80px;">
                <div class="skeleton-btn"></div>
              </div>
            </div>
          }
        </div>
      }
      @case ('chart') {
        <div class="skeleton-chart">
          <div class="skeleton-bars">
            @for (height of ['60%', '80%', '100%', '70%', '50%']; track $index) {
              <div class="skeleton-bar" [style.height]="height"></div>
            }
          </div>
        </div>
      }
      @default {
        <div class="skeleton-card">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line medium"></div>
        </div>
      }
    }
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Skeleton Card */
    .skeleton-card {
      background: var(--card-bg, #ffffff);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Skeleton Stat */
    .skeleton-stat {
      background: var(--card-bg, #ffffff);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .skeleton-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-content {
      flex: 1;
    }

    .skeleton-value {
      width: 60%;
      height: 28px;
      border-radius: 8px;
      margin-bottom: 8px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-label {
      width: 40%;
      height: 16px;
      border-radius: 6px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    /* Skeleton Table */
    .skeleton-table {
      background: var(--card-bg, #ffffff);
      border-radius: 16px;
      overflow: hidden;
    }

    .skeleton-header-row {
      display: flex;
      gap: 16px;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .skeleton-data-row {
      display: flex;
      gap: 16px;
      padding: 12px 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.03);
    }

    .skeleton-cell {
      display: flex;
      align-items: center;
    }

    .skeleton-avatar-text {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .skeleton-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-text {
      flex: 1;
      height: 16px;
      border-radius: 6px;
      max-width: 150px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-badge {
      width: 50px;
      height: 24px;
      border-radius: 12px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    /* Skeleton Chart */
    .skeleton-chart {
      background: var(--card-bg, #ffffff);
      border-radius: 16px;
      padding: 24px;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .skeleton-bars {
      display: flex;
      align-items: end;
      justify-content: space-around;
      gap: 24px;
      height: 200px;
      width: 100%;
      max-width: 400px;
    }

    .skeleton-bar {
      flex: 1;
      max-width: 60px;
      border-radius: 6px 6px 0 0;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    /* Common Skeleton Lines */
    .skeleton-line {
      height: 16px;
      border-radius: 8px;
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-line.short {
      width: 40%;
    }

    .skeleton-line.medium {
      width: 70%;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Dark theme support */
    :host-context(.dark-theme) {
      .skeleton-icon,
      .skeleton-value,
      .skeleton-label,
      .skeleton-avatar,
      .skeleton-text,
      .skeleton-badge,
      .skeleton-btn,
      .skeleton-bar,
      .skeleton-line,
      .skeleton-cell {
        background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
        background-size: 200% 100%;
      }
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'card' | 'stat' | 'table' | 'chart' = 'card';
}
