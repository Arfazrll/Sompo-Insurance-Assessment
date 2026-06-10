import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { TaskResponse, TASK_STATUS_OPTIONS } from '../../../shared/models/task.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TaskDetailDialogComponent } from '../task-detail-dialog/task-detail-dialog.component';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {

  tasks: TaskResponse[] = [];
  statusOptions = TASK_STATUS_OPTIONS;
  isLoading = true;

  searchQuery = '';
  filterStatus = '';

  get displayedColumns(): string[] {
    return this.authService.isAdmin() 
      ? ['title', 'status', 'assignedTo', 'createdAt', 'actions']
      : ['title', 'status', 'assignedTo', 'createdAt'];
  }

  constructor(
    public authService: AuthService,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getAllTasks(this.searchQuery, this.filterStatus).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showNotification('Gagal memuat daftar tugas', true);
      }
    });
  }

  onSearch(): void {
    this.loadTasks();
  }

  onFilterChange(): void {
    this.loadTasks();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterStatus = '';
    this.loadTasks();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '560px',
      disableClose: true,
      panelClass: 'modern-dialog',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadTasks();
    });
  }

  openEditDialog(task: TaskResponse): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '560px',
      disableClose: true,
      panelClass: 'modern-dialog',
      data: { mode: 'edit', task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadTasks();
    });
  }

  openDetailDialog(task: TaskResponse): void {
    this.dialog.open(TaskDetailDialogComponent, {
      width: '560px',
      panelClass: 'modern-dialog',
      data: { task }
    });
  }

  updateStatus(task: TaskResponse, newStatus: string): void {
    this.taskService.updateTaskStatus(task.id, { status: newStatus }).subscribe({
      next: () => {
        this.showNotification('Status tugas berhasil diperbarui');
        this.loadTasks();
      },
      error: () => {
        this.showNotification('Gagal memperbarui status tugas', true);
      }
    });
  }

  deleteTask(task: TaskResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      panelClass: 'modern-dialog',
      data: {
        title: 'Konfirmasi Hapus',
        message: `Yakin ingin menghapus tugas "${task.title}"? Tindakan ini tidak dapat dibatalkan.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            this.showNotification('Tugas berhasil dihapus');
            this.loadTasks();
          },
          error: () => {
            this.showNotification('Gagal menghapus tugas', true);
          }
        });
      }
    });
  }

  getStatusLabel(status: string): string {
    return this.statusOptions.find(s => s.value === status)?.label || status;
  }

  private showNotification(message: string, isError = false): void {
    this.snackBar.open(message, 'Tutup', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: isError ? ['snack-error'] : ['snack-success']
    });
  }
}
