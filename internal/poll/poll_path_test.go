package poll

import (
	"net/http/httptest"
	"testing"
)

func TestGetPollIDFromPath(t *testing.T) {
	tests := []struct {
		name     string
		path     string
		expected string
	}{
		{"poll retrieval", "/api/polls/507f1f77bcf86cd799439011", "507f1f77bcf86cd799439011"},
		{"poll close", "/api/polls/507f1f77bcf86cd799439011/close", "507f1f77bcf86cd799439011"},
		{"poll close with extra", "/api/polls/abc/close", "abc"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("PUT", tt.path, nil)
			got := getPollIDFromPath(req)
			if got != tt.expected {
				t.Errorf("getPollIDFromPath(%q) = %q; want %q", tt.path, got, tt.expected)
			}
		})
	}
}
