# EcoTrade Application

EcoTrade is a full-stack application that promotes eco-friendly practices by allowing users to submit plastic waste for recycling, earn eco-points, and use those points to purchase eco-friendly products or plants.

## Project Structure

The project consists of two main components:

1. **Backend (Spring Boot)**: Located in the `EcoTradeBackend` directory
2. **Frontend (React)**: Located in the frontend directory

## Prerequisites

- Java 21
- Node.js and npm
- MySQL Server
- Maven

## Database Setup

1. Install MySQL Server if you haven't already.
2. Create a database named `ecotrade`:
   ```sql
   CREATE DATABASE ecotrade;
   ```
3. Update the database credentials in `EcoTradeBackend/src/main/resources/application.properties` if needed:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/ecotrade?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=Aisac123
   ```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd EcoTradeBackend
   ```

2. Build the application:
   ```bash
   ./mvnw clean install
   ```

3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

The backend server will start on `http://localhost:8080`.

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend application will start on `http://localhost:5173`.

## API Endpoints

### User Management

- `GET /api/users`: Get all users
- `GET /api/users/{id}`: Get user by ID
- `POST /api/users`: Create a new user
- `PUT /api/users/{id}`: Update a user
- `DELETE /api/users/{id}`: Delete a user
- `PUT /api/users/{id}/eco-points/add`: Add eco points to a user
- `PUT /api/users/{id}/eco-points/use`: Use eco points from a user

### Product Management

- `GET /api/products`: Get all products
- `GET /api/products/{id}`: Get product by ID
- `GET /api/products/category/{category}`: Get products by category
- `GET /api/products/plants`: Get all plants
- `POST /api/products`: Create a new product
- `PUT /api/products/{id}`: Update a product
- `DELETE /api/products/{id}`: Delete a product

### Plastic Submissions

- `GET /api/plastic-submissions`: Get all plastic submissions
- `GET /api/plastic-submissions/{id}`: Get plastic submission by ID
- `GET /api/plastic-submissions/user/{userId}`: Get plastic submissions by user
- `POST /api/plastic-submissions`: Create a new plastic submission
- `PUT /api/plastic-submissions/{id}`: Update a plastic submission
- `DELETE /api/plastic-submissions/{id}`: Delete a plastic submission

### Plants

- `GET /api/plants`: Get all plants
- `GET /api/plants/{id}`: Get plant by ID
- `GET /api/plants/user/{userId}`: Get plants by user
- `POST /api/plants`: Create a new plant
- `PUT /api/plants/{id}`: Update a plant
- `DELETE /api/plants/{id}`: Delete a plant

### Orders

- `GET /api/orders`: Get all orders
- `GET /api/orders/{id}`: Get order by ID
- `GET /api/orders/user/{userId}`: Get orders by user
- `POST /api/orders`: Create a new order
- `PUT /api/orders/{id}`: Update an order
- `DELETE /api/orders/{id}`: Delete an order

## Features

- User registration and authentication
- Product browsing and purchasing
- Plastic waste submission and tracking
- Plant growth tracking
- Eco-points system for rewards
- Order management

## Technologies Used

### Backend
- Spring Boot
- Spring Data JPA
- Spring Security
- MySQL
- Lombok

### Frontend
- React
- React Router
- Axios
- Tailwind CSS 