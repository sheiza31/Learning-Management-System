package quiz

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

// GET /quizzes/:id
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	userRole := middleware.UserRoleFromCtx(r.Context())
	q, err := h.svc.GetQuiz(id, userRole)
	if err != nil {
		common.Error(w, http.StatusNotFound, "QUIZ_NOT_FOUND", "Quiz not found")
		return
	}
	common.JSON(w, http.StatusOK, q)
}

// GET /courses/:courseId/quizzes
func (h *Handler) ListByCourse(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "courseId")
	quizzes, err := h.svc.ListByCourse(courseID)
	if err != nil {
		common.Error(w, http.StatusInternalServerError, "LIST_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, quizzes)
}

// POST /quizzes (instructor/admin)
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromCtx(r.Context())
	userRole := middleware.UserRoleFromCtx(r.Context())

	var dto CreateQuizDTO
	if err := common.ReadJSON(r, &dto); err != nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}

	q, err := h.svc.CreateQuiz(userID, userRole, dto)
	if err != nil {
		if err.Error() == "FORBIDDEN" {
			common.Error(w, http.StatusForbidden, "FORBIDDEN", "You can only create quizzes for your own courses")
			return
		}
		common.Error(w, http.StatusBadRequest, "CREATE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusCreated, q)
}

// PATCH /quizzes/:id (instructor/admin)
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	userID := middleware.UserIDFromCtx(r.Context())
	userRole := middleware.UserRoleFromCtx(r.Context())

	var dto UpdateQuizDTO
	if err := common.ReadJSON(r, &dto); err != nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}

	q, err := h.svc.UpdateQuiz(id, userID, userRole, dto)
	if err != nil {
		if err.Error() == "FORBIDDEN" {
			common.Error(w, http.StatusForbidden, "FORBIDDEN", "You can only update your own quizzes")
			return
		}
		common.Error(w, http.StatusInternalServerError, "UPDATE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, q)
}

// DELETE /quizzes/:id (instructor/admin)
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	userID := middleware.UserIDFromCtx(r.Context())
	userRole := middleware.UserRoleFromCtx(r.Context())

	if err := h.svc.DeleteQuiz(id, userID, userRole); err != nil {
		if err.Error() == "FORBIDDEN" {
			common.Error(w, http.StatusForbidden, "FORBIDDEN", "You can only delete your own quizzes")
			return
		}
		common.Error(w, http.StatusInternalServerError, "DELETE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, map[string]string{"message": "Quiz deleted"})
}

// POST /quizzes/:id/attempts (student submit)
func (h *Handler) SubmitAttempt(w http.ResponseWriter, r *http.Request) {
	quizID := chi.URLParam(r, "id")
	studentID := middleware.UserIDFromCtx(r.Context())

	var dto SubmitAttemptDTO
	if err := common.ReadJSON(r, &dto); err != nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}

	result, err := h.svc.SubmitAttempt(quizID, studentID, dto)
	if err != nil {
		if err.Error() == "NOT_ENROLLED" {
			common.Error(w, http.StatusForbidden, "NOT_ENROLLED", "You must be enrolled in the course to take this quiz")
			return
		}
		common.Error(w, http.StatusInternalServerError, "SUBMISSION_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusCreated, result)
}

// GET /quizzes/:id/attempts
func (h *Handler) ListAttempts(w http.ResponseWriter, r *http.Request) {
	quizID := chi.URLParam(r, "id")
	userID := middleware.UserIDFromCtx(r.Context())
	userRole := middleware.UserRoleFromCtx(r.Context())

	attempts, err := h.svc.ListAttempts(quizID, userID, userRole)
	if err != nil {
		common.Error(w, http.StatusInternalServerError, "LIST_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, attempts)
}

// GET /attempts/:id
func (h *Handler) GetAttempt(w http.ResponseWriter, r *http.Request) {
	attemptID := chi.URLParam(r, "id")
	userID := middleware.UserIDFromCtx(r.Context())
	userRole := middleware.UserRoleFromCtx(r.Context())

	result, err := h.svc.GetAttempt(attemptID, userID, userRole)
	if err != nil {
		if err.Error() == "FORBIDDEN" {
			common.Error(w, http.StatusForbidden, "FORBIDDEN", "Forbidden")
			return
		}
		common.Error(w, http.StatusNotFound, "ATTEMPT_NOT_FOUND", "Attempt not found")
		return
	}
	common.JSON(w, http.StatusOK, result)
}
