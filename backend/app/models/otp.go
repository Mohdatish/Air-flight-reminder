package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type OTP struct {
    ID    primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Email string             `bson:"email" json:"email"`
    OTP   int                `bson:"otp" json:"otp"`
}