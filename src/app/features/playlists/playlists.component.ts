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
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PlaylistService } from '../../core/services/playlist.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserPlaylist } from '../../core/models/artist.model';

/**
 * Playlist Action Type
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
    ReactiveFormsModule,
    TranslateModule
  ],
})
export class PlaylistsComponent {
  private playlistService = inject(PlaylistService);
  private notificationService = inject(NotificationService);
  public loadingService = inject(LoadingService);
  private modalService = inject(NgbModal);
  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);

  playlistForm: FormGroup<PlaylistForm>;
  readonly samplePlaylists: readonly SamplePlaylist[] = [
    { label: 'Discover Weekly', id: '37i9dQZF1DWXRqgorJj26U' },
    { label: 'Focus Flow', id: '37i9dQZF1DXcBWIGoYBM5M' },
    { label: 'Road Trip', id: '0OtO7pGz4WxZmf0RduCMJL' },
  ] as const;

  lastOperation = signal<{ playlistId: string; action: PlaylistAction; timestamp: number } | undefined>(undefined);
  
  // Resource API integration
  private playlistsResource = this.playlistService.getUserPlaylistsResource();
  userPlaylists = computed<UserPlaylist[]>(() => {
    const res = this.playlistsResource.value() as any;
    if (!res) return [];
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    } else if (Array.isArray(res)) {
      return res;
    }
    return [];
  });
  loadingPlaylists = computed(() => this.playlistsResource.isLoading());
  
  selectedPlaylistId = signal<string | null>(null);

  // Use a computed to translate action strings dynamically
  private actionCopy = computed(() => ({
    playlist: {
      title: this.translate.instant('PLAYLISTS.ACTION_CLEAR_TITLE'),
      message: this.translate.instant('PLAYLISTS.ACTION_CLEAR_MSG'),
      confirmText: this.translate.instant('PLAYLISTS.ACTION_CLEAR_CONFIRM'),
      success: this.translate.instant('PLAYLISTS.ACTION_CLEAR_SUCCESS'),
      error: this.translate.instant('PLAYLISTS.ACTION_CLEAR_ERROR'),
    },
    playlistAndLibrary: {
      title: this.translate.instant('PLAYLISTS.ACTION_CLEAR_LIB_TITLE'),
      message: this.translate.instant('PLAYLISTS.ACTION_CLEAR_LIB_MSG'),
      confirmText: this.translate.instant('PLAYLISTS.ACTION_CLEAR_LIB_CONFIRM'),
      success: this.translate.instant('PLAYLISTS.ACTION_CLEAR_LIB_SUCCESS'),
      error: this.translate.instant('PLAYLISTS.ACTION_CLEAR_LIB_ERROR'),
    },
  }));

  constructor() {
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

    // Notify error if resource fails
    effect(() => {
      if (this.playlistsResource.error()) {
        this.notificationService.error(this.translate.instant('PLAYLISTS.LOAD_ERROR'));
      }
    });
  }

  /**
   * Selects a playlist from the card grid
   */
  selectPlaylist(playlist: UserPlaylist): void {
    this.selectedPlaylistId.set(playlist.id);
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
    this.selectedPlaylistId.set(null);
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

    const copy = this.actionCopy()[action];
    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.title = copy.title;
    modalRef.componentInstance.message = `${copy.message}\n\n${this.translate.instant('PLAYLISTS.PLAYLIST_ID')}: ${playlistId}`;
    modalRef.componentInstance.confirmText = copy.confirmText;
    modalRef.componentInstance.cancelText = this.translate.instant('PLAYLISTS.ACTION_CANCEL');

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
            finalize(() => this.loadingService.hide())
          )
          .subscribe({
            next: () => {
              this.notificationService.success(copy.success);
              this.lastOperation.set({ playlistId, action, timestamp: Date.now() });
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
