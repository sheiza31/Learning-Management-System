package quiz

import "time"

type Quiz struct {
	ID          string     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CourseID    string     `gorm:"not null" json:"courseId"`
	LessonID    *string    `json:"lessonId,omitempty"`
	Title       string     `gorm:"not null" json:"title"`
	Description *string    `json:"description,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`

	Questions []Question `gorm:"foreignKey:QuizID" json:"questions,omitempty"`
}

func (Quiz) TableName() string { return "quizzes" }

type Question struct {
	ID        string   `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	QuizID    string   `gorm:"not null" json:"quizId"`
	Question  string   `gorm:"not null" json:"question"`
	Type      string   `gorm:"default:'multiple_choice'" json:"type"`
	Points    int      `gorm:"default:1" json:"points"`
	SortOrder int      `gorm:"default:0" json:"sortOrder"`

	Options []Option `gorm:"foreignKey:QuestionID" json:"options,omitempty"`
}

func (Question) TableName() string { return "questions" }

type Option struct {
	ID         string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	QuestionID string `gorm:"not null" json:"questionId"`
	OptionText string `gorm:"not null" json:"optionText"`
	IsCorrect  bool   `gorm:"default:false" json:"isCorrect,omitempty"`
}

func (Option) TableName() string { return "options" }

type QuizAttempt struct {
	ID          string     `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	QuizID      string     `gorm:"not null" json:"quizId"`
	StudentID   string     `gorm:"not null" json:"studentId"`
	Score       float64    `gorm:"default:0" json:"score"`
	StartedAt   time.Time  `json:"startedAt"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`

	QuizTitle   string     `gorm:"-" json:"quizTitle,omitempty"`
	Answers     []Answer   `gorm:"foreignKey:AttemptID" json:"answers,omitempty"`
}

func (QuizAttempt) TableName() string { return "quiz_attempts" }

type Answer struct {
	ID         string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	AttemptID  string `gorm:"not null" json:"attemptId"`
	QuestionID string `gorm:"not null" json:"questionId"`
	OptionID   string `gorm:"not null" json:"optionId"`
}

func (Answer) TableName() string { return "answers" }
