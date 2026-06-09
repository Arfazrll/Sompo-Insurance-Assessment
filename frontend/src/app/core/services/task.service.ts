import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskRequest, TaskResponse, UpdateStatusRequest } from '../../shared/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly API_URL = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAllTasks(search?: string, status?: string): Observable<TaskResponse[]> {
    let params = new HttpParams();
    if (search?.trim()) {
      params = params.set('search', search.trim());
    }
    if (status?.trim()) {
      params = params.set('status', status.trim());
    }
    return this.http.get<TaskResponse[]>(this.API_URL, { params });
  }

  getTaskById(id: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.API_URL}/${id}`);
  }

  createTask(request: TaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.API_URL, request);
  }

  updateTask(id: number, request: TaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.API_URL}/${id}`, request);
  }

  updateTaskStatus(id: number, request: UpdateStatusRequest): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.API_URL}/${id}/status`, request);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
