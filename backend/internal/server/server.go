package server

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/yourorg/lms-backend/internal/auth"
	"github.com/yourorg/lms-backend/internal/category"
	"github.com/yourorg/lms-backend/internal/common"
	"github.com/yourorg/lms-backend/internal/config"
	"github.com/yourorg/lms-backend/internal/course"
	"github.com/yourorg/lms-backend/internal/enrollment"
	"github.com/yourorg/lms-backend/internal/lesson"
	custommiddleware "github.com/yourorg/lms-backend/internal/middleware"
	"github.com/yourorg/lms-backend/internal/progress"
	"github.com/yourorg/lms-backend/internal/quiz"
	"github.com/yourorg/lms-backend/internal/user"
	"gorm.io/gorm"
)

type Server struct {
	cfg    *config.Config
	db     *gorm.DB
	router *chi.Mux
}

func New(cfg *config.Config, db *gorm.DB) *Server {
	s := &Server{
		cfg:    cfg,
		db:     db,
		router: chi.NewRouter(),
	}

	s.setupMiddlewares()
	s.setupRoutes()

	return s
}

func (s *Server) setupMiddlewares() {
	s.router.Use(chimiddleware.RequestID)
	s.router.Use(chimiddleware.RealIP)
	s.router.Use(chimiddleware.Logger)
	s.router.Use(chimiddleware.Recoverer)
	s.router.Use(chimiddleware.Timeout(60 * time.Second))

	s.router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   s.cfg.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
}

