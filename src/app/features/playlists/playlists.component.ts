import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlaylistService } from '../../core/services/playlist.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-playlists',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Playlists</mat-card-title>
        <mat-card-subtitle>Manage your Spotify playlists</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="loadingService.loading$ | async" class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
        <div *ngIf="!(loadingService.loading$ | async)">
          <p>Playlist management coming soon...</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }
  `],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule]
})
export class PlaylistsComponent implements OnInit {
  
  constructor(
    private playlistService: PlaylistService,
    private notificationService: NotificationService,
    public loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    // Future implementation for loading playlists
  }
}