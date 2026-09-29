package enrollment

import "gorm.io/gorm"

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindByStudentAndCourse(studentID, courseID string) (*Enrollment, error) {
	var e Enrollment
	err := r.db.Where("student_id = ? AND course_id = ?", studentID, courseID).First(&e).Error
	if err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *Repository) FindByID(id string) (*Enrollment, error) {
	var e Enrollment
	err := r.db.Where("id = ?", id).First(&e).Error
	if err != nil {
		return nil, err
	}
	r.enrichEnrollment(&e)
	return &e, nil
}

func (r *Repository) Create(e *Enrollment) error {
	return r.db.Create(e).Error
}

func (r *Repository) Delete(id string) error {
	return r.db.Delete(&Enrollment{}, "id = ?", id).Error
}

func (r *Repository) ListByStudent(studentID string) ([]Enrollment, error) {
	var enrollments []Enrollment
	err := r.db.Where("student_id = ?", studentID).Order("enrolled_at DESC").Find(&enrollments).Error
	if err != nil {
		return nil, err
	}
	for i := range enrollments {
		r.enrichEnrollment(&enrollments[i])
	}
	return enrollments, nil
}

func (r *Repository) ListByCourse(courseID string) ([]Enrollment, error) {
	var enrollments []Enrollment
	err := r.db.Where("course_id = ?", courseID).Order("enrolled_at DESC").Find(&enrollments).Error
	return enrollments, err
}

func (r *Repository) ListByInstructor(instructorID string) ([]Enrollment, error) {
	var enrollments []Enrollment
	err := r.db.Raw(`
		SELECT e.*
		FROM enrollments e
		INNER JOIN courses c ON c.id = e.course_id
		WHERE c.instructor_id = ?
		ORDER BY e.enrolled_at DESC
	`, instructorID).Scan(&enrollments).Error
	if err != nil {
		return nil, err
	}
	for i := range enrollments {
		r.enrichEnrollment(&enrollments[i])
		r.enrichStudent(&enrollments[i])
	}
	return enrollments, nil
}

func (r *Repository) ListAll(offset, limit int) ([]Enrollment, int64, error) {
	var enrollments []Enrollment
	var total int64
	r.db.Model(&Enrollment{}).Count(&total)
	err := r.db.Offset(offset).Limit(limit).Order("enrolled_at DESC").Find(&enrollments).Error
	for i := range enrollments {
		r.enrichEnrollment(&enrollments[i])
	}
	return enrollments, total, err
}

func (r *Repository) enrichEnrollment(e *Enrollment) {
	var title string
	var thumbnail *string
	r.db.Raw("SELECT title, thumbnail FROM courses WHERE id = ?", e.CourseID).Row().Scan(&title, &thumbnail)
	e.CourseTitle = title
	e.CourseThumbnail = thumbnail

	// Calculate progress: completed_lessons / total_lessons * 100
	var totalLessons int64
	var completedLessons int64
	r.db.Raw("SELECT COUNT(*) FROM lessons WHERE course_id = ?", e.CourseID).Scan(&totalLessons)
	r.db.Raw("SELECT COUNT(*) FROM lesson_progress WHERE enrollment_id = ? AND completed = true", e.ID).Scan(&completedLessons)
	if totalLessons > 0 {
		e.Progress = float64(completedLessons) / float64(totalLessons) * 100
	}
}

func (r *Repository) enrichStudent(e *Enrollment) {
	var fullName, email string
	r.db.Raw("SELECT full_name, email FROM users WHERE id = ?", e.StudentID).Row().Scan(&fullName, &email)
	e.StudentName = fullName
	e.StudentEmail = email
}

func (r *Repository) IsCoursePublished(courseID string) bool {
	var status string
	r.db.Raw("SELECT status FROM courses WHERE id = ?", courseID).Scan(&status)
	return status == "published"
}

func (r *Repository) Update(e *Enrollment) error {
	return r.db.Save(e).Error
}
