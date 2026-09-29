package user

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/yourorg/lms-backend/internal/common"
	"github.com/yourorg/lms-backend/internal/middleware"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

// GET /users/me
func (h *Handler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromCtx(r.Context())
	u, err := h.svc.GetByID(userID)
	if err != nil {
		common.Error(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found")
		return
	}
	common.JSON(w, http.StatusOK, ToUserResponse(u))
}

// PATCH /users/me
func (h *Handler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromCtx(r.Context())
	var dto UpdateProfileDTO
	if err := common.ReadJSON(r, &dto); err != nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}
	u, err := h.svc.UpdateProfile(userID, dto)
	if err != nil {
		common.Error(w, http.StatusInternalServerError, "UPDATE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, ToUserResponse(u))
}

// GET /admin/users
func (h *Handler) ListUsers(w http.ResponseWriter, r *http.Request) {
	page, limit := common.ParsePagination(r)
	offset := common.Offset(page, limit)
	users, total, err := h.svc.ListUsers(page, limit, offset)
	if err != nil {
		common.Error(w, http.StatusInternalServerError, "LIST_FAILED", err.Error())
		return
	}
	result := make([]UserResponse, len(users))
	for i, u := range users {
		result[i] = ToUserResponse(&u)
	}
	common.JSONWithMeta(w, http.StatusOK, result, common.PaginationMeta{
		Page: page, Limit: limit, Total: total, TotalPages: common.TotalPages(total, limit),
	})
}

// GET /admin/users/:id  (reuse GetMe pattern but with path param)
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	u, err := h.svc.GetByID(id)
	if err != nil {
		common.Error(w, http.StatusNotFound, "USER_NOT_FOUND", "User not found")
		return
	}
	common.JSON(w, http.StatusOK, ToUserResponse(u))
}

// PATCH /admin/users/:id/role
func (h *Handler) UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var dto AdminUpdateUserDTO
	if err := common.ReadJSON(r, &dto); err != nil || dto.Role == nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Role is required")
		return
	}
	u, err := h.svc.AdminUpdateRole(id, *dto.Role)
	if err != nil {
		common.Error(w, http.StatusInternalServerError, "UPDATE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, ToUserResponse(u))
}

// DELETE /admin/users/:id
func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.DeleteUser(id); err != nil {
		common.Error(w, http.StatusInternalServerError, "DELETE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, map[string]string{"message": "User deleted"})
}
