package user

import (
	"time"
)

type Role string

const (
	RoleAdmin      Role = "ADMIN"
	RoleInstructor Role = "INSTRUCTOR"
	RoleStudent    Role = "STUDENT"
)

// User matches the users table from 04-database/schema.md
type User struct {
	ID        string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	FullName  string    `gorm:"column:full_name;not null" json:"fullName"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	Role      Role      `gorm:"not null" json:"role"`
	Avatar    *string   `json:"avatar,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (User) TableName() string { return "users" }
