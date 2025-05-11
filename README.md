# Eventful API

Eventful is an event management application that allows users to create, manage, and attend events. This API provides endpoints for user authentication, event management, ticketing, and more.

**Live API Documentation**: [https://eventful-api.stoplight.io/docs/eventful](https://eventful-api.stoplight.io/docs/eventful)

**Hosted Base URL**: [https://eventful-api-nxu6.onrender.com](https://eventful-api-nxu6.onrender.com)

## Table of Contents

- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [User Management](#user-management)
  - [Event Management](#event-management)
  - [Ticket Management](#ticket-management)
- [Models](#models)
  - [User Model](#user-model)
  - [Event Model](#event-model)
  - [Ticket Model](#ticket-model)
  - [Category Model](#category-model)
- [Security](#security)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [License](#license)
- [Contact](#contact)


## Getting Started

To get started with the Eventful API, you will need to set up the environment, install dependencies, and run the application.

### Prerequisites

- Node.js v14 or higher
- MongoDB

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/holabayor/eventful-api.git
   ```

2. Navigate to the project directory:

   ```bash
   cd eventful-api
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables. Create a `.env` file in the root directory and add the following and other variables according to the `.env.example` file:

   ```bash
   PORT=3300
   MONGODB_URI=mongodb://localhost:27017/eventful
   JWT_SECRET=your_jwt_secret
   ```

5. Start the development server:

   ```bash
   npm run start:dev
   ```

## API Endpoints

### Authentication

- **POST /api/auth/register**: Registers a new user.
- **POST /api/auth/login**: Logs in a user.

### User Management

- **GET /api/users/me**: Retrieves the currently logged-in user.
- **GET /api/users/events**: Retrieves all events the user has registered for.
- **GET /api/users/created-events**: Retrieves all events created by the user (for event creators).

### Event Management

- **GET /api/events**: Retrieves all events.
- **POST /api/events**: Creates a new event (for event creators).
- **GET /api/events/{id}**: Retrieves an event by ID.
- **PATCH /api/events/{id}**: Updates an event by ID.
- **DELETE /api/events/{id}**: Deletes an event by ID.

### Ticket Management

- **GET /api/events/{id}/tickets**: Retrieves all tickets for an event (for event creators).
- **GET /api/tickets/{ticketId}**: Retrieves a ticket by ID.
- **POST /api/events/{id}/attend**: Adds an attendee to an event.
- **PATCH /tickets/{ticketId}/cancel**: Cancels a ticket.
- **POST /api/tickets/{ticketId}/scan**: Scans a ticket (for event creators).

## Models

### User Model

- **\_id**: Unique identifier for the user.
- **name**: Name of the user.
- **email**: Email address of the user.
- **role**: Role of the user (e.g., eventee, creator).
- **events**: Array of event IDs the user is associated with.

### Event Model

- **\_id**: Unique identifier for the event.
- **title**: Title of the event.
- **description**: Description of the event.
- **date**: Date of the event.
- **time**: Time of the event.
- **imageUrl**: Image banner of the event.
- **location**: Location of the event.
- **creator**: ID of the event creator.
- **attendees**: Array of attendees for the event.
- **defaultReminderDate**: Default reminder date for the event.
- **eventQrCode**: QR code associated with the event.
- **additionalDetails**: Additional information/details the event.

### Ticket Model

- **\_id**: Unique identifier for the ticket.
- **event**: ID of the event associated with the ticket.
- **user**: ID of the user who owns the ticket.
- **qrCode**: QR code associated with the ticket.
- **status**: Status of the ticket (e.g., purchased, cancelled).
- **purchasedAt**: Date and time when the ticket was purchased.

### Category Model

- **\_id**: Unique identifier for the category.
- **name**: Name of the category.

## Security

This API uses JWT (JSON Web Tokens) for authentication. The token should be included in the `Authorization` header as a Bearer token for endpoints that require authentication.

## Running Locally

To run the application locally, follow the steps in the [Getting Started](#getting-started) section.

## Deployment

The API can be deployed to any platform that supports Node.js applications. Ensure that the environment variables are properly configured in the deployment environment.

## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](http://www.apache.org/licenses/LICENSE-2.0.html) file for details.

## Contact

For any questions or feedback, please contact the project maintainer:

- **Name**: Liasu Aanuoluwapo
- **Email**: liasu.olabayo@gmail.com
- **GitHub**: [holabayor](https://github.com/holabayor)
