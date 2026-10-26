# 🏎️ Formula Racing Championship Management & Analytics Database System

A full-stack web application for managing and analyzing a Formula Racing Championship. The system provides centralized management of teams, drivers, cars, circuits, races, race results, lap timings, pit stops, penalties, sponsors, and race incidents through an interactive dashboard backed by a MySQL relational database.

## 🌐 Live Demo

**Website:** [Formula Racing Championship DB](https://formula-racing-db.vercel.app/)

> **Note:** The application uses demonstration data and is not an official Formula 1 results or telemetry platform.

---

## 📌 Project Overview

The Formula Racing Championship Management and Analytics Database System is a database-driven application designed to demonstrate the practical implementation of Relational Database Management System (RDBMS) concepts through a real-world motorsport scenario.

The application combines a React-based frontend, a Node.js and Express REST API, and a MySQL database to provide an integrated platform for managing championship information and exploring racing statistics.

### Objectives

- Design and implement a normalized relational database.
- Maintain relationships between championships, teams, drivers, races, and results.
- Perform CRUD operations through a web-based interface.
- Retrieve and analyze racing data using SQL queries.
- Demonstrate primary keys, foreign keys, joins, constraints, and database relationships.
- Deploy a full-stack application with a remotely hosted database.

## ✨ Features

- **Championship Dashboard** — Overview of teams, drivers, circuits, races, and championship statistics.
- **Standings** — View driver and constructor championship standings.
- **Team Management** — Manage teams, cars, and associated information.
- **Driver Management** — Add, view, update, and delete driver records.
- **Race and Circuit Management** — Maintain race schedules, circuits, and championship information.
- **Race Results** — Store and manage race results and finishing positions.
- **Lap Performance** — Track lap-level timing information.
- **Pit Stop Analytics** — Manage pit stops and tyre compound information.
- **Penalties and Incidents** — Record penalties and race incidents.
- **Sponsor Management** — Maintain sponsor information and team sponsorship relationships.
- **Search** — Search relevant championship entities through the interface.
- **REST API** — Communicate between the frontend and backend using HTTP requests.
- **Persistent Storage** — Store application records in MySQL rather than relying only on browser state.

*The availability of individual operations depends on the implemented API routes and interface.*

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| JavaScript | Application logic |
| Vite | Development server and production build |
| Node.js | Backend runtime |
| Express.js | REST API and server-side routing |
| MySQL | Relational database |
| MySQL2 | MySQL connectivity from Node.js |
| dotenv | Environment variable configuration |
| CORS | Cross-origin API access |
| Aiven | Managed MySQL database hosting |
| Render | Backend API hosting |
| Vercel | Frontend deployment |
| Git & GitHub | Version control and source code hosting |

## 🏗️ System Architecture

```text
                  User / Browser
                        |
                        v
              React + Vite Frontend
                   (Vercel)
                        |
                  HTTPS REST API
                        |
                        v
                Node.js + Express
                    (Render)
                        |
                   MySQL2 + SSL
                        |
                        v
                  MySQL Database
                     (Aiven)
```

The frontend sends requests to the Express backend. The backend validates and processes requests, executes SQL queries against the Aiven MySQL database, and returns responses to the frontend.

The database credentials and SSL configuration are maintained on the backend and are not exposed as frontend secrets.

## 🗄️ Database Design

The database is named `FormulaRacingDB` and contains the following core tables and supporting database objects.

| Table | Purpose |
|---|---|
| `Championship` | Championship and season information |
| `Team` | Racing team records |
| `Driver` | Driver information |
| `TeamDriver` | Team-driver assignments by championship |
| `Car` | Cars associated with teams |
| `Circuit` | Racing circuit information |
| `Race` | Race schedules and status |
| `RaceResult` | Driver and team race results |
| `Lap` | Lap timing records |
| `TyreCompound` | Tyre compound information |
| `PitStop` | Pit stop records |
| `Penalty` | Race penalties |
| `Sponsor` | Sponsor information |
| `TeamSponsor` | Team sponsorship relationships |
| `RaceIncident` | Incidents recorded during races |

The project also includes supporting database objects visible in the development environment, such as constructor standings, driver standings, and pit stop analytics objects. Their exact implementation depends on the SQL definitions in the repository.

### Key Relationships

- A championship can contain multiple races.
- Each race is associated with a circuit.
- Teams can have multiple cars.
- `TeamDriver` connects drivers and teams across championship seasons.
- `RaceResult` associates race results with drivers and teams.
- Lap timings, pit stops, and penalties are associated with race-result records.
- Pit stops reference tyre compounds.
- `TeamSponsor` connects teams, sponsors, and championships.
- Race incidents are associated with races and may reference a race result.

These relationships demonstrate the use of primary keys, foreign keys, and referential integrity in a relational database.

## 🚀 Getting Started

Follow these steps to run the application locally.

### Prerequisites

Install the following software:

- [Node.js](https://nodejs.org/) — preferably a current LTS version.
- npm — included with Node.js.
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) or access to a compatible hosted MySQL instance.
- [Git](https://git-scm.com/).
- A code editor such as VS Code or Antigravity.

### 1. Clone the Repository

```bash
git clone https://github.com/sanmotraudayan/FormulaRacingDB.git
cd FormulaRacingDB
```

### 2. Install Dependencies

```bash
npm install
```

This installs the project's frontend and backend dependencies from the root `package.json`.

### 3. Configure the Database

Start your local MySQL server and create the database:

```sql
CREATE DATABASE FormulaRacingDB;
```

Import the supplied SQL dump using MySQL Workbench or the MySQL command-line client. For example, if the dump is named `Dump20261022.sql`:

```bash
mysql -u root -p FormulaRacingDB < Dump20261022.sql
```

Replace the filename with the actual SQL dump available in your repository. If the dump contains schema-creation statements or has already been imported, check its contents before importing again.

### 4. Configure Environment Variables

Create a `.env` file in the project root for local development:

```env
# Backend
PORT=5000

# Local MySQL connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_mysql_password
DB_NAME=FormulaRacingDB
DB_SSL=false
```

Replace `your_local_mysql_password` with your own local MySQL password.

**Security:** Never commit `.env` files, database passwords, private certificates, or other credentials to GitHub. The repository's `.gitignore` should continue excluding `.env` and related secret files.

### 5. Start the Development Environment

Run both the backend API and frontend development server:

```bash
npm run dev
```

The root development script uses `concurrently` to start the backend and frontend together.

Open the local frontend at:

**http://localhost:3000**

The backend API runs on port `5000` by default.

### 6. Run the Backend and Frontend Separately

To run only the backend:

```bash
npm run server
```

To run only the frontend:

```bash
npm run client
```

Start the backend in one terminal and the frontend in another terminal when running them separately.

## 🔐 Security Considerations

- Keep database credentials in environment variables.
- Keep `.env` and private certificate files out of Git.
- Use verified SSL when connecting to the hosted database.
- Never expose MySQL credentials through `VITE_` frontend variables.
- Restrict production database access and review API authorization requirements before using real or sensitive data.
- Treat the application as a demonstration project unless appropriate authentication, authorization, validation, and operational safeguards have been implemented.

## 📚 Learning Outcomes

This project provides practical experience with:

- Relational database design and normalization.
- Primary keys, foreign keys, and integrity constraints.
- SQL queries, joins, filtering, and aggregation.
- CRUD operations and REST API design.
- Frontend-backend integration.
- Database connectivity from Node.js.
- Environment-based configuration and SSL.
- Full-stack deployment using GitHub, Vercel, Render, and Aiven.

## 🔮 Future Enhancements

- Authentication and role-based access control.
- Advanced championship analytics and visualizations.
- More comprehensive data validation and error handling.
- Pagination, filtering, and sorting for large datasets.
- Automated database backups and migration management.
- Automated tests for API routes and database operations.
- Improved query performance through indexing and query optimization.

## 👨‍💻 Author

**Repository:** [sanmotraudayan/FormulaRacingDB](https://github.com/sanmotraudayan/FormulaRacingDB)

## 📄 License

No license is specified here. Add a `LICENSE` file and update this section if you intend to distribute the project under a particular open-source license.
