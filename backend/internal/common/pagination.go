package common

import (
	"net/http"
	"strconv"
)

func ParsePagination(r *http.Request) (page, limit int) {
	page, _ = strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ = strconv.Atoi(r.URL.Query().Get("limit"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	return
}

func Offset(page, limit int) int {
	return (page - 1) * limit
}

func TotalPages(total int64, limit int) int {
	tp := int(total) / limit
	if int(total)%limit > 0 {
		tp++
	}
	return tp
}
