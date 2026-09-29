package user

import (
	"errors"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetByID(id string) (*User, error) {
	return s.repo.FindByID(id)
}

func (s *Service) UpdateProfile(id string, dto UpdateProfileDTO) (*User, error) {
	u, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if dto.FullName != nil {
		u.FullName = *dto.FullName
	}
	if dto.Avatar != nil {
		resolved := ResolveAvatarURL(*dto.Avatar)
		u.Avatar = &resolved
	}
	if err := s.repo.Update(u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *Service) ListUsers(page, limit, offset int) ([]User, int64, error) {
	return s.repo.List(page, limit, offset)
}

func (s *Service) AdminUpdateRole(id string, role Role) (*User, error) {
	if role != RoleAdmin && role != RoleInstructor && role != RoleStudent {
		return nil, errors.New("invalid role")
	}
	u, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	u.Role = role
	if err := s.repo.Update(u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *Service) DeleteUser(id string) error {
	return s.repo.Delete(id)
}
