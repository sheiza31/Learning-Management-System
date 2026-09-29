package enrollment

import "errors"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Enroll(studentID, courseID string) (*Enrollment, error) {
	// Check published
	if !s.repo.IsCoursePublished(courseID) {
		return nil, errors.New("COURSE_NOT_PUBLISHED")
	}
	// Check duplicate
	existing, _ := s.repo.FindByStudentAndCourse(studentID, courseID)
	if existing != nil {
		return nil, errors.New("ALREADY_ENROLLED")
	}

	e := &Enrollment{
		StudentID: studentID,
		CourseID:  courseID,
	}
	if err := s.repo.Create(e); err != nil {
		return nil, err
	}
	return s.repo.FindByID(e.ID)
}

func (s *Service) GetByID(id string) (*Enrollment, error) {
	return s.repo.FindByID(id)
}

func (s *Service) ListByStudent(studentID string) ([]Enrollment, error) {
	return s.repo.ListByStudent(studentID)
}

func (s *Service) ListByInstructor(instructorID string) ([]Enrollment, error) {
	return s.repo.ListByInstructor(instructorID)
}

func (s *Service) ListAll(offset, limit int) ([]Enrollment, int64, error) {
	return s.repo.ListAll(offset, limit)
}

func (s *Service) Delete(id string) error {
	return s.repo.Delete(id)
}
