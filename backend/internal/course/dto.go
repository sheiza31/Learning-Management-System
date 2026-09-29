package course

type CreateCourseDTO struct {
	Title       string  `json:"title"`
	Slug        string  `json:"slug"`
	Description *string `json:"description,omitempty"`
	CategoryID  *string `json:"categoryId,omitempty"`
	Thumbnail   *string `json:"thumbnail,omitempty"`
	TrailerURL  *string `json:"trailerUrl,omitempty"`
	Price       float64 `json:"price"`
	Level       string  `json:"level"`
}

type UpdateCourseDTO struct {
	Title       *string  `json:"title,omitempty"`
	Slug        *string  `json:"slug,omitempty"`
	Description *string  `json:"description,omitempty"`
	CategoryID  *string  `json:"categoryId,omitempty"`
	Thumbnail   *string  `json:"thumbnail,omitempty"`
	TrailerURL  *string  `json:"trailerUrl,omitempty"`
	Price       *float64 `json:"price,omitempty"`
	Level       *string  `json:"level,omitempty"`
	Status      *string  `json:"status,omitempty"`
}

