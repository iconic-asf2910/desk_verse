package models

import "time"

type Message struct {
	ID         string    `bson:"_id,omitempty" json:"id"`
	WorkspaceID string   `bson:"workspaceId" json:"workspaceId"`
	RoomID     string    `bson:"roomId" json:"roomId"`
	SenderID   string    `bson:"senderId" json:"senderId"`
	Content    string    `bson:"content" json:"content"`
	CreatedAt  time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt  time.Time `bson:"updatedAt" json:"updatedAt"`
}
