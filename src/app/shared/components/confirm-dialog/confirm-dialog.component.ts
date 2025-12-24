/**
 * Confirm Dialog Component
 * 
 * A reusable confirmation dialog component built with ng-bootstrap.
 * This component provides a standardized way to confirm destructive or
 * important actions throughout the application.
 * 
 * The dialog displays:
 * - A title describing the action
 * - A message explaining what will happen
 * - Confirm and Cancel buttons with customizable text
 * 
 * Usage:
 * The dialog is opened via NgbModal service and returns a boolean:
 * - true: User confirmed the action
 * - false: User cancelled the action
 * 
 * @component
 * @selector app-confirm-dialog
 * @standalone true
 * @author Clear Songs Development Team
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

/**
 * Dialog Data Interface
 * 
 * Defines the structure of data passed to the confirmation dialog.
 * All fields except title and message are optional and have defaults.
 * 
 * @interface DialogData
 */
export interface DialogData {
  /** Title displayed in the dialog header */
  title: string;
  
  /** Main message explaining the action to be confirmed */
  message: string;
  
  /** Optional text for the confirm button (defaults to 'Confirm') */
  confirmText?: string;
  
  /** Optional text for the cancel button (defaults to 'Cancel') */
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="onCancel()"></button>
    </div>
    <div class="modal-body">
      <p>{{ message }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="onCancel()">
        {{ cancelText || 'Cancel' }}
      </button>
      <button type="button" class="btn btn-danger" (click)="onConfirm()">
        {{ confirmText || 'Confirm' }}
      </button>
    </div>
  `,
  styles: [
    `
      .modal-body p {
        margin: 0;
        font-size: 16px;
        white-space: pre-line;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule]
})
export class ConfirmDialogComponent {
  title: string = '';
  message: string = '';
  confirmText?: string;
  cancelText?: string;

  /**
   * Constructor
   * 
   * @param activeModal - Reference to the modal instance, used to close the modal
   */
  constructor(public activeModal: NgbActiveModal) {}

  /**
   * Handles the cancel button click
   * 
   * Closes the modal and returns false, indicating the user cancelled
   * the action. The calling component can check this value to determine
   * whether to proceed with the action.
   */
  onCancel(): void {
    this.activeModal.close(false);
  }

  /**
   * Handles the confirm button click
   * 
   * Closes the modal and returns true, indicating the user confirmed
   * the action. The calling component should proceed with the action
   * when this method is called.
   */
  onConfirm(): void {
    this.activeModal.close(true);
  }
}
