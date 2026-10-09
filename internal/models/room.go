package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Room struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"id"`
	WorkspaceID string        `bson:"workspaceId" json:"workspaceId"`
	Name        string        `bson:"name" json:"name"`
	Description string        `bson:"description,omitempty" json:"description,omitempty"`
	Type        string        `bson:"type" json:"type"`
	CreatedBy   string        `bson:"createdBy" json:"createdBy"`
	Members     []string      `bson:"members" json:"members"`
	CreatedAt   time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time     `bson:"updatedAt" json:"updatedAt"`
}
