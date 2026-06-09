package com.taskmanagement.config;

import com.taskmanagement.model.Role;
import com.taskmanagement.model.Task;
import com.taskmanagement.model.TaskStatus;
import com.taskmanagement.model.User;
import com.taskmanagement.repository.TaskRepository;
import com.taskmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        // Buat akun Admin
        User admin = User.builder()
                .fullName("Administrator")
                .email("admin@taskmanager.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ROLE_ADMIN)
                .build();
        admin = userRepository.save(admin);

        // Buat akun User
        User user = User.builder()
                .fullName("John Doe")
                .email("user@taskmanager.com")
                .password(passwordEncoder.encode("user1234"))
                .role(Role.ROLE_USER)
                .build();
        user = userRepository.save(user);

        // Buat sample tugas
        taskRepository.save(Task.builder()
                .title("Setup project backend")
                .description("Inisialisasi project Spring Boot dengan konfigurasi SQL Server")
                .status(TaskStatus.DONE)
                .assignedTo(admin)
                .build());

        taskRepository.save(Task.builder()
                .title("Implementasi autentikasi JWT")
                .description("Membuat sistem login dengan Spring Security dan JWT token")
                .status(TaskStatus.IN_PROGRESS)
                .assignedTo(user)
                .build());

        taskRepository.save(Task.builder()
                .title("Desain halaman dashboard")
                .description("Membuat tampilan dashboard utama dengan Angular Material")
                .status(TaskStatus.TODO)
                .assignedTo(user)
                .build());
    }
}
