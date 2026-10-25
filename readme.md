Formula Racing Championship Management and Analytics Database System
Project Overview
This is an RDBMS mini project for managing and analyzing a Formula-style
racing championship. The database uses MySQL and contains 15 related
tables for championship seasons, teams, drivers, cars, circuits, races,
race results, lap timings, tyre compounds, pit stops, penalties,
sponsors, and race incidents.

The current goal is to build a polished, interactive frontend using
React and JavaScript. The UI should make the database easy to explore
through a motorsport analytics dashboard.

Data note: sample race, lap, and performance records may be
synthetic demonstration data. Do not present them as official racing
results or telemetry.
Goals
- Display championship, team, driver, circuit, and race information.
- Show driver and constructor standings by season.
- Explore race results, lap times, fastest laps, pit stops, tyres,
  penalties, sponsors, and incidents.
- Provide useful search, sorting, filters, and detail views.
- Keep the frontend ready for future API integration.
- Reflect the database schema and relationships; do not add unrelated
  features.
Technology
- Frontend: React + JavaScript + CSS
- Database: MySQL
The browser frontend should not connect directly to MySQL. If a
backend API is not available yet, keep sample data in a separate
mock-data/service module so it can later be replaced by API calls.
Database Tables
  Table                               Purpose
  Championship                      Season year, championship name, and
                                      status

  Team                              Team details, base country,
                                      principal, and founding year

  Driver                            Driver identity, nationality, date
                                      of birth, and driver number

  TeamDriver                        Driver/team assignment for a
                                      championship season

  Car                               Car number, model, engine
                                      manufacturer, and owning team

  Circuit                           Circuit name, country, city,
                                      length, and number of turns

  Race                              Championship round, circuit, date,
                                      scheduled laps, and status

  RaceResult                        Driver result, team, car, position,
                                      points, and status

  Lap                               Lap number, lap time, and
                                      fastest-lap flag

  TyreCompound                      Tyre compound name and category

  PitStop                           Pit-stop lap, duration, and tyre
                                      compound

  Penalty                           Penalty type, description, time
                                      penalty, and position penalty

  Sponsor                           Sponsor name, industry, and country

  TeamSponsor                       Team-sponsor association by
                                      championship season and sponsorship
                                      amount

  RaceIncident                      Incident, optional related result,
                                      lap number, description, and
                                  safety-car flag
Relationships
- A championship contains multiple races; each race is held at a
  circuit.
- Teams have cars.
- TeamDriver records the team a driver belongs to in a particular
  championship season.
- RaceResult links a race, driver, team, and optionally a car.
- A result can have multiple lap records and may have pit stops and
  penalties.
- Pit stops reference a tyre compound.
- TeamSponsor links teams and sponsors for a championship season.
- Race incidents belong to a race and may optionally reference a race
  result.
Suggested Pages
1. Dashboard
Show the selected season, counts of teams/drivers/circuits/races, recent
or completed race results, top drivers, and a constructor standings
preview. Only show "upcoming" or "next race" information if the dataset
supports it.
2. Championship Standings
- Driver and constructor standings by season
- Points and race wins; podiums only if they can be calculated
  reliably
- Season selector, search, sorting, and clear tie handling
3. Teams
Team list and detail view with country, principal, drivers, cars, and
sponsors.
4. Drivers
Driver list and detail view with number, nationality, season team,
points, and race results.
5. Races and Circuits
Race calendar by round, date, circuit, location, scheduled laps, and
status. Include circuit length and turn count.
6. Race Results
Finishing position, driver, team, points, and result status. Filter by
season, race, team, or driver.
7. Lap Performance
Lap number and time by driver/race, fastest-lap indication, and optional
comparison when enough data exists.
8. Pit Stops and Tyres
Pit-stop lap, duration, tyre compound, and filters by race, driver, or
team. Show averages only when the data supports them.
9. Penalties and Incidents
Show penalty type and penalties applied; display incident details, lap
number, and safety-car deployment.
10. Sponsors
Sponsor information, associated teams/seasons, and sponsorship amount.
Confirm the currency before displaying currency symbols.
UI/UX Direction
Build a polished motorsport analytics product, not a generic admin
template.
- Use a restrained black, white, charcoal, and red accent palette.
- Use readable typography, strong hierarchy, consistent spacing, and
  clear alignment.
