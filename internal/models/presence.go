package models

import "time"

// Presence records a user's online/away/offline status in the workspace.
type Presence struct {
	UserID      string    `bson:"userId" json:"userId"`
	WorkspaceID string    `bson:"workspaceId,omitempty" json:"workspaceId,omitempty"`
	Status      string    `bson:"status" json:"status"`
	LastSeen    time.Time `bson:"lastSeen" json:"lastSeen"`
	UpdatedAt   time.Time `bson:"updatedAt" json:"updatedAt"`
}

const (
	StatusOnline  = "online"
	StatusAway    = "away"
	StatusOffline = "offline"
)
