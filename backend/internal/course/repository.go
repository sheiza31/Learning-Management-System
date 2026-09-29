package course

import (
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindByID(id string) (*Course, error) {
	var c Course
	err := r.db.Where("id = ? OR slug = ?", id, id).First(&c).Error
	if err != nil {
		return nil, err
	}
	r.enrichCourse(&c)
	return &c, nil
}

func (r *Repository) FindBySlug(slug string) (*Course, error) {
	var c Course
	err := r.db.Where("slug = ?", slug).First(&c).Error
	if err != nil {
		return nil, err
	}
	r.enrichCourse(&c)
	return &c, nil
}

type ListFilter struct {
	Category string
	Level    string
	Status   string
	Search   string
}

func (r *Repository) List(filter ListFilter, offset, limit int) ([]Course, int64, error) {
	var courses []Course
	var total int64

	q := r.db.Model(&Course{})

	if filter.Status != "" {
		q = q.Where("status = ?", filter.Status)
	} else {
		// Public list defaults to published only
		q = q.Where("status = ?", "published")
	}
	if filter.Level != "" {
		q = q.Where("level = ?", filter.Level)
	}
	if filter.Category != "" {
		q = q.Where("category_id = ?", filter.Category)
	}
	if filter.Search != "" {
		q = q.Where("title ILIKE ?", "%"+filter.Search+"%")
	}

	q.Count(&total)
	err := q.Offset(offset).Limit(limit).Order("created_at DESC").Find(&courses).Error
	if err != nil {
		return nil, 0, err
	}

	for i := range courses {
		r.enrichCourse(&courses[i])
	}
	return courses, total, nil
}

func (r *Repository) ListByInstructor(instructorID string, offset, limit int) ([]Course, int64, error) {
	var courses []Course
	var total int64

	q := r.db.Model(&Course{}).Where("instructor_id = ?", instructorID)
	q.Count(&total)
	err := q.Offset(offset).Limit(limit).Order("created_at DESC").Find(&courses).Error
	if err != nil {
		return nil, 0, err
	}
	for i := range courses {
		r.enrichCourse(&courses[i])
	}
	return courses, total, nil
}

func (r *Repository) Create(c *Course) error {
	return r.db.Create(c).Error
}

func (r *Repository) Update(c *Course) error {
	return r.db.Save(c).Error
}

func (r *Repository) Delete(id string) error {
	return r.db.Delete(&Course{}, "id = ?", id).Error
}

// enrichCourse populates computed fields
func (r *Repository) enrichCourse(c *Course) {
	// Instructor name
	var name string
	r.db.Raw("SELECT full_name FROM users WHERE id = ?", c.InstructorID).Scan(&name)
	c.InstructorName = name

	// Category name
	if c.CategoryID != nil {
		var catName string
		r.db.Raw("SELECT name FROM categories WHERE id = ?", *c.CategoryID).Scan(&catName)
		c.CategoryName = catName
	}

	// Lesson count
	var lc int64
	r.db.Raw("SELECT COUNT(*) FROM lessons WHERE course_id = ?", c.ID).Scan(&lc)
	c.LessonCount = int(lc)

	// Enrollment count
	var ec int64
	r.db.Raw("SELECT COUNT(*) FROM enrollments WHERE course_id = ?", c.ID).Scan(&ec)
	c.EnrollmentCount = int(ec)
}
