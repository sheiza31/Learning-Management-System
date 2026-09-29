package database

import (
	"fmt"
	"log"

	"github.com/yourorg/lms-backend/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(cfg *config.Config) *gorm.DB {
	dsn := cfg.DSN()

	logLevel := logger.Silent
	if cfg.AppEnv == "development" {
		logLevel = logger.Info
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB: %v", err)
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)

	// Auto migrate missing columns/indexes safely
	_ = db.Exec("ALTER TABLE lessons ADD COLUMN IF NOT EXISTS slug VARCHAR(220) NOT NULL DEFAULT '';").Error
	_ = db.Exec("CREATE INDEX IF NOT EXISTS idx_lessons_slug ON lessons(slug);").Error
	// Fill missing slugs for existing lessons if any
	_ = db.Exec("UPDATE lessons SET slug = LOWER(REPLACE(REPLACE(title, ' ', '-'), '/', '-')) WHERE slug = '' OR slug IS NULL;").Error

	fmt.Println("✓ Database connected")
	return db
}
