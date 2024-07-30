package service

import (
    "context"
    "log"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var UserCollection *mongo.Collection
var OTPCollection *mongo.Collection
var TokenCollection *mongo.Collection
var ReminderCollection *mongo.Collection

func ConnectDB() {
    var err error
    clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
    Client, err = mongo.Connect(context.Background(), clientOptions)

    if err != nil {
        log.Fatalf("Error connecting to MongoDB: %v", err)
    }

    err = Client.Ping(context.Background(), nil)
    if err != nil {
        log.Fatalf("Error pinging MongoDB: %v", err)
    }

    UserCollection = Client.Database("airline").Collection("users")
    OTPCollection = Client.Database("airline").Collection("otps")
    TokenCollection = Client.Database("airline").Collection("tokens")
    ReminderCollection = Client.Database("airline").Collection("reminders")

    log.Println("Connected to MongoDB!")
}
