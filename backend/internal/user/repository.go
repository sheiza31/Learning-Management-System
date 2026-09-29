package user

import "gorm.io/gorm"

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindByEmail(email string) (*User, error) {
	var u User
	err := r.db.Where("email = ?", email).First(&u).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *Repository) FindByID(id string) (*User, error) {
	var u User
	err := r.db.Where("id = ?", id).First(&u).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *Repository) Create(u *User) error {
	return r.db.Create(u).Error
}

func (r *Repository) Update(u *User) error {
	return r.db.Save(u).Error
}

func (r *Repository) Delete(id string) error {
	return r.db.Delete(&User{}, "id = ?", id).Error
}

func (r *Repository) List(page, limit int, offset int) ([]User, int64, error) {
	var users []User
	var total int64

	r.db.Model(&User{}).Count(&total)
	err := r.db.Offset(offset).Limit(limit).Order("created_at DESC").Find(&users).Error
	return users, total, err
}
