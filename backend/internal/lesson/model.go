package lesson

import "time"

type Lesson struct {
	ID          string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CourseID    string    `gorm:"not null" json:"courseId"`
	Title       string    `gorm:"not null" json:"title"`
	Slug        string    `gorm:"not null;default:''" json:"slug"`
	Description *string   `json:"description,omitempty"`
	VideoURL    *string   `gorm:"column:video_url" json:"videoUrl,omitempty"`
	Content     *string   `json:"content,omitempty"`
	SortOrder   int       `gorm:"column:sort_order;default:0" json:"sortOrder"`
	Duration    int       `gorm:"default:0" json:"duration"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (Lesson) TableName() string { return "lessons" }

type CreateLessonDTO struct {
	Title       string  `json:"title"`
	Slug        *string `json:"slug,omitempty"`
	Description *string `json:"description,omitempty"`
	VideoURL    *string `json:"videoUrl,omitempty"`
	Content     *string `json:"content,omitempty"`
	SortOrder   int     `json:"sortOrder"`
	Duration    int     `json:"duration"`
}

type UpdateLessonDTO struct {
	Title       *string `json:"title,omitempty"`
	Slug        *string `json:"slug,omitempty"`
	Description *string `json:"description,omitempty"`
	VideoURL    *string `json:"videoUrl,omitempty"`
	Content     *string `json:"content,omitempty"`
	SortOrder   *int    `json:"sortOrder,omitempty"`
	Duration    *int    `json:"duration,omitempty"`
}
