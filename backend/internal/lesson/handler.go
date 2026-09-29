package lesson

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

// GET /courses/:courseId/lessons
func (h *Handler) ListByCourse(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "courseId")
	lessons, err := h.svc.ListByCourse(courseID)
	if err != nil {
		common.Error(w, http.StatusInternalServerError, "LIST_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, lessons)
}

// GET /lessons/:id
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	l, err := h.svc.GetByID(id)
	if err != nil {
		common.Error(w, http.StatusNotFound, "LESSON_NOT_FOUND", "Lesson not found")
		return
	}
	common.JSON(w, http.StatusOK, l)
}

// POST /courses/:courseId/lessons
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "courseId")
	userID := middleware.UserIDFromCtx(r.Context())
	userRole := middleware.UserRoleFromCtx(r.Context())
	var dto CreateLessonDTO
	if err := common.ReadJSON(r, &dto); err != nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}
	l, err := h.svc.Create(courseID, userID, userRole, dto)
	if err != nil {
		if err.Error() == "FORBIDDEN" {
			common.Error(w, http.StatusForbidden, "FORBIDDEN", "You can only add lessons to your own courses")
			return
		}
		common.Error(w, http.StatusBadRequest, "CREATE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusCreated, l)
}

// PATCH /lessons/:id
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	userID := middleware.UserIDFromCtx(r.Context())
	userRole := middleware.UserRoleFromCtx(r.Context())
	var dto UpdateLessonDTO
	if err := common.ReadJSON(r, &dto); err != nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}
	l, err := h.svc.Update(id, userID, userRole, dto)
	if err != nil {
		if err.Error() == "FORBIDDEN" {
			common.Error(w, http.StatusForbidden, "FORBIDDEN", "You can only edit lessons in your own courses")
			return
		}
		common.Error(w, http.StatusInternalServerError, "UPDATE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, l)
}

// DELETE /lessons/:id
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	userID := middleware.UserIDFromCtx(r.Context())
	userRole := middleware.UserRoleFromCtx(r.Context())
	if err := h.svc.Delete(id, userID, userRole); err != nil {
		if err.Error() == "FORBIDDEN" {
			common.Error(w, http.StatusForbidden, "FORBIDDEN", "You can only delete lessons in your own courses")
			return
		}
		common.Error(w, http.StatusInternalServerError, "DELETE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, map[string]string{"message": "Lesson deleted"})
}
