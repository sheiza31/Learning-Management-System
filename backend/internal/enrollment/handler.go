package enrollment

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

// POST /courses/:courseId/enroll
func (h *Handler) Enroll(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "courseId")
	studentID := middleware.UserIDFromCtx(r.Context())

	e, err := h.svc.Enroll(studentID, courseID)
	if err != nil {
		switch err.Error() {
		case "ALREADY_ENROLLED":
			common.Error(w, http.StatusConflict, "ALREADY_ENROLLED", "You are already enrolled in this course")
		case "COURSE_NOT_PUBLISHED":
			common.Error(w, http.StatusBadRequest, "COURSE_NOT_PUBLISHED", "Course is not published")
		default:
			common.Error(w, http.StatusInternalServerError, "ENROLL_FAILED", err.Error())
		}
		return
	}
	common.JSON(w, http.StatusCreated, e)
}

// GET /enrollments
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	studentID := middleware.UserIDFromCtx(r.Context())
	enrollments, err := h.svc.ListByStudent(studentID)
	if err != nil {
		common.Error(w, http.StatusInternalServerError, "LIST_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, enrollments)
}

// GET /enrollments/:id
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	e, err := h.svc.GetByID(id)
	if err != nil {
		common.Error(w, http.StatusNotFound, "ENROLLMENT_NOT_FOUND", "Enrollment not found")
		return
	}
	common.JSON(w, http.StatusOK, e)
}

// DELETE /enrollments/:id
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.Delete(id); err != nil {
		common.Error(w, http.StatusInternalServerError, "DELETE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, map[string]string{"message": "Enrollment deleted"})
}

// GET /instructor/students
func (h *Handler) ListByInstructor(w http.ResponseWriter, r *http.Request) {
	instructorID := middleware.UserIDFromCtx(r.Context())
	enrollments, err := h.svc.ListByInstructor(instructorID)
	if err != nil {
		common.Error(w, http.StatusInternalServerError, "LIST_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, enrollments)
}

// GET /admin/enrollments
func (h *Handler) ListAll(w http.ResponseWriter, r *http.Request) {
	page, limit := common.ParsePagination(r)
	offset := common.Offset(page, limit)
	enrollments, total, err := h.svc.ListAll(offset, limit)
	if err != nil {
		common.Error(w, http.StatusInternalServerError, "LIST_FAILED", err.Error())
		return
	}
	common.JSONWithMeta(w, http.StatusOK, enrollments, common.PaginationMeta{
		Page: page, Limit: limit, Total: total, TotalPages: common.TotalPages(total, limit),
	})
}
