package lesson

import "gorm.io/gorm"

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindByCourseID(courseID string) ([]Lesson, error) {
	var lessons []Lesson
	err := r.db.Where("course_id = ?", courseID).Order("sort_order ASC").Find(&lessons).Error
	return lessons, err
}

func (r *Repository) FindByID(id string) (*Lesson, error) {
	var l Lesson
	err := r.db.Where("id = ?", id).First(&l).Error
	if err != nil {
		return nil, err
	}
	return &l, nil
}

func (r *Repository) Create(l *Lesson) error {
	return r.db.Create(l).Error
}

func (r *Repository) Update(l *Lesson) error {
	return r.db.Save(l).Error
}

func (r *Repository) Delete(id string) error {
	return r.db.Delete(&Lesson{}, "id = ?", id).Error
}

// GetCourseInstructorID returns the instructor_id for a lesson's course
func (r *Repository) GetCourseInstructorID(lessonID string) (string, string, error) {
	var result struct {
		CourseID     string
		InstructorID string
	}
	err := r.db.Raw(`SELECT l.course_id, c.instructor_id FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = ?`, lessonID).Scan(&result).Error
	return result.CourseID, result.InstructorID, err
}
