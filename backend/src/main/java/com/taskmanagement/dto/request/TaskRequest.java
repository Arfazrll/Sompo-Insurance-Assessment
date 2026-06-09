package com.taskmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {

    @NotBlank(message = "Judul tugas tidak boleh kosong")
    @Size(min = 5, message = "Judul tugas minimal 5 karakter")
    private String title;

    private String description;

    private String status;

    @NotNull(message = "User yang ditugaskan tidak boleh kosong")
    private Long assignedToId;
}