func (s *Server) setupRoutes() {
	// Health check
	s.router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		common.JSON(w, http.StatusOK, map[string]string{"status": "ok", "time": time.Now().UTC().String()})
	})

	// Repositories
	userRepo := user.NewRepository(s.db)
	categoryRepo := category.NewRepository(s.db)
	courseRepo := course.NewRepository(s.db)
	lessonRepo := lesson.NewRepository(s.db)
	enrollmentRepo := enrollment.NewRepository(s.db)
	progressRepo := progress.NewRepository(s.db)
	quizRepo := quiz.NewRepository(s.db)

	// Services
	authSvc := auth.NewService(userRepo, s.cfg)
	userSvc := user.NewService(userRepo)
	categorySvc := category.NewService(categoryRepo)
	courseSvc := course.NewService(courseRepo)
	lessonSvc := lesson.NewService(lessonRepo)
	enrollmentSvc := enrollment.NewService(enrollmentRepo)
	progressSvc := progress.NewService(progressRepo)
	quizSvc := quiz.NewService(quizRepo)

	// Handlers
	authHandler := auth.NewHandler(authSvc)
	userHandler := user.NewHandler(userSvc)
	categoryHandler := category.NewHandler(categorySvc)
	courseHandler := course.NewHandler(courseSvc)
	lessonHandler := lesson.NewHandler(lessonSvc)
	enrollmentHandler := enrollment.NewHandler(enrollmentSvc)
	progressHandler := progress.NewHandler(progressSvc)
	quizHandler := quiz.NewHandler(quizSvc)

	// Auth middlewares
	requireAuth := custommiddleware.RequireAuth(s.cfg)
	requireAdmin := custommiddleware.RequireRole("ADMIN")
	requireInstructorOrAdmin := custommiddleware.RequireRole("INSTRUCTOR", "ADMIN")

	// API v1 route grouping
	s.router.Route("/api/v1", func(r chi.Router) {
		// Public Auth
		r.Post("/auth/register", authHandler.Register)
		r.Post("/auth/login", authHandler.Login)
		r.Post("/auth/logout", authHandler.Logout)
		r.Post("/auth/refresh", authHandler.Login) // placeholder refresh using login

		// Authenticated Auth
		r.Group(func(ar chi.Router) {
			ar.Use(requireAuth)
			ar.Get("/auth/me", authHandler.Me)
			ar.Get("/users/me", userHandler.GetMe)
			ar.Patch("/users/me", userHandler.UpdateMe)
		})

		// Admin User Management
		r.Group(func(ar chi.Router) {
			ar.Use(requireAuth)
			ar.Use(requireAdmin)
			ar.Get("/admin/users", userHandler.ListUsers)
			ar.Get("/admin/users/{id}", userHandler.GetUser)
			ar.Patch("/admin/users/{id}/role", userHandler.UpdateUserRole)
			ar.Delete("/admin/users/{id}", userHandler.DeleteUser)
			ar.Get("/admin/enrollments", enrollmentHandler.ListAll)
		})

		// Categories
		r.Get("/categories", categoryHandler.List)
		r.Get("/categories/{id}", categoryHandler.Get)
		r.Group(func(ar chi.Router) {
			ar.Use(requireAuth)
			ar.Use(requireAdmin)
			ar.Post("/categories", categoryHandler.Create)
			ar.Patch("/categories/{id}", categoryHandler.Update)
			ar.Delete("/categories/{id}", categoryHandler.Delete)
		})

		// Courses (Public)
		r.Get("/courses", courseHandler.List)
		r.Get("/courses/{id}", courseHandler.Get)
		r.Get("/courses/slug/{slug}", courseHandler.GetBySlug)

		// Courses (Instructor & Admin)
		r.Group(func(ar chi.Router) {
			ar.Use(requireAuth)
			ar.Use(requireInstructorOrAdmin)
			ar.Post("/courses", courseHandler.Create)
			ar.Patch("/courses/{id}", courseHandler.Update)
			ar.Delete("/courses/{id}", courseHandler.Delete)
			ar.Get("/instructor/courses", courseHandler.ListMyCourses)
			ar.Get("/instructor/students", enrollmentHandler.ListByInstructor)
		})

		// Lessons
		r.Get("/courses/{courseId}/lessons", lessonHandler.ListByCourse)
		r.Group(func(ar chi.Router) {
			ar.Use(requireAuth)
			ar.Get("/lessons/{id}", lessonHandler.Get)
			ar.With(requireInstructorOrAdmin).Post("/courses/{courseId}/lessons", lessonHandler.Create)
			ar.With(requireInstructorOrAdmin).Patch("/lessons/{id}", lessonHandler.Update)
			ar.With(requireInstructorOrAdmin).Delete("/lessons/{id}", lessonHandler.Delete)
		})

		// Enrollments
		r.Group(func(ar chi.Router) {
			ar.Use(requireAuth)
			ar.Post("/courses/{courseId}/enroll", enrollmentHandler.Enroll)
			ar.Get("/enrollments", enrollmentHandler.List)
			ar.Get("/enrollments/{id}", enrollmentHandler.Get)
			ar.Delete("/enrollments/{id}", enrollmentHandler.Delete)
		})

		// Progress
		r.Group(func(ar chi.Router) {
			ar.Use(requireAuth)
			ar.Get("/courses/{courseId}/progress", progressHandler.GetCourseProgress)
			ar.Post("/lessons/{lessonId}/progress", progressHandler.RecordProgress)
			ar.Patch("/lessons/{lessonId}/complete", progressHandler.ToggleComplete)
		})

		// Quizzes
		r.Group(func(ar chi.Router) {
			ar.Use(requireAuth)
			r.Get("/courses/{courseId}/quizzes", quizHandler.ListByCourse)
			ar.Get("/quizzes/{id}", quizHandler.Get)
			ar.Post("/quizzes/{id}/attempts", quizHandler.SubmitAttempt)
			ar.Get("/quizzes/{id}/attempts", quizHandler.ListAttempts)
			ar.Get("/attempts/{id}", quizHandler.GetAttempt)

			ar.With(requireInstructorOrAdmin).Post("/quizzes", quizHandler.Create)
			ar.With(requireInstructorOrAdmin).Patch("/quizzes/{id}", quizHandler.Update)
			ar.With(requireInstructorOrAdmin).Delete("/quizzes/{id}", quizHandler.Delete)
		})
	})
}

func (s *Server) Router() *chi.Mux {
	return s.router
}
