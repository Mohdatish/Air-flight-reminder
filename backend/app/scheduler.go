package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/robfig/cron/v3"
    "github.com/sendgrid/sendgrid-go"
    "github.com/sendgrid/sendgrid-go/helpers/mail"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "github.com/Mohdatish/models" 
)

// Constants
const (
    FlightAPIURL = "https://api.flightapi.io/trackbyroute"
)

// Fetch flight information from the FlightAPI
func fetchFlightInfo(flightNumber, from, to string) (models.FlightInfo, error) {
    date := time.Now().Format("20060102") // Current date in YYYYMMDD format
    url := fmt.Sprintf("%s/%s?api_key=%s&date=%s&airport1=%s&airport2=%s",
        FlightAPIURL, flightNumber, os.Getenv("FLIGHT_API_KEY"), date, from, to)

    resp, err := http.Get(url)
    if err != nil {
        return models.FlightInfo{}, fmt.Errorf("error making HTTP request to flight API: %v", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return models.FlightInfo{}, fmt.Errorf("flight API request failed with status code: %d", resp.StatusCode)
    }

    var flightInfo []models.FlightInfo
    err = json.NewDecoder(resp.Body).Decode(&flightInfo)
    if err != nil {
        return models.FlightInfo{}, fmt.Errorf("error decoding flight API response: %v", err)
    }

    if len(flightInfo) > 0 {
        return flightInfo[0], nil
    }

    return models.FlightInfo{}, fmt.Errorf("no flight information found")
}

// Send an email using SendGrid
func sendEmail(toEmail, subject, body string) error {
    from := mail.NewEmail("Your Airline Team", "yourairlineteam@example.com") // Use your registered email of SendGrid
    to := mail.NewEmail("", toEmail)
    content := mail.NewContent("text/plain", body)
    message := mail.NewV3MailInit(from, subject, to, content)

    client := sendgrid.NewSendClient(os.Getenv("SENDGRID_API_KEY"))
    _, err := client.Send(message)
    if err != nil {
        return fmt.Errorf("error sending email: %v", err)
    }

    return nil
}

// Fetch all reminders from the database
func fetchRemindersFromDatabase() ([]models.Reminder, error) {
    cursor, err := ReminderCollection.Find(context.Background(), bson.M{})
    if err != nil {
        return nil, err
    }
    defer cursor.Close(context.Background())

    var reminders []models.Reminder
    if err = cursor.All(context.Background(), &reminders); err != nil {
        return nil, err
    }

    return reminders, nil
}

// Fetch user details by ID, including device token
func fetchUserByID(userID primitive.ObjectID) (models.User, error) {
    var user models.User
    err := UserCollection.FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
    if err != nil {
        return models.User{}, err
    }

    // Fetch the device token for the user
    var token models.Token
    err = TokenCollection.FindOne(context.Background(), bson.M{"user_id": userID}).Decode(&token)
    if err != nil {
        log.Printf("Error fetching device token for user ID %s: %v", userID, err)
        // Handle error (e.g., log, return default token, etc.)
    } else {
        user.DeviceToken = token.DeviceToken
    }

    return user, nil
}

// Check reminders and send emails and FCM notifications
func checkAndSendFlightReminders() {
    log.Println("Running flight reminders check...")

    reminders, err := fetchRemindersFromDatabase()
    if err != nil {
        log.Printf("Error fetching reminders: %v", err)
        return
    }

    for _, reminder := range reminders {
        flightInfo, err := fetchFlightInfo(reminder.FlightNumber, reminder.From, reminder.To)
        if err != nil {
            log.Printf("Error fetching flight info for flight number %s: %v", reminder.FlightNumber, err)
            continue
        }

        departureTime, err := time.Parse("3:04 PM, Jan 2", flightInfo.DepartureTime)
        if err != nil {
            log.Printf("Error parsing departure time: %v", err)
            continue
        }

        if time.Until(departureTime) <= time.Hour {
            user, err := fetchUserByID(reminder.UserID)
            if err != nil {
                log.Printf("Error fetching user information for user ID %s: %v", reminder.UserID, err)
                continue
            }

            subject := "Flight Reminder"
            emailBody := fmt.Sprintf(`Dear %s,

We wanted to remind you about your upcoming flight details:

Airline: %s
Flight Number: %s
Status: %s
Operated By: %s
Departure Time: %s
Arrival Time: %s

Safe travels!

Best regards,
Your Airline Team`, user.FullName, flightInfo.Airline, flightInfo.FlightNumber, flightInfo.Status, flightInfo.OperatedBy, flightInfo.DepartureTime, flightInfo.ArrivalTime)

            err = sendEmail(user.Email, subject, emailBody)
            if err != nil {
                log.Printf("Error sending email to %s: %v", user.Email, err)
                continue
            }

            log.Printf("Reminder email sent successfully to %s", user.Email)

            // Send FCM notification
            fcmTitle := "Flight Reminder"
            fcmBody := fmt.Sprintf(`Dear %s,

We wanted to remind you about your upcoming flight details:

Airline: %s
Flight Number: %s
Status: %s
Operated By: %s
Departure Time: %s
Arrival Time: %s

Safe travels!`, user.FullName, flightInfo.Airline, flightInfo.FlightNumber, flightInfo.Status, flightInfo.OperatedBy, flightInfo.DepartureTime, flightInfo.ArrivalTime)

            err = sendFCMNotification(user.DeviceToken, fcmTitle, fcmBody)
            if err != nil {
                log.Printf("Error sending FCM notification to %s: %v", user.DeviceToken, err)
                continue
            }

            log.Printf("FCM notification sent successfully to %s", user.DeviceToken)
        }
    }
}

// SendFCMNotification sends a Firebase Cloud Messaging notification to a device
func sendFCMNotification(deviceToken, title, body string) error {
    // Implement your FCM logic here
    log.Printf("Sending FCM notification to %s: %s - %s", deviceToken, title, body)
    // Replace with actual FCM logic
    return nil
}

// Setup cron job for checking reminders
func SetupCronJob() {
    c := cron.New()
    c.AddFunc("@hourly", checkAndSendFlightReminders)
    c.Start()

    log.Println("Cron job started. Waiting for jobs to run...")
}
