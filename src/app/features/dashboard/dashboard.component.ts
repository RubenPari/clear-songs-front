import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { ArtistSummary } from '../../core/models/artist.model';
import { TrackService } from '../../core/services/track.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule
  ]
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = ['name', 'count', 'actions'];
  dataSource!: MatTableDataSource<ArtistSummary>;
  totalTracks = 0;
  totalArtists = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private trackService: TrackService,
    private notificationService: NotificationService,
    public loadingService: LoadingService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTrackSummary();
  }

  loadTrackSummary(): void {
    this.loadingService.show();
    this.trackService.getTrackSummary().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.calculateStats(data);
        this.loadingService.hide();
      },
      error: (error) => {
        this.notificationService.error('Failed to load track summary');
        this.loadingService.hide();
      },
    });
  }

  calculateStats(data: ArtistSummary[]): void {
    this.totalArtists = data.length;
    this.totalTracks = data.reduce((sum, artist) => sum + artist.count, 0);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  deleteArtistTracks(artist: ArtistSummary): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Artist Tracks',
        message: `Are you sure you want to delete all ${artist.count} tracks from ${artist.name}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadingService.show();
        this.trackService.deleteTracksByArtist(artist.id).subscribe({
          next: () => {
            this.notificationService.success(`Successfully deleted tracks from ${artist.name}`);
            this.loadTrackSummary();
          },
          error: () => {
            this.notificationService.error('Failed to delete tracks');
            this.loadingService.hide();
          },
        });
      }
    });
  }
}
