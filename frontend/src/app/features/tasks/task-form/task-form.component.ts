import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { TaskResponse, TASK_STATUS_OPTIONS } from '../../../shared/models/task.model';
import { UserResponse } from '../../../shared/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../../../shared/models/api-error.model';

export interface TaskFormData {
  mode: 'create' | 'edit';
  task?: TaskResponse;
}

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {

  taskForm: FormGroup;
  statusOptions = TASK_STATUS_OPTIONS;
  users: UserResponse[] = [];
  isLoading = false;
  isEdit: boolean;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskFormData
  ) {
    this.isEdit = data.mode === 'edit';

    this.taskForm = this.fb.group({
      title: [data.task?.title || '', [Validators.required, Validators.minLength(5)]],
      description: [data.task?.description || ''],
      status: [data.task?.status || 'TODO', [Validators.required]],
      assignedToId: [data.task?.assignedTo?.id || null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (users) => this.users = users,
      error: () => this.errorMessage = 'Gagal memuat daftar user'
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request = this.taskForm.value;

    const action = this.isEdit
      ? this.taskService.updateTask(this.data.task!.id, request)
      : this.taskService.createTask(request);

    action.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit ? 'Tugas berhasil diperbarui' : 'Tugas berhasil dibuat',
          'Tutup',
          { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: ['snack-success'] }
        );
        this.dialogRef.close(true);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        const apiError = error.error as ApiErrorResponse;
        this.errorMessage = apiError?.message || 'Terjadi kesalahan';
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.taskForm.get(field);
    if (!control?.errors || !control.touched) return '';

    if (control.errors['required']) return 'Wajib diisi';
    if (control.errors['minlength']) return 'Minimal 5 karakter';
    return '';
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
