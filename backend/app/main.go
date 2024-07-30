package main

import (
    "log"
    "os"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/joho/godotenv"
    "github.com/Mohdatish/scheduler"
    "github.com/Mohdatish/air-backend/app/routes"
    "github.com/Mohdatish/air-backend/app/service"
)

func main() {
    // Load environment variables
    err := godotenv.Load("app/.env")
    if err != nil {
        log.Fatalf("Error loading .env file")
    }

    // Connect to MongoDB
    service.ConnectDB()

    scheduler.SetupCronJob()

    // Keep the application running
    select {}

    // Create a new Fiber app
    app := fiber.New()

    // CORS configuration
    app.Use(cors.New(cors.Config{
        AllowOrigins: "*",
        AllowHeaders: "Origin, Content-Type, Accept, Authorization, token",
        AllowMethods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    }))

    // Initialize routes
    routes.SetupRoutes(app)

    // Define the port to listen on
    port := os.Getenv("PORT")

    // Start the server
    log.Printf("Server is running on http://localhost%s", port)
    if err := app.Listen(port); err != nil {
        log.Fatalf("Error starting server: %v", err)
    }
}
