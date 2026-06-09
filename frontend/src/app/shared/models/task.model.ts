import { UserSummary } from './user.model';

export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRequest {
  title: string;
  description: string;
  status: string;
  assignedToId: number;
}

export interface UpdateStatusRequest {
  status: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' }
];
