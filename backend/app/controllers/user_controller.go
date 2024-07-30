// app/controllers/user_controller.go
package controllers

import (
    "context"
    "crypto/rand"
    "math/big"
    "time"
    "github.com/dgrijalva/jwt-go"
    "golang.org/x/crypto/bcrypt"
    "github.com/gofiber/fiber/v2"
    "github.com/Mohdatish/air-backend/app/models"
    "github.com/Mohdatish/air-backend/app/service"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
)

var jwtSecret = []byte("your_secret_key")

// Generate a random OTP of a specified length
func generateRandomOTP(length int) (int, error) {
    const charset = "0123456789"
    otp := make([]byte, length)
    for i := range otp {
        num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
        if err != nil {
            return 0, err
        }
        otp[i] = charset[num.Int64()]
    }
    otpInt := 0
    for i := 0; i < length; i++ {
        otpInt = otpInt*10 + int(otp[i]-'0')
    }
    return otpInt, nil
}


func GenerateOtp(c *fiber.Ctx) error {
    var input struct {
        Email string `json:"email"`
    }
    if err := c.BodyParser(&input); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "status":  false,
            "code": 400,
            "message": "Cannot parse request",
        })
    }
    // Check if the user with the email exists in the users collection
    var existingUser models.User
    err := service.UserCollection.FindOne(context.Background(), bson.M{"email": input.Email}).Decode(&existingUser)
    if err == nil {
        // User exists
        return c.Status(fiber.StatusConflict).JSON(fiber.Map{
            "status":  false,
            "code": 201,
            "message": "Email already exists",
        })
    }

    // Generate an OTP
    otp, err := generateRandomOTP(6) // Length of 6 for the OTP
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  false,
            "code": 400,
            "message": "Error generating OTP",
        })
    }

    // Create OTP record
    otpRecord := models.OTP{
        ID:    primitive.NewObjectID(),
        Email: input.Email,
        OTP:   otp,
    }

    // Save the OTP record to the otps collection
    _, err = service.OTPCollection.InsertOne(context.Background(), otpRecord)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  false,
            "code": 400,
            "message": "Error inserting OTP",
        })
    }

    // Return the OTP record
    return c.Status(fiber.StatusCreated).JSON(fiber.Map{
        "status":  true,
        "code": 200,
        "message": "Please check your email, we sent you otp for verification!",
    })
}

func VerifyOtp(c *fiber.Ctx) error {
    var input struct {
        Email string `json:"email"`
        OTP   int    `json:"otp"`
    }

    if err := c.BodyParser(&input); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "status":  false,
            "code":   400,
            "message": "Cannot parse request",
        })
    }

    var checkOtp models.OTP
    err := service.OTPCollection.FindOne(context.Background(), bson.M{"email": input.Email, "otp": input.OTP}).Decode(&checkOtp)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                "status":  false,
                "code":   404,
                "message": "Invalid OTP",
            })
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  false,
            "code":   500,
            "message": "Error while verifying OTP.",
        })
    }

    // Deleting the OTP after verification
    service.OTPCollection.FindOneAndDelete(context.Background(), bson.M{"email": input.Email, "otp": input.OTP}).Decode(&checkOtp)

    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "status":  true,
        "code":   200,
        "message": "Email verified successfully. Please log in to your account.",
    })
}

func Register(c *fiber.Ctx) error {
    var input struct {
        Email        string `json:"email"`
        FullName     string `json:"full_name"` 
        Password     string `json:"password"`
        DeviceToken  string `json:"device_token"`
    }
    
    if err := c.BodyParser(&input); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "status":  false,
            "code": 400,
            "message": "Cannot parse request",
        })
    }

    // Hash the password before storing
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  false,
            "code": 400,
            "message": "Error hashing password",
        })
    }

    userRecord := models.User{
        ID:           primitive.NewObjectID(),
        Email:        input.Email,
        FullName:     input.FullName,
        Password:     string(hashedPassword), // Store hashed password
    }

    _, err = service.UserCollection.InsertOne(context.Background(), userRecord)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  false,
            "code": 400,
            "message": "Error while registering user",
        })
    }

    // Return success response
    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "status":  true,
        "code":    200,
        "message": "Registered successfully",
    })
}

