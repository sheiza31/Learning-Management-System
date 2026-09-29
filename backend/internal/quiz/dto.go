package quiz

type CreateOptionDTO struct {
	OptionText string `json:"optionText"`
	IsCorrect  bool   `json:"isCorrect"`
}

type CreateQuestionDTO struct {
	Question  string            `json:"question"`
	Type      string            `json:"type"`
	Points    int               `json:"points"`
	SortOrder int               `json:"sortOrder"`
	Options   []CreateOptionDTO `json:"options"`
}

type CreateQuizDTO struct {
	CourseID    string              `json:"courseId"`
	LessonID    *string             `json:"lessonId,omitempty"`
	Title       string              `json:"title"`
	Description *string             `json:"description,omitempty"`
	Questions   []CreateQuestionDTO `json:"questions,omitempty"`
}

type UpdateQuizDTO struct {
	Title       *string `json:"title,omitempty"`
	Description *string `json:"description,omitempty"`
	LessonID    *string `json:"lessonId,omitempty"`
}

type SubmitAnswerDTO struct {
	QuestionID string `json:"questionId"`
	OptionID   string `json:"optionId"`
}

type SubmitAttemptDTO struct {
	Answers []SubmitAnswerDTO `json:"answers"`
}

type AttemptResultDetail struct {
	QuestionID       string `json:"questionId"`
	QuestionText     string `json:"questionText"`
	SelectedOptionID string `json:"selectedOptionId"`
	CorrectOptionID  string `json:"correctOptionID"`
	IsCorrect        bool   `json:"isCorrect"`
	PointsEarned     int    `json:"pointsEarned"`
	PointsPossible   int    `json:"pointsPossible"`
}

type AttemptResultResponse struct {
	AttemptID   string                `json:"attemptId"`
	QuizID      string                `json:"quizId"`
	QuizTitle   string                `json:"quizTitle"`
	Score       float64               `json:"score"`
	TotalPoints int                   `json:"totalPoints"`
	EarnedPoints int                  `json:"earnedPoints"`
	StartedAt   string                `json:"startedAt"`
	CompletedAt *string               `json:"completedAt,omitempty"`
	Details     []AttemptResultDetail `json:"details"`
}
