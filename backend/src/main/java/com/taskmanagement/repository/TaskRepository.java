package com.taskmanagement.repository;

import com.taskmanagement.model.Task;
import com.taskmanagement.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssignedToId(Long userId);

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByAssignedToIdAndStatus(Long userId, TaskStatus status);

    // Pencarian berdasarkan judul (case-insensitive)
    @Query("SELECT t FROM Task t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<Task> searchByTitle(@Param("title") String title);

    // Pencarian berdasarkan judul dan status
    @Query("SELECT t FROM Task t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :title, '%')) AND t.status = :status")
    List<Task> searchByTitleAndStatus(@Param("title") String title, @Param("status") TaskStatus status);

    // Pencarian tugas milik user tertentu berdasarkan judul
    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :userId AND LOWER(t.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<Task> searchByTitleAndUserId(@Param("title") String title, @Param("userId") Long userId);

    // Pencarian tugas milik user tertentu berdasarkan judul dan status
    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :userId AND LOWER(t.title) LIKE LOWER(CONCAT('%', :title, '%')) AND t.status = :status")
    List<Task> searchByTitleAndStatusAndUserId(@Param("title") String title, @Param("status") TaskStatus status, @Param("userId") Long userId);
}
