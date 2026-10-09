package models

import "time"

type Task struct {
	ID          string    `bson:"_id,omitempty" json:"id"`
	WorkspaceID string    `bson:"workspaceId" json:"workspaceId"`
	Title       string    `bson:"title" json:"title"`
	Description string    `bson:"description" json:"description"`
	AssignedTo  string    `bson:"assignedTo" json:"assignedTo"`
	Status      string    `bson:"status" json:"status"`
	Priority    string    `bson:"priority" json:"priority"`
	CreatedBy   string    `bson:"createdBy" json:"createdBy"`
	CreatedAt   time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time `bson:"updatedAt" json:"updatedAt"`
}
