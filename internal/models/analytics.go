package models

import "time"

type Analytics struct {
	ID          string    `bson:"_id,omitempty" json:"id"`
	WorkspaceID string    `bson:"workspaceId" json:"workspaceId"`
	Metric      string    `bson:"metric" json:"metric"`
	Value       float64   `bson:"value" json:"value"`
	Timestamp   time.Time `bson:"timestamp" json:"timestamp"`
}
