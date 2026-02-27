import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';

import { Track, ArtistSummary } from '../../core/models/artist.model';
import { TrackService } from '../../core/services/track.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-artist-tracks-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Tracks by {{ artist.name }}</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      @if (isLoading()) {
        <div class="text-center p-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading tracks...</p>
        </div>
      } @else if (tracks().length === 0) {
        <div class="text-center p-5">
          <i class="bi bi-music-note-beamed" style="font-size: 3rem; color: #cbd5e1;"></i>
          <p class="mt-2 text-muted">No tracks found for this artist.</p>
        </div>
      } @else {
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Album</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (track of tracks(); track track.id) {
                <tr>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="track-info">
                        <div class="fw-bold">{{ track.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ track.album }}</td>
                  <td class="text-end">
                    <button 
                      class="btn btn-sm btn-outline-danger" 
                      (click)="deleteTrack(track)"
                      [disabled]="deletingTrackId() === track.id"
                      title="Delete track"
                    >
                      @if (deletingTrackId() === track.id) {
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      } @else {
                        <i class="bi bi-trash"></i>
                      }
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.close(tracksChanged())">Close</button>
    </div>
  `,
  styles: [`
    .modal-body {
      max-height: 60vh;
      overflow-y: auto;
    }
    .track-info {
      line-height: 1.2;
    }
  `]
})
export class ArtistTracksModalComponent implements OnInit {
  @Input() artist!: ArtistSummary;

  public activeModal = inject(NgbActiveModal);
  private trackService = inject(TrackService);
  private notificationService = inject(NotificationService);
  private modalService = inject(NgbModal);
  
  tracks = signal<Track[]>([]);
  isLoading = signal<boolean>(true);
  tracksChanged = signal<boolean>(false);
  deletingTrackId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTracks();
  }

  loadTracks(): void {
    this.isLoading.set(true);
    this.trackService.getTracksByArtist(this.artist.id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: any) => {
          if (response && response.success && Array.isArray(response.data)) {
            this.tracks.set(response.data);
          } else if (Array.isArray(response)) {
            this.tracks.set(response);
          } else {
            this.tracks.set([]);
          }
        },
        error: () => this.notificationService.error('Failed to load tracks')
      });
  }

  deleteTrack(track: Track): void {
    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.title = 'Delete Track';
    modalRef.componentInstance.message = `Are you sure you want to delete "${track.name}" from your library?`;
    modalRef.componentInstance.confirmText = 'Delete';
    modalRef.componentInstance.cancelText = 'Cancel';

    modalRef.result.then((result) => {
      if (result) {
        this.deletingTrackId.set(track.id);
        this.trackService.deleteTrack(track.id)
          .pipe(finalize(() => this.deletingTrackId.set(null)))
          .subscribe({
            next: () => {
              this.notificationService.success('Track deleted successfully');
              this.tracks.update(t => t.filter(item => item.id !== track.id));
              this.tracksChanged.set(true);
              
              // If all tracks deleted, close modal
              if (this.tracks().length === 0) {
                this.activeModal.close(true);
              }
            },
            error: () => this.notificationService.error('Failed to delete track')
          });
      }
    }, () => {});
  }
}
