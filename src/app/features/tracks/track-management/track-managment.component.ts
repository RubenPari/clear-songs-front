/**
 * Track Management Component
 * 
 * This component provides tools for bulk deletion of tracks based on count ranges.
 * Users can delete tracks from artists that have a specific number of tracks,
 * making it easy to clean up singles, EPs, albums, or large collections.
 * 
 * Features:
 * - Range-based track deletion (min/max track count)
 * - Quick preset buttons for common scenarios (singles, EPs, albums, etc.)
 * - Custom range input with validation
 * - Range validation (max must be >= min)
 * - Confirmation dialogs before deletion
 * - Loading states and error handling
 * 
 * Use Cases:
 * - Remove all singles (artists with 1 track)
 * - Remove EPs (artists with 2-5 tracks)
 * - Remove albums (artists with 11-20 tracks)
 * - Remove large collections (artists with 20+ tracks)
 * - Custom ranges for specific needs
 * 
 * The component uses reactive forms with a custom validator to ensure
 * range validity. All operations create backups before deletion.
 * 
 * @component
 * @selector app-track-management
 * @standalone true
 * @author Clear Songs Development Team
 */
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { TrackService } from '../../../core/services/track.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

/**
 * Range Form Interface
 * 
 * Defines the structure of the range form with optional min and max values.
 * Both values can be null to allow flexible range queries (e.g., only min,
 * only max, or both).
 */
interface RangeForm {
  min: number | null;
  max: number | null;
}

/**
 * Preset Range Interface
 * 
 * Defines a preset range configuration with a human-readable label
 * and min/max values. Used for quick selection buttons.
 */
interface PresetRange {
  readonly label: string;
  readonly min: number | null;
  readonly max: number | null;
}

@Component({
  selector: 'app-track-management',
  templateUrl: './track-management.component.html',
  styleUrls: ['./track-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class TrackManagementComponent {
  /**
   * DestroyRef for managing subscription cleanup
   * Used with takeUntilDestroyed() to automatically unsubscribe when component is destroyed
   */
  private readonly destroyRef = inject(DestroyRef);
  
  /**
   * Reactive form for range input
   * Contains min and max fields with validation
   */
  rangeForm: FormGroup<{ min: any; max: any }>;
  
  /**
   * Preset range configurations for quick selection
   * 
   * These presets provide common deletion scenarios:
   * - Singles: Artists with exactly 1 track
   * - EPs: Artists with 2-5 tracks
   * - Small Collections: Artists with 6-10 tracks
   * - Albums: Artists with 11-20 tracks
   * - Large Collections: Artists with 20+ tracks
   * 
   * Users can click these buttons to quickly fill the form.
   */
  readonly presetRanges: readonly PresetRange[] = [
    { label: 'Singles (1 track)', min: 1, max: 1 },
    { label: 'EPs (2-5 tracks)', min: 2, max: 5 },
    { label: 'Small Collections (6-10 tracks)', min: 6, max: 10 },
    { label: 'Albums (11-20 tracks)', min: 11, max: 20 },
    { label: 'Large Collections (20+ tracks)', min: 20, max: null },
  ] as const;

  constructor(
    private fb: FormBuilder,
    private trackService: TrackService,
    private notificationService: NotificationService,
    public loadingService: LoadingService,
    private modalService: NgbModal
  ) {
    this.rangeForm = this.fb.group(
      {
        min: [null, [Validators.min(0)]],
        max: [null, [Validators.min(0)]],
      },
      { validators: TrackManagementComponent.rangeValidator }
    );
  }

  /**
   * Range Validator (Static)
   * 
   * Custom validator that ensures the max value is greater than or equal to
   * the min value when both are provided. This prevents invalid range queries.
   * 
   * The validator is static so it can be used without a component instance,
   * which is a best practice for validators in Angular.
   * 
   * @param form - The form control to validate (FormGroup with min/max fields)
   * @returns ValidationErrors object if validation fails, null if valid
   */
  static rangeValidator(form: AbstractControl): ValidationErrors | null {
    const min = form.get('min')?.value;
    const max = form.get('max')?.value;

    // If both min and max are provided, max must be >= min
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

    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.title = 'Delete Tracks by Range';
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.confirmText = 'Delete';
    modalRef.componentInstance.cancelText = 'Cancel';

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadingService.show();
          this.trackService.deleteTracksByRange(min, max)
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              finalize(() => this.loadingService.hide())
            )
            .subscribe({
              next: () => {
                this.notificationService.success('Successfully deleted tracks in the specified range');
                this.rangeForm.reset();
              },
              error: () => {
                this.notificationService.error('Failed to delete tracks');
              },
            });
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  applyPreset(preset: PresetRange): void {
    this.rangeForm.patchValue({
      min: preset.min,
      max: preset.max,
    });
  }
}
