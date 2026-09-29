package progress

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

// GET /courses/:courseId/progress
func (h *Handler) GetCourseProgress(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "courseId")
	studentID := middleware.UserIDFromCtx(r.Context())

	summary, err := h.svc.GetCourseProgress(studentID, courseID)
	if err != nil {
		if err.Error() == "NOT_ENROLLED" {
			common.Error(w, http.StatusForbidden, "NOT_ENROLLED", "You are not enrolled in this course")
			return
		}
		common.Error(w, http.StatusInternalServerError, "PROGRESS_FETCH_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, summary)
}

// POST /lessons/:lessonId/progress
func (h *Handler) RecordProgress(w http.ResponseWriter, r *http.Request) {
	lessonID := chi.URLParam(r, "lessonId")
	studentID := middleware.UserIDFromCtx(r.Context())

	var dto UpdateProgressDTO
	if err := common.ReadJSON(r, &dto); err != nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}

	prog, err := h.svc.RecordProgress(studentID, lessonID, dto)
	if err != nil {
		if err.Error() == "NOT_ENROLLED" {
			common.Error(w, http.StatusForbidden, "NOT_ENROLLED", "You are not enrolled in the course for this lesson")
			return
		}
		common.Error(w, http.StatusInternalServerError, "PROGRESS_RECORD_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, prog)
}

// PATCH /lessons/:lessonId/complete
func (h *Handler) ToggleComplete(w http.ResponseWriter, r *http.Request) {
	lessonID := chi.URLParam(r, "lessonId")
	studentID := middleware.UserIDFromCtx(r.Context())

	var body struct {
		Completed *bool `json:"completed"`
	}
	completed := true
	if err := common.ReadJSON(r, &body); err == nil && body.Completed != nil {
		completed = *body.Completed
	}

	prog, err := h.svc.CompleteLesson(studentID, lessonID, completed)
	if err != nil {
		if err.Error() == "NOT_ENROLLED" {
			common.Error(w, http.StatusForbidden, "NOT_ENROLLED", "You are not enrolled in the course for this lesson")
			return
		}
		common.Error(w, http.StatusInternalServerError, "PROGRESS_COMPLETE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, prog)
}
