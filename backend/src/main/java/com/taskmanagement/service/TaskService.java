package com.taskmanagement.service;

import com.taskmanagement.dto.request.TaskRequest;
import com.taskmanagement.dto.request.UpdateStatusRequest;
import com.taskmanagement.dto.response.TaskResponse;
import com.taskmanagement.exception.ForbiddenException;
import com.taskmanagement.exception.ResourceNotFoundException;
import com.taskmanagement.model.Task;
import com.taskmanagement.model.TaskStatus;
import com.taskmanagement.model.User;
import com.taskmanagement.repository.TaskRepository;
import com.taskmanagement.repository.UserRepository;
import com.taskmanagement.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    // Mengambil semua tugas (Admin: semua, User: milik sendiri)
    public List<TaskResponse> getAllTasks(String search, String status) {
        CustomUserDetails currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

        List<Task> tasks;
        TaskStatus taskStatus = parseStatus(status);

        if (isAdmin) {
            tasks = filterTasks(search, taskStatus, null);
        } else {
            tasks = filterTasks(search, taskStatus, currentUser.getId());
        }

        return tasks.stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse getTaskById(Long id) {
        Task task = findTaskOrThrow(id);
        validateAccess(task);
        return mapToTaskResponse(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        User assignedUser = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("User dengan ID " + request.getAssignedToId() + " tidak ditemukan"));

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? TaskStatus.valueOf(request.getStatus()) : TaskStatus.TODO)
                .assignedTo(assignedUser)
                .build();

        Task savedTask = taskRepository.save(task);
        return mapToTaskResponse(savedTask);
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findTaskOrThrow(id);

        User assignedUser = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("User dengan ID " + request.getAssignedToId() + " tidak ditemukan"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? TaskStatus.valueOf(request.getStatus()) : task.getStatus());
        task.setAssignedTo(assignedUser);

        Task updatedTask = taskRepository.save(task);
        return mapToTaskResponse(updatedTask);
    }

    // Update status saja - bisa dilakukan oleh User pemilik tugas
    @Transactional
    public TaskResponse updateTaskStatus(Long id, UpdateStatusRequest request) {
        Task task = findTaskOrThrow(id);
        validateAccess(task);

        task.setStatus(TaskStatus.valueOf(request.getStatus()));
        Task updatedTask = taskRepository.save(task);
        return mapToTaskResponse(updatedTask);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = findTaskOrThrow(id);
        taskRepository.delete(task);
    }

    // Logika filter berdasarkan kombinasi parameter pencarian
    private List<Task> filterTasks(String search, TaskStatus status, Long userId) {
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasStatus = status != null;
        boolean hasUserId = userId != null;

        if (hasSearch && hasStatus && hasUserId) {
            return taskRepository.searchByTitleAndStatusAndUserId(search, status, userId);
        } else if (hasSearch && hasStatus) {
            return taskRepository.searchByTitleAndStatus(search, status);
        } else if (hasSearch && hasUserId) {
            return taskRepository.searchByTitleAndUserId(search, userId);
        } else if (hasStatus && hasUserId) {
            return taskRepository.findByAssignedToIdAndStatus(userId, status);
        } else if (hasSearch) {
            return taskRepository.searchByTitle(search);
        } else if (hasStatus) {
            return taskRepository.findByStatus(status);
        } else if (hasUserId) {
            return taskRepository.findByAssignedToId(userId);
        } else {
            return taskRepository.findAll();
        }
    }

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tugas dengan ID " + id + " tidak ditemukan"));
    }

    // Validasi akses: User hanya bisa akses tugas yang ditugaskan kepadanya
    private void validateAccess(Task task) {
        CustomUserDetails currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

        if (!isAdmin && !task.getAssignedTo().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Anda tidak memiliki akses ke tugas ini");
        }
    }

    private CustomUserDetails getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (CustomUserDetails) authentication.getPrincipal();
    }

    private TaskStatus parseStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return null;
        }
        try {
            return TaskStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private TaskResponse mapToTaskResponse(Task task) {
        TaskResponse.UserSummary userSummary = null;
        if (task.getAssignedTo() != null) {
            userSummary = TaskResponse.UserSummary.builder()
                    .id(task.getAssignedTo().getId())
                    .email(task.getAssignedTo().getEmail())
                    .fullName(task.getAssignedTo().getFullName())
                    .build();
        }

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus().name())
                .assignedTo(userSummary)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
