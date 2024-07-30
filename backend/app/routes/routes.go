// app/routes/routes.go
package routes

import (
    "github.com/gofiber/fiber/v2"
    "github.com/Mohdatish/air-backend/app/controllers"
)

func SetupRoutes(app *fiber.App) {
    app.Post("/generate-otp", controllers.GenerateOtp)
    app.Post("/verify-otp", controllers.VerifyOtp)
    app.Post("/register", controllers.Register)
    app.Post("/login", controllers.Login)
    app.Post("/save-reminder", controllers.SaveReminder)

}
