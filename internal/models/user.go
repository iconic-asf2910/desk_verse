package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID         bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Name       string        `bson:"name" json:"name"`
	Email      string        `bson:"email" json:"email"`
	Password   string        `bson:"password" json:"-"`
	Role       string        `bson:"role" json:"role"`
	Avatar     string        `bson:"avatar,omitempty" json:"avatar,omitempty"`
	IsVerified bool          `bson:"isVerified" json:"isVerified"`
	CreatedAt  time.Time     `bson:"createdAt" json:"createdAt"`
}

type PublicUser struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

func (u *User) ToPublic() PublicUser {
	return PublicUser{
		ID:    u.ID.Hex(),
		Name:  u.Name,
		Email: u.Email,
		Role:  u.Role,
	}
}

const (
	RoleManager    = "manager"
	RoleSupervisor = "supervisor"
	RoleTeamMember = "team_member"
)
