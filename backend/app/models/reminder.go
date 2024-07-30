package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Reminder struct {
    UserID        primitive.ObjectID `bson:"user_id" json:"user_id"`
    FlightNumber  string             `bson:"flight_number" json:"flight_number"`
	From  string             		 `bson:"from" json:"from"`
	To  string                       `bson:"to" json:"to"`
}
