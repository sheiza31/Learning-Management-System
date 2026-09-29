package progress

import "time"

type LessonProgress struct {
	ID             string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	EnrollmentID   string    `gorm:"not null" json:"enrollmentId"`
	LessonID       string    `gorm:"not null" json:"lessonId"`
	Completed      bool      `gorm:"default:false" json:"completed"`
	WatchedSeconds int       `gorm:"default:0" json:"watchedSeconds"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

func (LessonProgress) TableName() string { return "lesson_progress" }

type UpdateProgressDTO struct {
	WatchedSeconds *int  `json:"watchedSeconds,omitempty"`
	Completed      *bool `json:"completed,omitempty"`
}

type CourseProgressSummary struct {
	CourseID         string           `json:"courseId"`
	TotalLessons     int              `json:"totalLessons"`
	CompletedLessons int              `json:"completedLessons"`
	ProgressPercent  float64          `json:"progressPercent"`
	IsCompleted      bool             `json:"isCompleted"`
	Lessons          []LessonProgress `json:"lessons"`
}
