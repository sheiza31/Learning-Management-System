package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/yourorg/lms-backend/internal/config"
	"github.com/yourorg/lms-backend/internal/user"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	userRepo *user.Repository
	cfg      *config.Config
}

func NewService(userRepo *user.Repository, cfg *config.Config) *Service {
	return &Service{userRepo: userRepo, cfg: cfg}
}

func (s *Service) Register(dto RegisterDTO) (*user.User, error) {
	// Check duplicate email
	existing, _ := s.userRepo.FindByEmail(dto.Email)
	if existing != nil {
		return nil, errors.New("EMAIL_TAKEN")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(dto.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	u := &user.User{
		FullName: dto.FullName,
		Email:    dto.Email,
		Password: string(hashed),
		Role:     user.RoleStudent, // Register as student by default
	}

	if err := s.userRepo.Create(u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *Service) Login(dto LoginDTO) (*user.User, string, error) {
	u, err := s.userRepo.FindByEmail(dto.Email)
	if err != nil {
		return nil, "", errors.New("INVALID_CREDENTIALS")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(dto.Password)); err != nil {
		return nil, "", errors.New("INVALID_CREDENTIALS")
	}

	token, err := s.generateToken(u)
	if err != nil {
		return nil, "", err
	}

	return u, token, nil
}

func (s *Service) GetMe(userID string) (*user.User, error) {
	return s.userRepo.FindByID(userID)
}

func (s *Service) generateToken(u *user.User) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":  u.ID,
		"role": string(u.Role),
		"iss":  s.cfg.JWTIssuer,
		"iat":  now.Unix(),
		"exp":  now.Add(s.cfg.JWTAccessTTL).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}
