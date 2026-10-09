package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Transcript struct {
	ID         bson.ObjectID `bson:"_id,omitempty" json:"id"`
	MeetingID  string        `bson:"meetingId" json:"meetingId"`
	UserID     string        `bson:"userId" json:"userId"`
	Transcript string        `bson:"transcript" json:"transcript"`
	CreatedAt  time.Time     `bson:"createdAt" json:"createdAt"`
}
