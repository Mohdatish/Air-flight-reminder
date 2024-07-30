package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Token struct {
    ID    primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
    UserID primitive.ObjectID `bson:"user_id" json:"user_id"`
    Token   string               `bson:"token" json:"token"`
	DeviceToken string       `bson:"device_token" json:"device_token"`
}