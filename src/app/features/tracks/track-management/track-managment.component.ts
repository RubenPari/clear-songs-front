import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { TrackService } from '../../../core/services/track.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-track-management',
  templateUrl: './track-management.component.html',
  styleUrls: ['./track-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule
  ]
})
export class TrackManagementComponent implements OnInit {
  rangeForm: FormGroup;
  presetRanges = [
    { label: 'Singles (1 track)', min: 1, max: 1 },
    { label: 'EPs (2-5 tracks)', min: 2, max: 5 },
    { label: 'Small Collections (6-10 tracks)', min: 6, max: 10 },
    { label: 'Albums (11-20 tracks)', min: 11, max: 20 },
    { label: 'Large Collections (20+ tracks)', min: 20, max: null },
  ];

  constructor(
    private fb: FormBuilder,
    private trackService: TrackService,
    private notificationService: NotificationService,
    public loadingService: LoadingService,
    private dialog: MatDialog
  ) {
    this.rangeForm = this.fb.group(
      {
        min: [null, [Validators.min(0)]],
        max: [null, [Validators.min(0)]],
      },
      { validators: this.rangeValidator }
    );
  }

  ngOnInit(): void {}

  rangeValidator(form: FormGroup): { [key: string]: boolean } | null {
    const min = form.get('min')?.value;
    const max = form.get('max')?.value;

    if (min !== null && max !== null && min > max) {
      return { invalidRange: true };
    }
    return null;
  }

  deleteByRange(): void {
    if (this.rangeForm.invalid) {
      return;
    }

    const { min, max } = this.rangeForm.value;
    let message = 'Are you sure you want to delete tracks from artists with ';

    if (min !== null && max !== null) {
      message += `${min} to ${max} tracks?`;
    } else if (min !== null) {
      message += `at least ${min} tracks?`;
    } else if (max !== null) {
      message += `at most ${max} tracks?`;
    } else {
      this.notificationService.warning('Please specify at least one range value');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Tracks by Range',
        message: message,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadingService.show();
        this.trackService.deleteTracksByRange(min, max).subscribe({
          next: () => {
            this.notificationService.success('Successfully deleted tracks in the specified range');
            this.rangeForm.reset();
            this.loadingService.hide();
          },
          error: () => {
            this.notificationService.error('Failed to delete tracks');
            this.loadingService.hide();
          },
        });
      }
    });
  }

  applyPreset(preset: any): void {
    this.rangeForm.patchValue({
      min: preset.min,
      max: preset.max,
    });
  }
}
