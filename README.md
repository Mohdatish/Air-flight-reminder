Air Flight Reminder
Project Summary
This project is a dashboard application where users can search for flight details using flight numbers, departure/arrival details, or airport IATA codes. Users are required to login or register to their accounts before setting reminders for their flights. The application stores flight details along with user information in a database. Reminders are managed using cron jobs in the backend, which check the flight's departure time and notify users via notifications and email using Firebase for notifications and SendGrid for emails.

Tech Stack
Frontend
React: Frontend framework for building user interfaces.
Redux: State management library for managing application state.
Material-UI: Component library for React to style and structure the UI.
React Hot Toast: Library for displaying notifications in React applications.

Backend
Go: Programming language used for backend development.
Fiber: Web framework for building APIs in Go.
Cron Jobs: Used for scheduling tasks like checking flight reminder times.
MongoDB: NoSQL database used to store user and flight data.

Additional Tools and Libraries
Firebase: Used for real-time notifications.
SendGrid: Email delivery service for sending notifications.
HTML/CSS: Used for additional styling and frontend design.
