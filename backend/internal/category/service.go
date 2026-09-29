package category

import "errors"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List() ([]Category, error) {
	return s.repo.FindAll()
}

func (s *Service) GetByID(id string) (*Category, error) {
	return s.repo.FindByID(id)
}

func (s *Service) Create(dto CreateCategoryDTO) (*Category, error) {
	if dto.Name == "" || dto.Slug == "" {
		return nil, errors.New("name and slug are required")
	}
	c := &Category{
		Name:        dto.Name,
		Slug:        dto.Slug,
		Description: dto.Description,
	}
	if err := s.repo.Create(c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *Service) Update(id string, dto UpdateCategoryDTO) (*Category, error) {
	c, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if dto.Name != nil {
		c.Name = *dto.Name
	}
	if dto.Slug != nil {
		c.Slug = *dto.Slug
	}
	if dto.Description != nil {
		c.Description = dto.Description
	}
	if err := s.repo.Update(c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *Service) Delete(id string) error {
	return s.repo.Delete(id)
}
