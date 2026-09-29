package course

import "time"

type Course struct {
	ID           string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	InstructorID string    `gorm:"not null" json:"instructorId"`
	CategoryID   *string   `json:"categoryId,omitempty"`
	Title        string    `gorm:"not null" json:"title"`
	Slug         string    `gorm:"uniqueIndex;not null" json:"slug"`
	Description  *string   `json:"description,omitempty"`
	Thumbnail    *string   `json:"thumbnail,omitempty"`
	TrailerURL   *string   `gorm:"column:trailer_url" json:"trailerUrl,omitempty"`
	Price        float64   `gorm:"default:0" json:"price"`
	Level        string    `gorm:"default:'beginner'" json:"level"`
	Status       string    `gorm:"default:'draft'" json:"status"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`

	// Preload associations
	InstructorName string `gorm:"-" json:"instructorName,omitempty"`
	CategoryName   string `gorm:"-" json:"categoryName,omitempty"`
	LessonCount    int    `gorm:"-" json:"lessonCount,omitempty"`
	EnrollmentCount int   `gorm:"-" json:"enrollmentCount,omitempty"`
}

func (Course) TableName() string { return "courses" }
