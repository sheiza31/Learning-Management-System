package auth

import (
	"net/http"

	"github.com/yourorg/lms-backend/internal/common"
	"github.com/yourorg/lms-backend/internal/middleware"
	"github.com/yourorg/lms-backend/internal/user"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

// POST /auth/register
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var dto RegisterDTO
	if err := common.ReadJSON(r, &dto); err != nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}
	if dto.FullName == "" || dto.Email == "" || dto.Password == "" {
		common.Error(w, http.StatusBadRequest, "VALIDATION_ERROR", "fullName, email, and password are required")
		return
	}
	if len(dto.Password) < 6 {
		common.Error(w, http.StatusBadRequest, "VALIDATION_ERROR", "Password must be at least 6 characters")
		return
	}

	u, err := h.svc.Register(dto)
	if err != nil {
		if err.Error() == "EMAIL_TAKEN" {
			common.Error(w, http.StatusConflict, "EMAIL_TAKEN", "Email already registered")
			return
		}
		common.Error(w, http.StatusInternalServerError, "REGISTER_FAILED", err.Error())
		return
	}

	common.JSON(w, http.StatusCreated, user.ToUserResponse(u))
}

// POST /auth/login
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var dto LoginDTO
	if err := common.ReadJSON(r, &dto); err != nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}
	if dto.Email == "" || dto.Password == "" {
		common.Error(w, http.StatusBadRequest, "VALIDATION_ERROR", "email and password are required")
		return
	}

	u, token, err := h.svc.Login(dto)
	if err != nil {
		common.Error(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Invalid email or password")
		return
	}

	common.JSON(w, http.StatusOK, AuthResponse{
		Token: token,
		User:  user.ToUserResponse(u),
	})
}

// GET /auth/me
func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromCtx(r.Context())
	u, err := h.svc.GetMe(userID)
	if err != nil {
		common.Error(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found")
		return
	}
	common.JSON(w, http.StatusOK, user.ToUserResponse(u))
}

// POST /auth/logout (stateless - just acknowledge)
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	common.JSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}
