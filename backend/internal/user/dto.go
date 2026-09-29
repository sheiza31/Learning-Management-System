package user

// UpdateProfileDTO is used when a user updates their own profile
type UpdateProfileDTO struct {
	FullName *string `json:"fullName,omitempty"`
	Avatar   *string `json:"avatar,omitempty"`
}

// AdminUpdateUserDTO is used when admin changes a user's role
type AdminUpdateUserDTO struct {
	Role *Role `json:"role,omitempty"`
}

// UserResponse is the public representation of a user (never includes password)
type UserResponse struct {
	ID       string  `json:"id"`
	FullName string  `json:"fullName"`
	Email    string  `json:"email"`
	Role     Role    `json:"role"`
	Avatar   *string `json:"avatar,omitempty"`
}

func ToUserResponse(u *User) UserResponse {
	return UserResponse{
		ID:       u.ID,
		FullName: u.FullName,
		Email:    u.Email,
		Role:     u.Role,
		Avatar:   u.Avatar,
	}
}
