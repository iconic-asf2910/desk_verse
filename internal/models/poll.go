package models

import "time"

// Vote records a single user's choice on a poll.
type Vote struct {
	UserID  string    `bson:"userId,omitempty" json:"userId"`
	Option  string    `bson:"option,omitempty" json:"option"`
	VotedAt time.Time `bson:"votedAt,omitempty" json:"votedAt,omitempty"`
}

// Poll is a workspace-scoped question with a fixed set of options that
// members can vote on until the poll is closed or expires.
type Poll struct {
	ID            string    `bson:"_id,omitempty" json:"id"`
	WorkspaceID   string    `bson:"workspaceId" json:"workspaceId"`
	Question      string    `bson:"question" json:"question"`
	Options       []string  `bson:"options" json:"options"`
	CreatedBy     string    `bson:"createdBy" json:"createdBy"`
	EligibleUsers []string  `bson:"eligibleUsers" json:"eligibleUsers"`
	Votes         []Vote    `bson:"votes" json:"votes"`
	Status        string    `bson:"status" json:"status"`
	CreatedAt     time.Time `bson:"createdAt" json:"createdAt"`
	ExpiresAt     time.Time `bson:"expiresAt,omitempty" json:"expiresAt,omitempty"`
}
