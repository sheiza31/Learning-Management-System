package quiz_test

import (
	"testing"
)

type TestCase struct {
	totalPoints  int
	earnedPoints int
	expectedPerc float64
}

func calculateScore(earned, total int) float64 {
	if total == 0 {
		return 0
	}
	return (float64(earned) / float64(total)) * 100
}

func TestScoreCalculation(t *testing.T) {
	tests := []TestCase{
		{totalPoints: 20, earnedPoints: 20, expectedPerc: 100},
		{totalPoints: 20, earnedPoints: 10, expectedPerc: 50},
		{totalPoints: 30, earnedPoints: 15, expectedPerc: 50},
		{totalPoints: 0, earnedPoints: 0, expectedPerc: 0},
	}

	for _, tt := range tests {
		got := calculateScore(tt.earnedPoints, tt.totalPoints)
		if got != tt.expectedPerc {
			t.Errorf("calculateScore(%d, %d) = %v; want %v", tt.earnedPoints, tt.totalPoints, got, tt.expectedPerc)
		}
	}
}
