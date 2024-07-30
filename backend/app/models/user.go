package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
    ID    primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	FullName string           `bson:"full_name" json:"full_name"`
    Password string           `bson:"password" json:"password"`
    Email string              `bson:"email" json:"email"`
}