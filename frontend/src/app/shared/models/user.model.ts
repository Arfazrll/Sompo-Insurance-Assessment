export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

export interface UserSummary {
  id: number;
  email: string;
  fullName: string;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  role: string;
  lastLogin: string;
  createdAt: string;
}
