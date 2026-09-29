package auth_test

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/yourorg/lms-backend/internal/config"
	"golang.org/x/crypto/bcrypt"
)

func TestPasswordHashing(t *testing.T) {
	rawPassword := "password123"
	hashed, err := bcrypt.GenerateFromPassword([]byte(rawPassword), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	if err := bcrypt.CompareHashAndPassword(hashed, []byte(rawPassword)); err != nil {
		t.Errorf("expected valid password comparison, got %v", err)
	}

	if err := bcrypt.CompareHashAndPassword(hashed, []byte("wrongpassword")); err == nil {
		t.Errorf("expected error on wrong password, got nil")
	}
}

func TestJWTGenerationAndValidation(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:    "test-secret-key-12345",
		JWTIssuer:    "lms-api-test",
		JWTAccessTTL: 15 * time.Minute,
	}

	now := time.Now()
	claims := jwt.MapClaims{
		"sub":  "user-uuid-123",
		"role": "STUDENT",
		"iss":  cfg.JWTIssuer,
		"iat":  now.Unix(),
		"exp":  now.Add(cfg.JWTAccessTTL).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, err := token.SignedString([]byte(cfg.JWTSecret))
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}

	parsed, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		return []byte(cfg.JWTSecret), nil
	})
	if err != nil || !parsed.Valid {
		t.Fatalf("expected valid token, got error: %v", err)
	}

	parsedClaims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok || parsedClaims["sub"] != "user-uuid-123" || parsedClaims["role"] != "STUDENT" {
		t.Errorf("claims mismatch: %v", parsedClaims)
	}
}
