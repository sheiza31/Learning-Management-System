package config

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv  string
	AppPort string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	JWTSecret    string
	JWTIssuer    string
	JWTAccessTTL time.Duration

	CORSOrigins []string
}

func Load() *Config {
	_ = godotenv.Load()

	return &Config{
		AppEnv:       getEnv("APP_ENV", "development"),
		AppPort:      getEnv("APP_PORT", "8080"),
		DBHost:       getEnv("DB_HOST", "localhost"),
		DBPort:       getEnv("DB_PORT", "5433"),
		DBUser:       getEnv("DB_USER", "postgres"),
		DBPassword:   getEnv("DB_PASSWORD", "postgres"),
		DBName:       getEnv("DB_NAME", "lms"),
		DBSSLMode:    getEnv("DB_SSLMODE", "disable"),
		JWTSecret:    getEnv("JWT_SECRET", ""),
		JWTIssuer:    getEnv("JWT_ISSUER", "lms-api"),
		JWTAccessTTL: parseDuration(getEnv("JWT_ACCESS_TTL", "15m")),
		CORSOrigins:  strings.Split(getEnv("CORS_ORIGINS", "http://localhost:5173"), ","),
	}
}

func (c *Config) DSN() string {
	return "host=" + c.DBHost +
		" port=" + c.DBPort +
		" user=" + c.DBUser +
		" password=" + c.DBPassword +
		" dbname=" + c.DBName +
		" sslmode=" + c.DBSSLMode +
		" TimeZone=UTC"
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func parseDuration(s string) time.Duration {
	d, err := time.ParseDuration(s)
	if err != nil {
		// try as plain minutes
		if mins, err2 := strconv.Atoi(s); err2 == nil {
			return time.Duration(mins) * time.Minute
		}
		return 15 * time.Minute
	}
	return d
}
