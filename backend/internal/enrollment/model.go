package enrollment

import "time"

type Enrollment struct {
	ID          string     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	StudentID   string     `gorm:"not null" json:"studentId"`
	CourseID    string     `gorm:"not null" json:"courseId"`
	EnrolledAt  time.Time  `json:"enrolledAt"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`

	// Computed fields
	CourseTitle     string  `gorm:"-" json:"courseTitle,omitempty"`
	CourseThumbnail *string `gorm:"-" json:"courseThumbnail,omitempty"`
	Progress        float64 `gorm:"-" json:"progress"`
	StudentName     string  `gorm:"-" json:"studentName,omitempty"`
	StudentEmail    string  `gorm:"-" json:"studentEmail,omitempty"`
}

func (Enrollment) TableName() string { return "enrollments" }
