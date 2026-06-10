import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskResponse, TASK_STATUS_OPTIONS } from '../../../shared/models/task.model';

@Component({
  selector: 'app-task-detail-dialog',
  templateUrl: './task-detail-dialog.component.html',
  styleUrls: ['./task-detail-dialog.component.scss']
})
export class TaskDetailDialogComponent {
  statusOptions = TASK_STATUS_OPTIONS;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { task: TaskResponse }) {}

  getStatusLabel(status: string): string {
    return this.statusOptions.find(s => s.value === status)?.label || status;
  }
}
