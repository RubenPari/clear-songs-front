/**
 * Playlists Management Component
 * 
 * This component provides tools for managing Spotify playlists, allowing users to
 * perform bulk operations on playlists including clearing tracks and removing tracks
 * from both playlists and the user's library.
 * 
 * Features:
 * - Playlist ID input with validation (alphanumeric, min 10 characters)
 * - Quick sample playlists for testing
 * - Two operation modes:
 *   1. Clear playlist only (tracks remain in library)
 *   2. Clear playlist AND library (tracks removed from both, with backup)
 * - Operation history tracking
 * - Confirmation dialogs for destructive operations
 * - Loading states and error handling
 * 
 * The component uses reactive forms with typed FormGroup for type safety and
 * proper validation. All HTTP operations are properly managed with takeUntilDestroyed()
 * to prevent memory leaks.
 * 
 * @component
 * @selector app-playlists
 * @standalone true
 * @author Clear Songs Development Team
 */
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';

import { PlaylistService } from '../../core/services/playlist.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserPlaylist } from '../../core/models/artist.model';

/**
 * Playlist Action Type
 * 
 * Defines the two types of playlist operations available:
 * - 'playlist': Clear tracks from playlist only
 * - 'playlistAndLibrary': Clear tracks from playlist AND user's library
 */
type PlaylistAction = 'playlist' | 'playlistAndLibrary';

interface PlaylistForm {
  playlistId: FormControl<string | null>;
}

interface SamplePlaylist {
  readonly label: string;
  readonly id: string;
}

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
})
export class PlaylistsComponent {
  private readonly destroyRef = inject(DestroyRef);

  playlistForm: FormGroup<PlaylistForm>;
  readonly samplePlaylists: readonly SamplePlaylist[] = [
    { label: 'Discover Weekly', id: '37i9dQZF1DWXRqgorJj26U' },
    { label: 'Focus Flow', id: '37i9dQZF1DXcBWIGoYBM5M' },
    { label: 'Road Trip', id: '0OtO7pGz4WxZmf0RduCMJL' },
  ] as const;
  lastOperation?: { playlistId: string; action: PlaylistAction; timestamp: number };
  
  userPlaylists: UserPlaylist[] = [];
  selectedPlaylistId: string | null = null;
  loadingPlaylists = false;

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
    private modalService: NgbModal
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
    
    this.loadUserPlaylists();
  }

  /**
   * Loads all user playlists from the backend
   */
  loadUserPlaylists(): void {
    this.loadingPlaylists = true;
    this.playlistService.getUserPlaylists()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (playlists) => {
          this.userPlaylists = playlists;
          this.loadingPlaylists = false;
        },
        error: (error) => {
          this.notificationService.error('Failed to load playlists. You can still enter a playlist ID manually.');
          this.loadingPlaylists = false;
        }
      });
  }

  /**
   * Selects a playlist from the card grid
   */
  selectPlaylist(playlist: UserPlaylist): void {
    this.selectedPlaylistId = playlist.id;
    this.playlistForm.patchValue({ playlistId: playlist.id });
  }

  get playlistIdControl() {
    return this.playlistForm.get('playlistId');
  }

  fillExample(id: string): void {
    this.playlistForm.patchValue({ playlistId: id });
  }

  resetForm(): void {
    this.playlistForm.reset();
    this.selectedPlaylistId = null;
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
    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.title = copy.title;
    modalRef.componentInstance.message = `${copy.message}\n\nPlaylist ID: ${playlistId}`;
    modalRef.componentInstance.confirmText = copy.confirmText;
    modalRef.componentInstance.cancelText = 'Keep tracks';

    modalRef.result.then(
      (confirmed) => {
        if (!confirmed) {
          return;
        }

        this.loadingService.show();
        const request$ =
          action === 'playlist'
            ? this.playlistService.deleteAllPlaylistTracks(playlistId)
            : this.playlistService.deleteAllPlaylistAndUserTracks(playlistId);

        request$
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.loadingService.hide())
          )
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
      },
      () => {
        // Modal dismissed
      }
    );
  }
}
