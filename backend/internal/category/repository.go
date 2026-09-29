package category

import "gorm.io/gorm"

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindAll() ([]Category, error) {
	var cats []Category
	err := r.db.Order("name ASC").Find(&cats).Error
	return cats, err
}

func (r *Repository) FindByID(id string) (*Category, error) {
	var c Category
	err := r.db.Where("id = ?", id).First(&c).Error
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *Repository) FindBySlug(slug string) (*Category, error) {
	var c Category
	err := r.db.Where("slug = ?", slug).First(&c).Error
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *Repository) Create(c *Category) error {
	return r.db.Create(c).Error
}

func (r *Repository) Update(c *Category) error {
	return r.db.Save(c).Error
}

func (r *Repository) Delete(id string) error {
	return r.db.Delete(&Category{}, "id = ?", id).Error
}
