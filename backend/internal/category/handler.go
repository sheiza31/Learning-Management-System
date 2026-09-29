package category

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/yourorg/lms-backend/internal/common"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

// GET /categories
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	cats, err := h.svc.List()
	if err != nil {
		common.Error(w, http.StatusInternalServerError, "LIST_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, cats)
}

// GET /categories/:id
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	c, err := h.svc.GetByID(id)
	if err != nil {
		common.Error(w, http.StatusNotFound, "CATEGORY_NOT_FOUND", "Category not found")
		return
	}
	common.JSON(w, http.StatusOK, c)
}

// POST /categories (admin)
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var dto CreateCategoryDTO
	if err := common.ReadJSON(r, &dto); err != nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}
	c, err := h.svc.Create(dto)
	if err != nil {
		common.Error(w, http.StatusBadRequest, "CREATE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusCreated, c)
}

// PATCH /categories/:id (admin)
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var dto UpdateCategoryDTO
	if err := common.ReadJSON(r, &dto); err != nil {
		common.Error(w, http.StatusBadRequest, "INVALID_BODY", "Invalid request body")
		return
	}
	c, err := h.svc.Update(id, dto)
	if err != nil {
		common.Error(w, http.StatusInternalServerError, "UPDATE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, c)
}

// DELETE /categories/:id (admin)
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.Delete(id); err != nil {
		common.Error(w, http.StatusInternalServerError, "DELETE_FAILED", err.Error())
		return
	}
	common.JSON(w, http.StatusOK, map[string]string{"message": "Category deleted"})
}
