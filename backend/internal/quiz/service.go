package quiz

import (
	"errors"
	"time"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetQuiz(id, userRole string) (*Quiz, error) {
	q, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// For students, sanitize options so isCorrect is not leaked!
	if userRole == "STUDENT" {
		sanitized := *q
		sanitizedQuestions := make([]Question, len(q.Questions))
		for i, qn := range q.Questions {
			sq := qn
			sanitizedOptions := make([]Option, len(qn.Options))
			for j, opt := range qn.Options {
				so := opt
				so.IsCorrect = false // hide correct answer from student
				sanitizedOptions[j] = so
			}
			sq.Options = sanitizedOptions
			sanitizedQuestions[i] = sq
		}
		sanitized.Questions = sanitizedQuestions
		return &sanitized, nil
	}

	return q, nil
}

func (s *Service) ListByCourse(courseID string) ([]Quiz, error) {
	return s.repo.FindByCourseID(courseID)
}

func (s *Service) CreateQuiz(userID, userRole string, dto CreateQuizDTO) (*Quiz, error) {
	if dto.Title == "" {
		return nil, errors.New("title is required")
	}

	if userRole == "INSTRUCTOR" {
		var instructorID string
		s.repo.db.Raw("SELECT instructor_id FROM courses WHERE id = ?", dto.CourseID).Scan(&instructorID)
		if instructorID != userID {
			return nil, errors.New("FORBIDDEN")
		}
	}

	q := &Quiz{
		CourseID:    dto.CourseID,
		LessonID:    dto.LessonID,
		Title:       dto.Title,
		Description: dto.Description,
	}
	if err := s.repo.CreateQuiz(q); err != nil {
		return nil, err
	}

	// Add initial questions if provided
	for _, qnDTO := range dto.Questions {
		qn := &Question{
			QuizID:    q.ID,
			Question:  qnDTO.Question,
			Type:      qnDTO.Type,
			Points:    qnDTO.Points,
			SortOrder: qnDTO.SortOrder,
		}
		if qn.Points <= 0 {
			qn.Points = 1
		}
		if qn.Type == "" {
			qn.Type = "multiple_choice"
		}
		if err := s.repo.CreateQuestion(qn); err != nil {
			continue
		}

		for _, optDTO := range qnDTO.Options {
			opt := &Option{
				QuestionID: qn.ID,
				OptionText: optDTO.OptionText,
				IsCorrect:  optDTO.IsCorrect,
			}
			_ = s.repo.db.Create(opt).Error
		}
	}

	return s.repo.FindByID(q.ID)
}

func (s *Service) UpdateQuiz(id, userID, userRole string, dto UpdateQuizDTO) (*Quiz, error) {
	q, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if userRole == "INSTRUCTOR" {
		_, instructorID, _ := s.repo.GetQuizCourseInstructor(id)
		if instructorID != userID {
			return nil, errors.New("FORBIDDEN")
		}
	}

	if dto.Title != nil {
		q.Title = *dto.Title
	}
	if dto.Description != nil {
		q.Description = dto.Description
	}
	if dto.LessonID != nil {
		q.LessonID = dto.LessonID
	}

	if err := s.repo.UpdateQuiz(q); err != nil {
		return nil, err
	}
	return s.repo.FindByID(q.ID)
}

func (s *Service) DeleteQuiz(id, userID, userRole string) error {
	if userRole == "INSTRUCTOR" {
		_, instructorID, _ := s.repo.GetQuizCourseInstructor(id)
		if instructorID != userID {
			return errors.New("FORBIDDEN")
		}
	}
	return s.repo.DeleteQuiz(id)
}

func (s *Service) SubmitAttempt(quizID, studentID string, dto SubmitAttemptDTO) (*AttemptResultResponse, error) {
	courseID, _, err := s.repo.GetQuizCourseInstructor(quizID)
	if err != nil {
		return nil, err
	}

	enrolled, err := s.repo.CheckEnrollment(studentID, courseID)
	if err != nil || !enrolled {
		return nil, errors.New("NOT_ENROLLED")
	}

	quiz, err := s.repo.FindByID(quizID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	attempt := &QuizAttempt{
		QuizID:      quizID,
		StudentID:   studentID,
		StartedAt:   now,
		CompletedAt: &now,
	}
	if err := s.repo.CreateAttempt(attempt); err != nil {
		return nil, err
	}

	// Map client answers
	userAnswers := make(map[string]string)
	for _, a := range dto.Answers {
		userAnswers[a.QuestionID] = a.OptionID
	}

	totalPoints := 0
	earnedPoints := 0
	var details []AttemptResultDetail

	for _, qn := range quiz.Questions {
		totalPoints += qn.Points

		var correctOptID string
		for _, opt := range qn.Options {
			if opt.IsCorrect {
				correctOptID = opt.ID
				break
			}
		}

		selectedOptID := userAnswers[qn.ID]
		isCorrect := (selectedOptID != "" && selectedOptID == correctOptID)
		pointsEarned := 0
		if isCorrect {
			pointsEarned = qn.Points
			earnedPoints += qn.Points
		}

		// Save answer record
		if selectedOptID != "" {
			_ = s.repo.SaveAnswer(&Answer{
				AttemptID:  attempt.ID,
				QuestionID: qn.ID,
				OptionID:   selectedOptID,
			})
		}

		details = append(details, AttemptResultDetail{
			QuestionID:       qn.ID,
			QuestionText:     qn.Question,
			SelectedOptionID: selectedOptID,
			CorrectOptionID:  correctOptID,
			IsCorrect:        isCorrect,
			PointsEarned:     pointsEarned,
			PointsPossible:   qn.Points,
		})
	}

	var scorePercent float64
	if totalPoints > 0 {
		scorePercent = (float64(earnedPoints) / float64(totalPoints)) * 100
	}
	attempt.Score = scorePercent
	_ = s.repo.UpdateAttempt(attempt)

	compStr := now.Format(time.RFC3339)
	return &AttemptResultResponse{
		AttemptID:    attempt.ID,
		QuizID:       quiz.ID,
		QuizTitle:    quiz.Title,
		Score:        scorePercent,
		TotalPoints:  totalPoints,
		EarnedPoints: earnedPoints,
		StartedAt:    attempt.StartedAt.Format(time.RFC3339),
		CompletedAt:  &compStr,
		Details:      details,
	}, nil
}

func (s *Service) GetAttempt(attemptID, userID, userRole string) (*AttemptResultResponse, error) {
	attempt, err := s.repo.FindAttemptByID(attemptID)
	if err != nil {
		return nil, err
	}

	if userRole == "STUDENT" && attempt.StudentID != userID {
		return nil, errors.New("FORBIDDEN")
	}

	quiz, err := s.repo.FindByID(attempt.QuizID)
	if err != nil {
		return nil, err
	}

	userAnswers := make(map[string]string)
	for _, a := range attempt.Answers {
		userAnswers[a.QuestionID] = a.OptionID
	}

	totalPoints := 0
	earnedPoints := 0
	var details []AttemptResultDetail

	for _, qn := range quiz.Questions {
		totalPoints += qn.Points

		var correctOptID string
		for _, opt := range qn.Options {
			if opt.IsCorrect {
				correctOptID = opt.ID
				break
			}
		}

		selectedOptID := userAnswers[qn.ID]
		isCorrect := (selectedOptID != "" && selectedOptID == correctOptID)
		pts := 0
		if isCorrect {
			pts = qn.Points
			earnedPoints += qn.Points
		}

		details = append(details, AttemptResultDetail{
			QuestionID:       qn.ID,
			QuestionText:     qn.Question,
			SelectedOptionID: selectedOptID,
			CorrectOptionID:  correctOptID,
			IsCorrect:        isCorrect,
			PointsEarned:     pts,
			PointsPossible:   qn.Points,
		})
	}

	var compStr *string
	if attempt.CompletedAt != nil {
		s := attempt.CompletedAt.Format(time.RFC3339)
		compStr = &s
	}

	return &AttemptResultResponse{
		AttemptID:    attempt.ID,
		QuizID:       quiz.ID,
		QuizTitle:    quiz.Title,
		Score:        attempt.Score,
		TotalPoints:  totalPoints,
		EarnedPoints: earnedPoints,
		StartedAt:    attempt.StartedAt.Format(time.RFC3339),
		CompletedAt:  compStr,
		Details:      details,
	}, nil
}

func (s *Service) ListAttempts(quizID, userID, userRole string) ([]QuizAttempt, error) {
	if userRole == "STUDENT" {
		return s.repo.ListAttemptsByQuizAndStudent(quizID, userID)
	}
	return s.repo.ListAttemptsByQuiz(quizID)
}

func (s *Service) ListMyAttempts(studentID string) ([]QuizAttempt, error) {
	return s.repo.ListAttemptsByStudent(studentID)
}
