package course

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

// GET /courses (public - published only)
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	page, limit := common.ParsePagination(r)
	offset := common.Offset(page, limit)
	q := r.URL.Query()
	filter := ListFilter{
		Category: q.Get("category"),
		Level:    q.Get("level"),
		Status:   "published",
		Search:   q.Get("search"),
	}
	courses, total, err := h.svc.List(filter, offset, limit)
	if err != nil {
		common.Error(w, http.StatusInternalServerError, "LIST_FAILED", err.Error())
		return
	}
	common.JSONWithMeta(w, http.StatusOK, courses, common.PaginationMeta{
		Page: page, Limit: limit, Total: total, TotalPages: common.TotalPages(total, limit),
	})
}

// GET /courses/:id
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	c, err := h.svc.GetByID(id)
	if err != nil {
		common.Error(w, http.StatusNotFound, "COURSE_NOT_FOUND", "Course not found")
		return
	}
	common.JSON(w, http.StatusOK, c)
}

// GET /courses/slug/:slug
func (h *Handler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	c, err := h.svc.GetBySlug(slug)
	if err != nil {
		common.Error(w, http.StatusNotFound, "COURSE_NOT_FOUND", "Course not found")
		return
	}
	common.JSON(w, http.StatusOK, c)
}

// POST /courses (instructor/admin)
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromCtx(r.Context())
	var dto CreateCourseDTO
	if err := common.ReadJSON(r, &dto); err != nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}
	c, err := h.svc.Create(userID, dto)
	if err != nil {
		common.Error(w, http.StatusBadRequest, "CREATE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusCreated, c)
}

// PATCH /courses/:id (instructor/admin)
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	userID := middleware.UserIDFromCtx(r.Context())
	userRole := middleware.UserRoleFromCtx(r.Context())
	var dto UpdateCourseDTO
	if err := common.ReadJSON(r, &dto); err != nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}
	c, err := h.svc.Update(id, userID, userRole, dto)
	if err != nil {
		if err.Error() == "FORBIDDEN" {
			common.Error(w, http.StatusForbidden, "FORBIDDEN", "You can only edit your own courses")
			return
		}
		common.Error(w, http.StatusInternalServerError, "UPDATE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, c)
}

// DELETE /courses/:id (instructor/admin)
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	userID := middleware.UserIDFromCtx(r.Context())
	userRole := middleware.UserRoleFromCtx(r.Context())
	if err := h.svc.Delete(id, userID, userRole); err != nil {
		if err.Error() == "FORBIDDEN" {
			common.Error(w, http.StatusForbidden, "FORBIDDEN", "You can only delete your own courses")
			return
		}
		common.Error(w, http.StatusInternalServerError, "DELETE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, map[string]string{"message": "Course deleted"})
}

// GET /instructor/courses (own courses for instructor panel)
func (h *Handler) ListMyCourses(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromCtx(r.Context())
	page, limit := common.ParsePagination(r)
	offset := common.Offset(page, limit)
	courses, total, err := h.svc.ListByInstructor(userID, offset, limit)
	if err != nil {
		common.Error(w, http.StatusInternalServerError, "LIST_FAILED", err.Error())
		return
	}
	common.JSONWithMeta(w, http.StatusOK, courses, common.PaginationMeta{
		Page: page, Limit: limit, Total: total, TotalPages: common.TotalPages(total, limit),
	})
}