func Login(c *fiber.Ctx) error {
    var input struct {
        Email        string `json:"email"`
        Password     string `json:"password"`
        DeviceToken  string `json:"device_token"`
    }

    if err := c.BodyParser(&input); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "status":  false,
            "code": fiber.StatusBadRequest,
            "message": "Cannot parse request",
        })
    }

    // Find the user by email
    var user models.User
    err := service.UserCollection.FindOne(context.Background(), bson.M{"email": input.Email}).Decode(&user)
    if err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "status":  false,
            "code": fiber.StatusUnauthorized,
            "message": "Invalid email",
        })
    }

    // Verify the provided password
    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
    if err != nil {
        return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
            "status":  false,
            "code": fiber.StatusUnauthorized,
            "message": "Password not matched",
        })
    }

    // Generate JWT token
    tokenClaims := jwt.MapClaims{
        "sub": user.ID.Hex(), // Use user.ID instead of user._id
        "exp": time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, tokenClaims)
    tokenString, err := token.SignedString(jwtSecret)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  false,
            "code": fiber.StatusInternalServerError,
            "message": "Error generating token",
        })
    }

    // Save the token and device token in the token collection
    tokenRecord := models.Token{
        ID:          primitive.NewObjectID(),
        UserID:      user.ID,
        Token:       tokenString,
        DeviceToken: input.DeviceToken,
    }
    _, err = service.TokenCollection.InsertOne(context.Background(), tokenRecord)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  false,
            "code": fiber.StatusInternalServerError,
            "message": "Error saving token",
        })
    }

    // Return success response with the token
    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "status":  true,
        "code": 200,
        "message": "Login successful",
        "token":   tokenString,
        "user":    user,
    })
}

func SaveReminder(c *fiber.Ctx) error {
    var input struct {
        UserID        string `json:"user_id"`
        FlightNumber  string `json:"flight_number"` 
        From          string `json:"from"` 
        To            string  `json:"to"` 
    }
    
    // Parse the request body
    if err := c.BodyParser(&input); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "status":  false,
            "code":    400,
            "message": "Cannot parse request",
        })
    }

    // Convert UserID from string to ObjectID
    userID, err := primitive.ObjectIDFromHex(input.UserID)
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "status":  false,
            "code":    400,
            "message": "Invalid UserID format",
        })
    }

    // Check if a reminder with the same UserID and FlightNumber already exists
    filter := bson.M{
        "user_id":       userID,
        "flight_number": input.FlightNumber,
        "from":    input.From,
        "to":   input.To,
    }

    var existingReminder models.Reminder
    err = service.ReminderCollection.FindOne(context.Background(), filter).Decode(&existingReminder)
    if err == nil {
        // Reminder already exists
        return c.Status(fiber.StatusConflict).JSON(fiber.Map{
            "status":  false,
            "code":    409,
            "message": "We already saved reminder for this flight",
        })
    }

    if err != mongo.ErrNoDocuments {
        // Handle other errors
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  false,
            "code":    500,
            "message": "Error while checking for existing reminder",
        })
    }

    // Create a new reminder record
    reminderRecord := models.Reminder{
        UserID:        userID,
        FlightNumber:  input.FlightNumber,
        From:          input.From,
        To:            input.To,
        // Add any other fields if needed
    }

    _, err = service.ReminderCollection.InsertOne(context.Background(), reminderRecord)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "status":  false,
            "code":    500,
            "message": "Error while saving reminder",
        })
    }

    // Return success response
    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "status":  true,
        "code":    200,
        "message": "Reminder saved successfully",
    })
}

// TYzBAV6miLBrp1k9HKn66yHEKb7OSDO6

// knHAAf5mTM8DbWyt