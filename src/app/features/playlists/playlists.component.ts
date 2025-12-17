import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import { PlaylistService } from '../../core/services/playlist.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

type PlaylistAction = 'playlist' | 'playlistAndLibrary';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
  ],
})
export class PlaylistsComponent {
  playlistForm: FormGroup;
  samplePlaylists = [
    { label: 'Discover Weekly', id: '37i9dQZF1DWXRqgorJj26U' },
    { label: 'Focus Flow', id: '37i9dQZF1DXcBWIGoYBM5M' },
    { label: 'Road Trip', id: '0OtO7pGz4WxZmf0RduCMJL' },
  ];
  lastOperation?: { playlistId: string; action: PlaylistAction; timestamp: number };

  private actionCopy: Record<
    PlaylistAction,
    { title: string; message: string; confirmText: string; success: string; error: string }
  > = {
    playlist: {
      title: 'Clear playlist tracks',
      message:
        'Remove every track inside the selected playlist. The tracks will remain saved in your library.',
      confirmText: 'Clear playlist',
      success: 'Playlist tracks removed successfully',
      error: 'Unable to remove tracks from playlist. Please try again.',
    },
    playlistAndLibrary: {
      title: 'Clear playlist and library',
      message:
        'Remove playlist tracks AND delete the same songs from your saved library. A backup is stored automatically.',
      confirmText: 'Delete everywhere',
      success: 'Playlist and library tracks removed successfully',
      error: 'Unable to delete tracks from playlist and library. Please try again.',
    },
  };

  constructor(
    private fb: FormBuilder,
    private playlistService: PlaylistService,
    private notificationService: NotificationService,
    public loadingService: LoadingService,
    private dialog: MatDialog
  ) {
    this.playlistForm = this.fb.group({
      playlistId: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z0-9]+$/),
          Validators.minLength(10),
        ],
      ],
    });
  }

  get playlistIdControl() {
    return this.playlistForm.get('playlistId');
  }

  fillExample(id: string): void {
    this.playlistForm.patchValue({ playlistId: id });
  }

  resetForm(): void {
    this.playlistForm.reset();
  }

  handleAction(action: PlaylistAction): void {
    if (this.playlistForm.invalid) {
      this.playlistForm.markAllAsTouched();
      return;
    }

    const playlistId = this.playlistIdControl?.value?.trim();
    if (!playlistId) {
      return;
    }

    const copy = this.actionCopy[action];
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '460px',
      data: {
        title: copy.title,
        message: `${copy.message}\n\nPlaylist ID: ${playlistId}`,
        confirmText: copy.confirmText,
        cancelText: 'Keep tracks',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.loadingService.show();
      const request$ =
        action === 'playlist'
          ? this.playlistService.deleteAllPlaylistTracks(playlistId)
          : this.playlistService.deleteAllPlaylistAndUserTracks(playlistId);

      request$
        .pipe(finalize(() => this.loadingService.hide()))
        .subscribe({
          next: () => {
            this.notificationService.success(copy.success);
            this.lastOperation = { playlistId, action, timestamp: Date.now() };
          },
          error: (error) => {
            const serverMessage = error?.error?.message;
            this.notificationService.error(serverMessage || copy.error);
          },
        });
    });
  }
}
