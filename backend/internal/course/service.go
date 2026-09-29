package course

import "errors"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetByID(id string) (*Course, error) {
	return s.repo.FindByID(id)
}

func (s *Service) GetBySlug(slug string) (*Course, error) {
	return s.repo.FindBySlug(slug)
}

func (s *Service) List(filter ListFilter, offset, limit int) ([]Course, int64, error) {
	return s.repo.List(filter, offset, limit)
}

func (s *Service) ListByInstructor(instructorID string, offset, limit int) ([]Course, int64, error) {
	return s.repo.ListByInstructor(instructorID, offset, limit)
}

func (s *Service) Create(instructorID string, dto CreateCourseDTO) (*Course, error) {
	if dto.Title == "" || dto.Slug == "" {
		return nil, errors.New("title and slug are required")
	}
	c := &Course{
		InstructorID: instructorID,
		Title:        dto.Title,
		Slug:         dto.Slug,
		Description:  dto.Description,
		CategoryID:   dto.CategoryID,
		Thumbnail:    dto.Thumbnail,
		TrailerURL:   dto.TrailerURL,
		Price:        dto.Price,
		Level:        dto.Level,
		Status:       "draft",
	}
	if c.Level == "" {
		c.Level = "beginner"
	}
	if err := s.repo.Create(c); err != nil {
		return nil, err
	}
	return s.repo.FindByID(c.ID)
}

func (s *Service) Update(id, userID, userRole string, dto UpdateCourseDTO) (*Course, error) {
	c, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	// Ownership check: instructors can only edit own courses (IDOR prevention)
	if userRole == "INSTRUCTOR" && c.InstructorID != userID {
		return nil, errors.New("FORBIDDEN")
	}

	if dto.Title != nil {
		c.Title = *dto.Title
	}
	if dto.Slug != nil {
		c.Slug = *dto.Slug
	}
	if dto.Description != nil {
		c.Description = dto.Description
	}
	if dto.CategoryID != nil {
		c.CategoryID = dto.CategoryID
	}
	if dto.Thumbnail != nil {
		c.Thumbnail = dto.Thumbnail
	}
	if dto.TrailerURL != nil {
		c.TrailerURL = dto.TrailerURL
	}
	if dto.Price != nil {
		c.Price = *dto.Price
	}
	if dto.Level != nil {
		c.Level = *dto.Level
	}
	if dto.Status != nil {
		c.Status = *dto.Status
	}

	if err := s.repo.Update(c); err != nil {
		return nil, err
	}
	return s.repo.FindByID(c.ID)
}

func (s *Service) Delete(id, userID, userRole string) error {
	c, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	if userRole == "INSTRUCTOR" && c.InstructorID != userID {
		return errors.New("FORBIDDEN")
	}
	return s.repo.Delete(id)
}
