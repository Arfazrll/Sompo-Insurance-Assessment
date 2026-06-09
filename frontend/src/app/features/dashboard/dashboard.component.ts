import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { TaskResponse } from '../../shared/models/task.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  tasks: TaskResponse[] = [];
  isLoading = true;

  totalTasks = 0;
  todoCount = 0;
  inProgressCount = 0;
  doneCount = 0;

  constructor(
    public authService: AuthService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.totalTasks = tasks.length;
        this.todoCount = tasks.filter(t => t.status === 'TODO').length;
        this.inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
        this.doneCount = tasks.filter(t => t.status === 'DONE').length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getCompletionPercentage(): number {
    if (this.totalTasks === 0) return 0;
    return Math.round((this.doneCount / this.totalTasks) * 100);
  }
}
