package lesson

import (
	"errors"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) ListByCourse(courseID string) ([]Lesson, error) {
	return s.repo.FindByCourseID(courseID)
}

func (s *Service) GetByID(id string) (*Lesson, error) {
	return s.repo.FindByID(id)
}

func (s *Service) Create(courseID, userID, userRole string, dto CreateLessonDTO) (*Lesson, error) {
	// Ownership check for instructors
	if userRole == "INSTRUCTOR" {
		if err := s.checkCourseOwnership(courseID, userID); err != nil {
			return nil, err
		}
	}
	if dto.Title == "" {
		return nil, errors.New("title is required")
	}
	l := &Lesson{
		CourseID:    courseID,
		Title:       dto.Title,
		Description: dto.Description,
		VideoURL:    dto.VideoURL,
		Content:     dto.Content,
		SortOrder:   dto.SortOrder,
		Duration:    dto.Duration,
	}
	if err := s.repo.Create(l); err != nil {
		return nil, err
	}
	return l, nil
}

func (s *Service) Update(id, userID, userRole string, dto UpdateLessonDTO) (*Lesson, error) {
	l, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if userRole == "INSTRUCTOR" {
		if err := s.checkCourseOwnership(l.CourseID, userID); err != nil {
			return nil, err
		}
	}
	if dto.Title != nil {
		l.Title = *dto.Title
	}
	if dto.Description != nil {
		l.Description = dto.Description
	}
	if dto.VideoURL != nil {
		l.VideoURL = dto.VideoURL
	}
	if dto.Content != nil {
		l.Content = dto.Content
	}
	if dto.SortOrder != nil {
		l.SortOrder = *dto.SortOrder
	}
	if dto.Duration != nil {
		l.Duration = *dto.Duration
	}
	if err := s.repo.Update(l); err != nil {
		return nil, err
	}
	return l, nil
}

func (s *Service) Delete(id, userID, userRole string) error {
	l, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	if userRole == "INSTRUCTOR" {
		if err := s.checkCourseOwnership(l.CourseID, userID); err != nil {
			return err
		}
	}
	return s.repo.Delete(id)
}

func (s *Service) checkCourseOwnership(courseID, userID string) error {
	var instructorID string
	s.repo.db.Raw("SELECT instructor_id FROM courses WHERE id = ?", courseID).Scan(&instructorID)
	if instructorID != userID {
		return errors.New("FORBIDDEN")
	}
	return nil
}
