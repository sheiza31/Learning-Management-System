package progress

import (
	"errors"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetCourseProgress(studentID, courseID string) (*CourseProgressSummary, error) {
	enrollmentID, err := s.repo.FindEnrollment(studentID, courseID)
	if err != nil || enrollmentID == "" {
		return nil, errors.New("NOT_ENROLLED")
	}

	lessons, total, completed, err := s.repo.GetCourseProgress(enrollmentID, courseID)
	if err != nil {
		return nil, err
	}

	var percent float64
	if total > 0 {
		percent = (float64(completed) / float64(total)) * 100
	}

	isCompleted := total > 0 && completed >= total

	return &CourseProgressSummary{
		CourseID:         courseID,
		TotalLessons:     total,
		CompletedLessons: completed,
		ProgressPercent:  percent,
		IsCompleted:      isCompleted,
		Lessons:          lessons,
	}, nil
}

func (s *Service) RecordProgress(studentID, lessonID string, dto UpdateProgressDTO) (*LessonProgress, error) {
	enrollmentID, courseID, err := s.repo.FindEnrollmentByLesson(studentID, lessonID)
	if err != nil || enrollmentID == "" {
		return nil, errors.New("NOT_ENROLLED")
	}

	watched := 0
	if dto.WatchedSeconds != nil {
		watched = *dto.WatchedSeconds
	}
	completed := false
	if dto.Completed != nil {
		completed = *dto.Completed
	}

	prog, err := s.repo.UpsertProgress(enrollmentID, lessonID, watched, completed)
	if err != nil {
		return nil, err
	}

	// Check if all lessons are now complete
	_, total, completedCount, _ := s.repo.GetCourseProgress(enrollmentID, courseID)
	if total > 0 && completedCount >= total {
		_ = s.repo.UpdateEnrollmentCompletedAt(enrollmentID, true)
	}

	return prog, nil
}

func (s *Service) CompleteLesson(studentID, lessonID string, completed bool) (*LessonProgress, error) {
	enrollmentID, courseID, err := s.repo.FindEnrollmentByLesson(studentID, lessonID)
	if err != nil || enrollmentID == "" {
		return nil, errors.New("NOT_ENROLLED")
	}

	prog, err := s.repo.SetCompleted(enrollmentID, lessonID, completed)
	if err != nil {
		return nil, err
	}

	// Update enrollment completion status
	_, total, completedCount, _ := s.repo.GetCourseProgress(enrollmentID, courseID)
	if total > 0 && completedCount >= total {
		_ = s.repo.UpdateEnrollmentCompletedAt(enrollmentID, true)
	} else {
		_ = s.repo.UpdateEnrollmentCompletedAt(enrollmentID, false)
	}

	return prog, nil
}
