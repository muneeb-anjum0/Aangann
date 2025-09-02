# ![Aangan Logo Mark](client/src/assets/footer/aangan-logo-mark.svg) ![Aangan Text Logo](client/src/assets/footer/aangan-text-logo.png)


Welcome to the Aangan project! This repository contains both the frontend (React + Vite + Tailwind) and backend (Node.js + Express + Firebase) for the Aangan platform, containerized with Docker for easy deployment.

---


## Table of Contents

- <a href="#project-structure"><span style="color:#ec4899;font-weight:bold;">Project Structure</span></a>
- <a href="#features"><span style="color:#ec4899;font-weight:bold;">Features</span></a>
- <a href="#tech-stack"><span style="color:#ec4899;font-weight:bold;">Tech Stack</span></a>
- <a href="#getting-started"><span style="color:#ec4899;font-weight:bold;">Getting Started</span></a>
  - <a href="#1-prerequisites"><span style="color:#ec4899;">1. Prerequisites</span></a>
  - <a href="#2-clone-the-repository"><span style="color:#ec4899;">2. Clone the Repository</span></a>
  - <a href="#3-install-dependencies"><span style="color:#ec4899;">3. Install Dependencies</span></a>
  - <a href="#4-environment-variables"><span style="color:#ec4899;">4. Environment Variables</span></a>
  - <a href="#5-running-locally-without-docker"><span style="color:#ec4899;">5. Running Locally (Without Docker)</span></a>
  - <a href="#6-docker-setup--usage"><span style="color:#ec4899;">6. Docker Setup & Usage</span></a>
- <a href="#project-scripts"><span style="color:#ec4899;font-weight:bold;">Project Scripts</span></a>
- <a href="#folder-structure"><span style="color:#ec4899;font-weight:bold;">Folder Structure</span></a>
- <a href="#contributing"><span style="color:#ec4899;font-weight:bold;">Contributing</span></a>
- <a href="#license"><span style="color:#ec4899;font-weight:bold;">License</span></a>

---

## Project Structure

```
.
├── client/      # Frontend (React, Vite, Tailwind)
├── server/      # Backend (Node.js, Express, Firebase)
├── docker-compose.yml
└── README.md
```

---

## Features

- Modern, responsive frontend built with React, Vite, and Tailwind CSS
- RESTful backend API with Node.js, Express, and Firebase integration
- User authentication, blog, contact, FAQ, testimonials, waitlist, and more
- Fully containerized with Docker and orchestrated via Docker Compose
- Production-ready Nginx setup for frontend

---

## Tech Stack

**Frontend:**
- React
- Vite
- Tailwind CSS
- TypeScript

**Backend:**
- Node.js
- Express
- Firebase Firestore
- Firebase Admin SDK
- Cloudinary (for media uploads)

**DevOps:**
- Docker & Docker Compose
- Nginx (serving frontend)

---

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Clone the Repository

```sh
git clone https://github.com/yourusername/aangan.git
cd aangan
```

### 3. Install Dependencies

#### Client

```sh
cd client
npm install
```

#### Server

```sh
cd ../server
npm install
```

### 4. Environment Variables

- **Server:**  
  Copy `.env.example` to `.env` in the `server/` directory and fill in your environment variables (Firebase credentials, Cloudinary keys, etc).

- **Client:**  
  If needed, add a `.env` file in `client/` for frontend environment variables.

### 5. Running Locally (Without Docker)

#### Start Backend

```sh
cd server
npm run dev
```

#### Start Frontend

```sh
cd client
npm run dev
```

- The frontend will typically run on [http://localhost:5173](http://localhost:5173)
- The backend will run on [http://localhost:5000](http://localhost:5000) (or as configured)

---

### 6. Docker Setup & Usage

#### Build & Run with Docker Compose

From the project root (where `docker-compose.yml` is located):

```sh
docker-compose up --build
```

- This will build and start both the client and server containers.
- The frontend will be served via Nginx (see `client/nginx.conf`).
- The backend will be accessible as per the configuration in `docker-compose.yml`.

#### Stopping Containers

```sh
docker-compose down
```

#### Rebuilding Containers

```sh
docker-compose up --build
```

#### Docker Compose File Overview

- **client:**  
  - Dockerfile builds the React app and serves it with Nginx.
- **server:**  
  - Dockerfile sets up Node.js, installs dependencies, and runs the Express server.

---

## Project Scripts

### Client

- `npm run dev` – Start Vite dev server
- `npm run build` – Build for production
- `npm run preview` – Preview production build

### Server

- `npm run dev` – Start server with nodemon (development)
- `npm start` – Start server (production)

---

## Folder Structure

```
client/
  ├── src/
  │   ├── assets/         # Images, logos, SVGs
  │   ├── components/     # React components
  │   ├── lib/            # API utilities
  │   ├── pages/          # Page components
  │   └── sections/       # Section components
  └── public/             # Static files

server/
  ├── src/
  │   ├── controllers/    # Route controllers
  │   ├── lib/            # Utility libraries (db, cloudinary, firebase)
  │   ├── middleware/     # Express middleware
  │   ├── models/         # Firebase models/helpers
  │   ├── routes/         # API routes
  │   └── seed/           # Seed scripts
  └── firebaseServiceAccountKey.json
```

---

## Contributing

We welcome contributions! Please open issues or pull requests for improvements, bug fixes, or new features.

---

## License

This project is licensed under the MIT License.

---

## Logos

<p align="center">
  <img src="client/src/assets/footer/aangan-logo-mark.svg" alt="Aangan Logo" width="80"/>
  <img src="client/src/assets/footer/aangan-text-logo.png" alt="Aangan Text Logo" width="200"/>
</p>

---

## Need Help?

If you have any questions or need support, please open an issue or contact the maintainers.

---

**Happy Coding!**
