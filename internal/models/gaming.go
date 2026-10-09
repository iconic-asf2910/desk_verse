package models

import "time"

type GamingSession struct {
	ID          string    `bson:"_id,omitempty" json:"id"`
	WorkspaceID string    `bson:"workspaceId" json:"workspaceId"`
	Name        string    `bson:"name" json:"name"`
	HostID      string    `bson:"hostId" json:"hostId"`
	Players     []string  `bson:"players" json:"players"`
	Status      string    `bson:"status" json:"status"`
	CreatedAt   time.Time `bson:"createdAt" json:"createdAt"`
}
