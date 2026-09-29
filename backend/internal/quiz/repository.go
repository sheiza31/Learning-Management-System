package quiz

import (
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindByID(id string) (*Quiz, error) {
	var q Quiz
	err := r.db.Preload("Questions.Options").Where("id = ?", id).First(&q).Error
	if err != nil {
		return nil, err
	}
	return &q, nil
}

func (r *Repository) FindByCourseID(courseID string) ([]Quiz, error) {
	var quizzes []Quiz
	err := r.db.Preload("Questions.Options").Where("course_id = ?", courseID).Order("created_at ASC").Find(&quizzes).Error
	return quizzes, err
}

func (r *Repository) CreateQuiz(q *Quiz) error {
	return r.db.Create(q).Error
}

func (r *Repository) UpdateQuiz(q *Quiz) error {
	return r.db.Save(q).Error
}

func (r *Repository) DeleteQuiz(id string) error {
	return r.db.Delete(&Quiz{}, "id = ?", id).Error
}

func (r *Repository) CreateQuestion(qn *Question) error {
	return r.db.Create(qn).Error
}

func (r *Repository) DeleteQuestionsByQuizID(quizID string) error {
	// Find questions first
	var questions []Question
	if err := r.db.Where("quiz_id = ?", quizID).Find(&questions).Error; err != nil {
		return err
	}
	for _, qn := range questions {
		_ = r.db.Delete(&Option{}, "question_id = ?", qn.ID).Error
	}
	return r.db.Delete(&Question{}, "quiz_id = ?", quizID).Error
}

func (r *Repository) CreateAttempt(att *QuizAttempt) error {
	return r.db.Create(att).Error
}

func (r *Repository) SaveAnswer(ans *Answer) error {
	return r.db.Create(ans).Error
}

func (r *Repository) UpdateAttempt(att *QuizAttempt) error {
	return r.db.Save(att).Error
}

func (r *Repository) FindAttemptByID(id string) (*QuizAttempt, error) {
	var att QuizAttempt
	err := r.db.Preload("Answers").Where("id = ?", id).First(&att).Error
	if err != nil {
		return nil, err
	}
	// Fetch quiz title
	var title string
	r.db.Raw("SELECT title FROM quizzes WHERE id = ?", att.QuizID).Scan(&title)
	att.QuizTitle = title
	return &att, nil
}

func (r *Repository) ListAttemptsByQuiz(quizID string) ([]QuizAttempt, error) {
	var attempts []QuizAttempt
	err := r.db.Where("quiz_id = ?", quizID).Order("started_at DESC").Find(&attempts).Error
	return attempts, err
}

func (r *Repository) ListAttemptsByStudent(studentID string) ([]QuizAttempt, error) {
	var attempts []QuizAttempt
	err := r.db.Where("student_id = ?", studentID).Order("started_at DESC").Find(&attempts).Error
	for i := range attempts {
		var title string
		r.db.Raw("SELECT title FROM quizzes WHERE id = ?", attempts[i].QuizID).Scan(&title)
		attempts[i].QuizTitle = title
	}
	return attempts, err
}

func (r *Repository) ListAttemptsByQuizAndStudent(quizID, studentID string) ([]QuizAttempt, error) {
	var attempts []QuizAttempt
	err := r.db.Where("quiz_id = ? AND student_id = ?", quizID, studentID).Order("started_at DESC").Find(&attempts).Error
	for i := range attempts {
		var title string
		r.db.Raw("SELECT title FROM quizzes WHERE id = ?", attempts[i].QuizID).Scan(&title)
		attempts[i].QuizTitle = title
	}
	return attempts, err
}

func (r *Repository) GetQuizCourseInstructor(quizID string) (string, string, error) {
	var result struct {
		CourseID     string
		InstructorID string
	}
	err := r.db.Raw(`
		SELECT q.course_id, c.instructor_id
		FROM quizzes q
		JOIN courses c ON c.id = q.course_id
		WHERE q.id = ?
	`, quizID).Scan(&result).Error
	return result.CourseID, result.InstructorID, err
}

func (r *Repository) CheckEnrollment(studentID, courseID string) (bool, error) {
	var count int64
	err := r.db.Raw("SELECT COUNT(*) FROM enrollments WHERE student_id = ? AND course_id = ?", studentID, courseID).Scan(&count).Error
	return count > 0, err
}

func (r *Repository) GetCorrectOption(questionID string) (*Option, error) {
	var opt Option
	err := r.db.Where("question_id = ? AND is_correct = true", questionID).First(&opt).Error
	if err != nil {
		return nil, err
	}
	return &opt, nil
}
