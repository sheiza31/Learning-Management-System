package progress

import (
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindEnrollment(studentID, courseID string) (string, error) {
	var enrollmentID string
	err := r.db.Raw("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?", studentID, courseID).Scan(&enrollmentID).Error
	return enrollmentID, err
}

func (r *Repository) FindEnrollmentByLesson(studentID, lessonID string) (string, string, error) {
	var result struct {
		EnrollmentID string
		CourseID     string
	}
	err := r.db.Raw(`
		SELECT e.id AS enrollment_id, l.course_id AS course_id
		FROM lessons l
		JOIN enrollments e ON e.course_id = l.course_id AND e.student_id = ?
		WHERE l.id = ?
	`, studentID, lessonID).Scan(&result).Error
	return result.EnrollmentID, result.CourseID, err
}

func (r *Repository) UpsertProgress(enrollmentID, lessonID string, watchedSeconds int, completed bool) (*LessonProgress, error) {
	p := LessonProgress{
		EnrollmentID:   enrollmentID,
		LessonID:       lessonID,
		WatchedSeconds: watchedSeconds,
		Completed:      completed,
		UpdatedAt:      time.Now(),
	}

	err := r.db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "enrollment_id"}, {Name: "lesson_id"}},
		DoUpdates: clause.Assignments(map[string]interface{}{
			"watched_seconds": gorm.Expr("GREATEST(lesson_progress.watched_seconds, EXCLUDED.watched_seconds)"),
			"completed":       gorm.Expr("lesson_progress.completed OR EXCLUDED.completed"),
			"updated_at":      time.Now(),
		}),
	}).Create(&p).Error

	if err != nil {
		return nil, err
	}

	var saved LessonProgress
	err = r.db.Where("enrollment_id = ? AND lesson_id = ?", enrollmentID, lessonID).First(&saved).Error
	return &saved, err
}

func (r *Repository) SetCompleted(enrollmentID, lessonID string, completed bool) (*LessonProgress, error) {
	p := LessonProgress{
		EnrollmentID:   enrollmentID,
		LessonID:       lessonID,
		Completed:      completed,
		UpdatedAt:      time.Now(),
	}

	err := r.db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "enrollment_id"}, {Name: "lesson_id"}},
		DoUpdates: clause.Assignments(map[string]interface{}{
			"completed":  completed,
			"updated_at": time.Now(),
		}),
	}).Create(&p).Error

	if err != nil {
		return nil, err
	}

	var saved LessonProgress
	err = r.db.Where("enrollment_id = ? AND lesson_id = ?", enrollmentID, lessonID).First(&saved).Error
	return &saved, err
}

func (r *Repository) GetCourseProgress(enrollmentID, courseID string) ([]LessonProgress, int, int, error) {
	var lessons []LessonProgress
	err := r.db.Where("enrollment_id = ?", enrollmentID).Find(&lessons).Error
	if err != nil {
		return nil, 0, 0, err
	}

	var totalLessons int64
	r.db.Raw("SELECT COUNT(*) FROM lessons WHERE course_id = ?", courseID).Scan(&totalLessons)

	var completedLessons int64
	r.db.Raw("SELECT COUNT(*) FROM lesson_progress WHERE enrollment_id = ? AND completed = true", enrollmentID).Scan(&completedLessons)

	return lessons, int(totalLessons), int(completedLessons), nil
}

func (r *Repository) UpdateEnrollmentCompletedAt(enrollmentID string, isCompleted bool) error {
	if isCompleted {
		now := time.Now()
		return r.db.Exec("UPDATE enrollments SET completed_at = ? WHERE id = ? AND completed_at IS NULL", now, enrollmentID).Error
	}
	return r.db.Exec("UPDATE enrollments SET completed_at = NULL WHERE id = ?", enrollmentID).Error
}
