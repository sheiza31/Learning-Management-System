package auth

// RegisterDTO matches POST /auth/register body
type RegisterDTO struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginDTO matches POST /auth/login body
type LoginDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse is returned after login/register
type AuthResponse struct {
	Token string `json:"token"`
	User  any    `json:"user"`
}
