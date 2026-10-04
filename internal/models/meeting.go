package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Meeting struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"id"`
	WorkspaceID  string        `bson:"workspaceId" json:"workspaceId"`
	RoomID       string        `bson:"roomId" json:"roomId"`
	Title        string        `bson:"title" json:"title"`
	Description  string        `bson:"description,omitempty" json:"description,omitempty"`
	CreatedBy    string        `bson:"createdBy" json:"createdBy"`
	Participants []string      `bson:"participants" json:"participants"`
	StartTime    time.Time     `bson:"startTime" json:"startTime"`
	EndTime      time.Time     `bson:"endTime" json:"endTime"`
	MeetingCode  string        `bson:"meetingCode" json:"meetingCode"`
	MeetingLink  string        `bson:"meetingLink" json:"meetingLink"`
	Status       string        `bson:"status" json:"status"`
	CreatedAt    time.Time     `bson:"createdAt" json:"createdAt"`
}