- Keep tables and standings highly legible.
- Use racing-inspired details sparingly: race numbers, status
  indicators, and subtle track motifs.
- Make layouts responsive for desktop, tablet, and mobile.
- Provide loading, empty, and error states.
- Include accessible labels, keyboard focus states, and sufficient
  contrast.
- Avoid excessive gradients, oversized rounded cards, decorative
  charts, excessive animation, and visual clutter.
- Keep the UI dense enough for real data, but not cramped.
Suggested Project Structure
Adapt this to the existing repository; do not replace working code
unnecessarily.
src/
  components/
    layout/
    ui/
    tables/
    charts/
  pages/
    Dashboard.jsx
    Standings.jsx
    Teams.jsx
    Drivers.jsx
    Races.jsx
    RaceResults.jsx
    LapPerformance.jsx
    PitStops.jsx
    PenaltiesIncidents.jsx
    Sponsors.jsx
  services/
    api.js
    mockData.js
  hooks/
  utils/
  styles/
  App.jsx
  main.jsx
- Keep mock data in services/mockData.js or a similar isolated
  module.
- Put network requests in services/api.js.
- Keep data access separate from presentation.
- Avoid duplicating derived points and standings across components.
- Do not put database credentials or secrets in frontend code.
- Do not claim MySQL connectivity unless a backend API exists and has
  been tested.
Future API Shape (Proposed Only)
These are suggestions for a future backend, not implemented endpoints:
GET /api/championships
GET /api/championships/:id/driver-standings
GET /api/championships/:id/constructor-standings
GET /api/teams
GET /api/teams/:id
GET /api/drivers
GET /api/drivers/:id
GET /api/races
GET /api/races/:id/results
GET /api/races/:id/laps
GET /api/pit-stops
GET /api/penalties
GET /api/incidents
GET /api/sponsors
Business Rules
- Driver/team assignment is season-specific and should be based on
  TeamDriver.
- A driver should have at most one result per race, as represented by
  the database constraint.
- Standings must be grouped by championship season.
- Constructor points should be calculated from the race results for
  that team in the selected season.
- Do not invent missing race data, results, points, or upcoming
  events.
- Do not treat a fastest-lap flag as verified telemetry without
  validating the recorded lap times.
- Clearly label synthetic/sample data.
## Running the Project
The application is fully synchronized with the local MySQL 8.0 database (`formularacingdb`).

### Prerequisites
- Node.js (v18+) & npm (v9+)
- MySQL Server 8.0 running on `localhost:3306` with database `formularacingdb`

### Commands
1. **Start Full-Stack App (Backend API + React Frontend)**:
   ```bash
   npm run dev
   ```
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend REST API**: [http://localhost:5000](http://localhost:5000)
   - **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

2. **Run Individual Services**:
   - Backend Only: `npm run server`
   - Frontend Only: `npm run client`
   - Production Build: `npm run build`

### Database Configuration (`.env`)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=2810
DB_NAME=formularacingdb
DB_PORT=3306
PORT=5000
```

### Implemented Features & End-Term Evaluation Criteria
- **Live MySQL Synchronization**: All 18 database relations (15 tables + 3 views: `driverstandings`, `constructorstandings`, `pitstopanalytics`) are connected in real-time.
- **Full CRUD Support**: Add, Edit, and Delete operations for Drivers, Teams, Cars, Circuits, Races, Results, Laps, Pit Stops, Penalties, Incidents, and Sponsors directly execute SQL transactions and update database records.
- **Motorsport Design Aesthetics**: Built strictly according to `design.md`:
  - Deep Navy-Black Base (`#15151E`) & Surfaces (`#1F1F2B`)
  - Hot F1 Red Accent (`#E10600`) adhering to the 10% screen rule
  - Functional timing colors: Fastest Lap Purple Sector (`#A855F7`), Personal Best Green (`#22C55E`), Warning Yellow (`#FACC15`), Tyre Compounds (Soft `#FF3333`, Medium `#FFD12E`, Hard `#F0F0F0`, Intermediate `#10B981`, Wet `#3B82F6`)
  - Authentic typography: `Barlow Condensed`, `Inter`, and `JetBrains Mono`
- **Interactive Database Studio**: Built-in visual schema explorer allowing live inspection of all 18 tables and views with column metadata, key definitions, and real-time search.