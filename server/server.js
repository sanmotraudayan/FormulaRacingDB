import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, testConnection } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// Database Health & Status
// -------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  const result = await testConnection();
  if (result.success) {
    res.json({
      status: 'online',
      connected: true,
      message: 'Connected to MySQL Database',
      ...result
    });
  } else {
    res.status(500).json({
      status: 'error',
      connected: false,
      message: 'Failed to connect to MySQL Database',
      ...result
    });
  }
});

// -------------------------------------------------------------
// Dashboard Overview Stats
// -------------------------------------------------------------
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const season = req.query.season || 2025;

    const [[teamCount]] = await pool.query('SELECT COUNT(*) as count FROM team');
    const [[driverCount]] = await pool.query('SELECT COUNT(*) as count FROM driver');
    const [[circuitCount]] = await pool.query('SELECT COUNT(*) as count FROM circuit');
    const [[raceCount]] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN race_status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN race_status = 'SCHEDULED' THEN 1 ELSE 0 END) as scheduled
      FROM race r
      JOIN championship c ON r.championship_id = c.championship_id
      WHERE c.season_year = ?
    `, [season]);

    // Top 3 Drivers from driverstandings view
    const [topDrivers] = await pool.query(`
      SELECT ds.*, d.driver_number, d.nationality, t.team_name
      FROM driverstandings ds
      JOIN championship c ON ds.championship_id = c.championship_id
      JOIN driver d ON ds.driver_id = d.driver_id
      LEFT JOIN teamdriver td ON td.driver_id = d.driver_id AND td.championship_id = ds.championship_id
      LEFT JOIN team t ON td.team_id = t.team_id
      WHERE c.season_year = ?
      ORDER BY ds.total_points DESC, ds.race_wins DESC, ds.podiums DESC
      LIMIT 3
    `, [season]);

    // Top Constructors
    const [topConstructors] = await pool.query(`
      SELECT cs.*
      FROM constructorstandings cs
      JOIN championship c ON cs.championship_id = c.championship_id
      WHERE c.season_year = ?
      ORDER BY cs.total_points DESC, cs.race_wins DESC
    `, [season]);

    // Recent/Latest Race
    const [recentRaces] = await pool.query(`
      SELECT r.*, c.circuit_name, c.country, c.city, ch.season_year
      FROM race r
      JOIN circuit c ON r.circuit_id = c.circuit_id
      JOIN championship ch ON r.championship_id = ch.championship_id
      WHERE ch.season_year = ?
      ORDER BY r.round_number ASC
    `, [season]);

    // Fastest Lap recorded
    const [fastestLapRecord] = await pool.query(`
      SELECT l.*, d.first_name, d.last_name, t.team_name, r.race_name
      FROM lap l
      JOIN raceresult rr ON l.result_id = rr.result_id
      JOIN driver d ON rr.driver_id = d.driver_id
      JOIN team t ON rr.team_id = t.team_id
      JOIN race r ON rr.race_id = r.race_id
      WHERE l.is_fastest_lap = 1
      ORDER BY l.lap_time_seconds ASC
      LIMIT 1
    `);

    res.json({
      counts: {
        teams: teamCount.count,
        drivers: driverCount.count,
        circuits: circuitCount.count,
        races: raceCount.total || 0,
        completedRaces: raceCount.completed || 0,
        scheduledRaces: raceCount.scheduled || 0,
      },
      topDrivers,
      topConstructors,
      races: recentRaces,
      fastestLap: fastestLapRecord[0] || null
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Unified Search Endpoint (Drivers, Teams, Circuits, Races)
// -------------------------------------------------------------
app.get('/api/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.json({ drivers: [], teams: [], circuits: [], races: [] });
    }

    const pattern = `%${q}%`;

    const [drivers] = await pool.query(`
      SELECT DISTINCT d.driver_id, d.first_name, d.last_name, d.driver_number, d.nationality,
             t.team_name, t.team_id
      FROM driver d
      LEFT JOIN teamdriver td ON td.driver_id = d.driver_id
      LEFT JOIN team t ON td.team_id = t.team_id
      WHERE d.first_name LIKE ? OR d.last_name LIKE ? OR CONCAT(d.first_name, ' ', d.last_name) LIKE ?
         OR d.nationality LIKE ? OR CAST(d.driver_number AS CHAR) LIKE ? OR t.team_name LIKE ?
      LIMIT 5
    `, [pattern, pattern, pattern, pattern, pattern, pattern]);

    const [teams] = await pool.query(`
      SELECT team_id, team_name, base_country, team_principal, founded_year
      FROM team
      WHERE team_name LIKE ? OR base_country LIKE ? OR team_principal LIKE ?
      LIMIT 5
    `, [pattern, pattern, pattern]);

    const [circuits] = await pool.query(`
      SELECT circuit_id, circuit_name, country, city, circuit_length_km, number_of_turns
      FROM circuit
      WHERE circuit_name LIKE ? OR country LIKE ? OR city LIKE ?
      LIMIT 5
    `, [pattern, pattern, pattern]);

    const [races] = await pool.query(`
      SELECT r.race_id, r.race_name, r.round_number, r.race_date, r.race_status,
             c.circuit_name, c.country
      FROM race r
      LEFT JOIN circuit c ON r.circuit_id = c.circuit_id
      WHERE r.race_name LIKE ? OR c.circuit_name LIKE ? OR c.country LIKE ?
      LIMIT 5
    `, [pattern, pattern, pattern]);

    res.json({
      drivers,
      teams,
      circuits,
      races
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Championships
// -------------------------------------------------------------
app.get('/api/championships', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM championship ORDER BY season_year DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/championships', async (req, res) => {
  try {
    const { championship_name, season_year, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO championship (championship_name, season_year, status) VALUES (?, ?, ?)',
      [championship_name, season_year, status || 'UPCOMING']
    );
    res.status(201).json({ id: result.insertId, message: 'Championship added successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/championships/:id', async (req, res) => {
  try {
    const { championship_name, season_year, status } = req.body;
    await pool.query(
      'UPDATE championship SET championship_name = ?, season_year = ?, status = ? WHERE championship_id = ?',
      [championship_name, season_year, status, req.params.id]
    );
    res.json({ message: 'Championship updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/championships/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM championship WHERE championship_id = ?', [req.params.id]);
    res.json({ message: 'Championship deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Standings (Views)
// -------------------------------------------------------------
app.get('/api/standings/drivers', async (req, res) => {
  try {
    const season = req.query.season;
    let query = `
      SELECT ds.*, ch.season_year, ch.championship_name,
             d.driver_number, d.nationality,
             t.team_id, t.team_name
      FROM driverstandings ds
      JOIN championship ch ON ds.championship_id = ch.championship_id
      JOIN driver d ON ds.driver_id = d.driver_id
      LEFT JOIN teamdriver td ON td.driver_id = d.driver_id AND td.championship_id = ds.championship_id
      LEFT JOIN team t ON td.team_id = t.team_id
    `;
    const params = [];
    if (season && season !== 'ALL') {
      query += ' WHERE ch.season_year = ?';
      params.push(season);
    }
    query += ' ORDER BY ds.total_points DESC, ds.race_wins DESC, ds.podiums DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/standings/constructors', async (req, res) => {
  try {
    const season = req.query.season;
    let query = `
      SELECT cs.*, ch.season_year, ch.championship_name,
             t.base_country, t.team_principal, t.founded_year
      FROM constructorstandings cs
      JOIN championship ch ON cs.championship_id = ch.championship_id
      JOIN team t ON cs.team_id = t.team_id
    `;
    const params = [];
    if (season && season !== 'ALL') {
      query += ' WHERE ch.season_year = ?';
      params.push(season);
    }
    query += ' ORDER BY cs.total_points DESC, cs.race_wins DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Teams & Cars
// -------------------------------------------------------------
app.get('/api/teams', async (req, res) => {
  try {
    const [teams] = await pool.query(`
      SELECT t.*, 
        (SELECT COUNT(*) FROM teamdriver td WHERE td.team_id = t.team_id) as driver_count,
        (SELECT COUNT(*) FROM car c WHERE c.team_id = t.team_id) as car_count,
        (SELECT COALESCE(SUM(rr.points_awarded), 0) FROM raceresult rr WHERE rr.team_id = t.team_id) as all_time_points
      FROM team t
      ORDER BY t.team_name ASC
    `);

    // Fetch drivers and cars for each team
    const [drivers] = await pool.query(`
      SELECT td.*, d.first_name, d.last_name, d.driver_number, d.nationality, ch.season_year
      FROM teamdriver td
      JOIN driver d ON td.driver_id = d.driver_id
      JOIN championship ch ON td.championship_id = ch.championship_id
    `);

    const [cars] = await pool.query('SELECT * FROM car ORDER BY car_number ASC');

    const [sponsors] = await pool.query(`
      SELECT ts.*, s.sponsor_name, s.industry, ch.season_year
      FROM teamsponsor ts
      JOIN sponsor s ON ts.sponsor_id = s.sponsor_id
      JOIN championship ch ON ts.championship_id = ch.championship_id
    `);

    const enriched = teams.map(team => ({
      ...team,
      drivers: drivers.filter(d => d.team_id === team.team_id),
      cars: cars.filter(c => c.team_id === team.team_id),
      sponsors: sponsors.filter(s => s.team_id === team.team_id)
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const { team_name, base_country, team_principal, founded_year } = req.body;
    const [result] = await pool.query(
      'INSERT INTO team (team_name, base_country, team_principal, founded_year) VALUES (?, ?, ?, ?)',
      [team_name, base_country, team_principal || null, founded_year || null]
    );
    res.status(201).json({ team_id: result.insertId, message: 'Team created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/teams/:id', async (req, res) => {
  try {
    const { team_name, base_country, team_principal, founded_year } = req.body;
    await pool.query(
      'UPDATE team SET team_name = ?, base_country = ?, team_principal = ?, founded_year = ? WHERE team_id = ?',
      [team_name, base_country, team_principal, founded_year, req.params.id]
    );
    res.json({ message: 'Team updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const teamId = req.params.id;
    await connection.query('DELETE FROM teamsponsor WHERE team_id = ?', [teamId]);
    await connection.query('DELETE FROM teamdriver WHERE team_id = ?', [teamId]);
    await connection.query('DELETE FROM car WHERE team_id = ?', [teamId]);
    await connection.query('DELETE FROM team WHERE team_id = ?', [teamId]);
    await connection.commit();
    res.json({ message: 'Team and associated records deleted successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Cars
app.get('/api/cars', async (req, res) => {
  try {
    const [cars] = await pool.query(`
      SELECT c.*, t.team_name, t.base_country
      FROM car c
      JOIN team t ON c.team_id = t.team_id
      ORDER BY c.car_number ASC
    `);
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cars', async (req, res) => {
  try {
    const { team_id, car_number, car_model, engine_manufacturer } = req.body;
    const [result] = await pool.query(
      'INSERT INTO car (team_id, car_number, car_model, engine_manufacturer) VALUES (?, ?, ?, ?)',
      [team_id, car_number, car_model, engine_manufacturer || null]
    );
    res.status(201).json({ car_id: result.insertId, message: 'Car registered' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/cars/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM car WHERE car_id = ?', [req.params.id]);
    res.json({ message: 'Car deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Drivers
// -------------------------------------------------------------
app.get('/api/drivers', async (req, res) => {
  try {
    const season = req.query.season || 2025;
    const [drivers] = await pool.query(`
      SELECT d.*, 
             t.team_id, t.team_name,
             td.contract_start, td.contract_end,
             COALESCE(ds.total_points, 0) as season_points,
             COALESCE(ds.race_wins, 0) as season_wins,
             COALESCE(ds.podiums, 0) as season_podiums
      FROM driver d
      LEFT JOIN teamdriver td ON td.driver_id = d.driver_id 
        AND td.championship_id = (SELECT championship_id FROM championship WHERE season_year = ? LIMIT 1)
      LEFT JOIN team t ON td.team_id = t.team_id
      LEFT JOIN driverstandings ds ON ds.driver_id = d.driver_id 
        AND ds.championship_id = td.championship_id
      ORDER BY season_points DESC, d.driver_number ASC
    `, [season]);
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { first_name, last_name, nationality, date_of_birth, driver_number, team_id, championship_id, contract_start, contract_end } = req.body;

    const [driverResult] = await connection.query(
      'INSERT INTO driver (first_name, last_name, nationality, date_of_birth, driver_number) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, nationality, date_of_birth || null, driver_number]
    );
    const newDriverId = driverResult.insertId;

    if (team_id && championship_id) {
      await connection.query(
        'INSERT INTO teamdriver (team_id, driver_id, championship_id, contract_start, contract_end) VALUES (?, ?, ?, ?, ?)',
        [team_id, newDriverId, championship_id, contract_start || '2025-01-01', contract_end || '2025-12-31']
      );
    }

    await connection.commit();
    res.status(201).json({ driver_id: newDriverId, message: 'Driver created and registered with team!' });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { first_name, last_name, nationality, date_of_birth, driver_number, team_id, championship_id } = req.body;
    const driverId = req.params.id;

    await connection.query(
      'UPDATE driver SET first_name = ?, last_name = ?, nationality = ?, date_of_birth = ?, driver_number = ? WHERE driver_id = ?',
      [first_name, last_name, nationality, date_of_birth, driver_number, driverId]
    );

    if (team_id && championship_id) {
      await connection.query(`
        INSERT INTO teamdriver (team_id, driver_id, championship_id, contract_start, contract_end)
        VALUES (?, ?, ?, '2025-01-01', '2025-12-31')
        ON DUPLICATE KEY UPDATE team_id = VALUES(team_id)
      `, [team_id, driverId, championship_id]);
    }

    await connection.commit();
    res.json({ message: 'Driver updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const driverId = req.params.id;
    // Remove from team assignments first
    await connection.query('DELETE FROM teamdriver WHERE driver_id = ?', [driverId]);
    // Remove driver record
    await connection.query('DELETE FROM driver WHERE driver_id = ?', [driverId]);
    await connection.commit();
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// -------------------------------------------------------------
// Circuits
// -------------------------------------------------------------
app.get('/api/circuits', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM circuit ORDER BY circuit_name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/circuits', async (req, res) => {
  try {
    const { circuit_name, country, city, circuit_length_km, number_of_turns } = req.body;
    const [result] = await pool.query(
      'INSERT INTO circuit (circuit_name, country, city, circuit_length_km, number_of_turns) VALUES (?, ?, ?, ?, ?)',
      [circuit_name, country, city || null, circuit_length_km, number_of_turns]
    );
    res.status(201).json({ circuit_id: result.insertId, message: 'Circuit registered' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/circuits/:id', async (req, res) => {
  try {
    const { circuit_name, country, city, circuit_length_km, number_of_turns } = req.body;
    await pool.query(
      'UPDATE circuit SET circuit_name = ?, country = ?, city = ?, circuit_length_km = ?, number_of_turns = ? WHERE circuit_id = ?',
      [circuit_name, country, city, circuit_length_km, number_of_turns, req.params.id]
    );
    res.json({ message: 'Circuit updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/circuits/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM circuit WHERE circuit_id = ?', [req.params.id]);
    res.json({ message: 'Circuit deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Races
// -------------------------------------------------------------
app.get('/api/races', async (req, res) => {
  try {
    const season = req.query.season;
    let query = `
      SELECT r.*, c.circuit_name, c.country, c.city, c.circuit_length_km, c.number_of_turns,
             ch.season_year, ch.championship_name,
             (SELECT COUNT(*) FROM raceresult rr WHERE rr.race_id = r.race_id) as result_count,
             (SELECT d.first_name FROM raceresult rr JOIN driver d ON rr.driver_id = d.driver_id WHERE rr.race_id = r.race_id AND rr.finishing_position = 1 LIMIT 1) as winner_first_name,
             (SELECT d.last_name FROM raceresult rr JOIN driver d ON rr.driver_id = d.driver_id WHERE rr.race_id = r.race_id AND rr.finishing_position = 1 LIMIT 1) as winner_last_name,
             (SELECT t.team_name FROM raceresult rr JOIN team t ON rr.team_id = t.team_id WHERE rr.race_id = r.race_id AND rr.finishing_position = 1 LIMIT 1) as winner_team
      FROM race r
      JOIN circuit c ON r.circuit_id = c.circuit_id
      JOIN championship ch ON r.championship_id = ch.championship_id
    `;
    const params = [];
    if (season && season !== 'ALL') {
      query += ' WHERE ch.season_year = ?';
      params.push(season);
    }
    query += ' ORDER BY ch.season_year DESC, r.round_number ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/races', async (req, res) => {
  try {
    const { championship_id, circuit_id, race_name, round_number, race_date, scheduled_laps, race_status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO race (championship_id, circuit_id, race_name, round_number, race_date, scheduled_laps, race_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [championship_id, circuit_id, race_name, round_number, race_date, scheduled_laps, race_status || 'SCHEDULED']
    );
    res.status(201).json({ race_id: result.insertId, message: 'Grand Prix scheduled' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/races/:id', async (req, res) => {
  try {
    const { championship_id, circuit_id, race_name, round_number, race_date, scheduled_laps, race_status } = req.body;
    await pool.query(
      'UPDATE race SET championship_id = ?, circuit_id = ?, race_name = ?, round_number = ?, race_date = ?, scheduled_laps = ?, race_status = ? WHERE race_id = ?',
      [championship_id, circuit_id, race_name, round_number, race_date, scheduled_laps, race_status, req.params.id]
    );
    res.json({ message: 'Race updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/races/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const raceId = req.params.id;
    await connection.query('DELETE FROM raceincident WHERE race_id = ?', [raceId]);
    const [results] = await connection.query('SELECT result_id FROM raceresult WHERE race_id = ?', [raceId]);
    for (const r of results) {
      await connection.query('DELETE FROM penalty WHERE result_id = ?', [r.result_id]);
      await connection.query('DELETE FROM pitstop WHERE result_id = ?', [r.result_id]);
      await connection.query('DELETE FROM lap WHERE result_id = ?', [r.result_id]);
    }
    await connection.query('DELETE FROM raceresult WHERE race_id = ?', [raceId]);
    await connection.query('DELETE FROM race WHERE race_id = ?', [raceId]);
    await connection.commit();
    res.json({ message: 'Race and all related telemetry deleted successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// -------------------------------------------------------------
// Race Results
// -------------------------------------------------------------
app.get('/api/results', async (req, res) => {
  try {
    const raceId = req.query.raceId;
    let query = `
      SELECT rr.*, 
             r.race_name, r.round_number, r.race_date,
             ch.season_year,
             d.first_name, d.last_name, d.driver_number, d.nationality,
             t.team_name,
             car.car_model, car.car_number, car.engine_manufacturer
      FROM raceresult rr
      JOIN race r ON rr.race_id = r.race_id
      JOIN championship ch ON r.championship_id = ch.championship_id
      JOIN driver d ON rr.driver_id = d.driver_id
      JOIN team t ON rr.team_id = t.team_id
      LEFT JOIN car ON rr.car_id = car.car_id
    `;
    const params = [];
    if (raceId) {
      query += ' WHERE rr.race_id = ?';
      params.push(raceId);
    }
    query += ' ORDER BY rr.race_id ASC, (rr.finishing_position IS NULL), rr.finishing_position ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/results', async (req, res) => {
  try {
    const { race_id, driver_id, team_id, car_id, finishing_position, points_awarded, result_status, total_race_time_seconds } = req.body;
    const [result] = await pool.query(`
      INSERT INTO raceresult 
      (race_id, driver_id, team_id, car_id, finishing_position, points_awarded, result_status, total_race_time_seconds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [race_id, driver_id, team_id, car_id || null, finishing_position || null, points_awarded || 0, result_status || 'FINISHED', total_race_time_seconds || null]);

    res.status(201).json({ result_id: result.insertId, message: 'Race result recorded' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/results/:id', async (req, res) => {
  try {
    const { finishing_position, points_awarded, result_status, total_race_time_seconds, car_id } = req.body;
    await pool.query(`
      UPDATE raceresult 
      SET finishing_position = ?, points_awarded = ?, result_status = ?, total_race_time_seconds = ?, car_id = ?
      WHERE result_id = ?
    `, [finishing_position, points_awarded, result_status, total_race_time_seconds, car_id || null, req.params.id]);
    res.json({ message: 'Race result updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/results/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const resultId = req.params.id;
    await connection.query('DELETE FROM penalty WHERE result_id = ?', [resultId]);
    await connection.query('DELETE FROM pitstop WHERE result_id = ?', [resultId]);
    await connection.query('DELETE FROM lap WHERE result_id = ?', [resultId]);
    await connection.query('UPDATE raceincident SET result_id = NULL WHERE result_id = ?', [resultId]);
    await connection.query('DELETE FROM raceresult WHERE result_id = ?', [resultId]);
    await connection.commit();
    res.json({ message: 'Result and associated telemetry deleted' });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// -------------------------------------------------------------
// Laps
// -------------------------------------------------------------
app.get('/api/laps', async (req, res) => {
  try {
    const { raceId, resultId } = req.query;
    let query = `
      SELECT l.*, 
             rr.race_id, rr.driver_id, rr.team_id,
             d.first_name, d.last_name, d.driver_number,
             t.team_name,
             r.race_name
      FROM lap l
      JOIN raceresult rr ON l.result_id = rr.result_id
      JOIN driver d ON rr.driver_id = d.driver_id
      JOIN team t ON rr.team_id = t.team_id
      JOIN race r ON rr.race_id = r.race_id
    `;
    const params = [];
    const conditions = [];

    if (resultId) {
      conditions.push('l.result_id = ?');
      params.push(resultId);
    }
    if (raceId) {
      conditions.push('rr.race_id = ?');
      params.push(raceId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY l.lap_time_seconds ASC, l.lap_number ASC LIMIT 200';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/laps', async (req, res) => {
  try {
    const { result_id, lap_number, lap_time_seconds, is_fastest_lap } = req.body;
    const [result] = await pool.query(
      'INSERT INTO lap (result_id, lap_number, lap_time_seconds, is_fastest_lap) VALUES (?, ?, ?, ?)',
      [result_id, lap_number, lap_time_seconds, is_fastest_lap ? 1 : 0]
    );
    res.status(201).json({ lap_id: result.insertId, message: 'Lap time recorded' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/laps/:id', async (req, res) => {
  try {
    const { lap_number, lap_time_seconds, is_fastest_lap } = req.body;
    await pool.query(
      'UPDATE lap SET lap_number = ?, lap_time_seconds = ?, is_fastest_lap = ? WHERE lap_id = ?',
      [lap_number, lap_time_seconds, is_fastest_lap ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Lap updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/laps/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM lap WHERE lap_id = ?', [req.params.id]);
    res.json({ message: 'Lap deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Pit Stops & Tyres
// -------------------------------------------------------------
app.get('/api/pitstops', async (req, res) => {
  try {
    const raceId = req.query.raceId;
    let query = `
      SELECT ps.*, 
             tc.compound_name, tc.tyre_type,
             rr.race_id, rr.driver_id, rr.team_id,
             d.first_name, d.last_name, d.driver_number,
             t.team_name,
             r.race_name
      FROM pitstop ps
      JOIN tyrecompound tc ON ps.tyre_id = tc.tyre_id
      JOIN raceresult rr ON ps.result_id = rr.result_id
      JOIN driver d ON rr.driver_id = d.driver_id
      JOIN team t ON rr.team_id = t.team_id
      JOIN race r ON rr.race_id = r.race_id
    `;
    const params = [];
    if (raceId) {
      query += ' WHERE rr.race_id = ?';
      params.push(raceId);
    }
    query += ' ORDER BY ps.duration_seconds ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pitstops', async (req, res) => {
  try {
    const { result_id, tyre_id, lap_number, duration_seconds } = req.body;
    const [result] = await pool.query(
      'INSERT INTO pitstop (result_id, tyre_id, lap_number, duration_seconds) VALUES (?, ?, ?, ?)',
      [result_id, tyre_id, lap_number, duration_seconds]
    );
    res.status(201).json({ pit_stop_id: result.insertId, message: 'Pit stop recorded' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/pitstops/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM pitstop WHERE pit_stop_id = ?', [req.params.id]);
    res.json({ message: 'Pit stop deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/analytics/pitstops', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pitstopanalytics ORDER BY average_duration ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tyres', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tyrecompound ORDER BY tyre_id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Penalties & Incidents
// -------------------------------------------------------------
app.get('/api/penalties', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*,
             rr.race_id, rr.driver_id, rr.team_id,
             d.first_name, d.last_name, d.driver_number,
             t.team_name,
             r.race_name
      FROM penalty p
      JOIN raceresult rr ON p.result_id = rr.result_id
      JOIN driver d ON rr.driver_id = d.driver_id
      JOIN team t ON rr.team_id = t.team_id
      JOIN race r ON rr.race_id = r.race_id
      ORDER BY p.penalty_id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/penalties', async (req, res) => {
  try {
    const { result_id, penalty_type, penalty_description, time_penalty_seconds, position_penalty } = req.body;
    const [result] = await pool.query(`
      INSERT INTO penalty (result_id, penalty_type, penalty_description, time_penalty_seconds, position_penalty)
      VALUES (?, ?, ?, ?, ?)
    `, [result_id, penalty_type, penalty_description || null, time_penalty_seconds || 0, position_penalty || 0]);
    res.status(201).json({ penalty_id: result.insertId, message: 'Penalty logged' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/penalties/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM penalty WHERE penalty_id = ?', [req.params.id]);
    res.json({ message: 'Penalty removed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ri.*,
             r.race_name, r.race_date,
             d.first_name, d.last_name, d.driver_number,
             t.team_name
      FROM raceincident ri
      JOIN race r ON ri.race_id = r.race_id
      LEFT JOIN raceresult rr ON ri.result_id = rr.result_id
      LEFT JOIN driver d ON rr.driver_id = d.driver_id
      LEFT JOIN team t ON rr.team_id = t.team_id
      ORDER BY ri.incident_id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/incidents', async (req, res) => {
  try {
    const { race_id, result_id, lap_number, incident_type, description, safety_car_deployed } = req.body;
    const [result] = await pool.query(`
      INSERT INTO raceincident (race_id, result_id, lap_number, incident_type, description, safety_car_deployed)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [race_id, result_id || null, lap_number || null, incident_type, description || null, safety_car_deployed ? 1 : 0]);
    res.status(201).json({ incident_id: result.insertId, message: 'Race incident recorded' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/incidents/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM raceincident WHERE incident_id = ?', [req.params.id]);
    res.json({ message: 'Incident removed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Sponsors
// -------------------------------------------------------------
app.get('/api/sponsors', async (req, res) => {
  try {
    const [sponsors] = await pool.query(`
      SELECT s.*, 
             COALESCE(SUM(ts.sponsorship_amount), 0) as total_invested,
             COUNT(ts.team_id) as teams_sponsored
      FROM sponsor s
      LEFT JOIN teamsponsor ts ON s.sponsor_id = ts.sponsor_id
      GROUP BY s.sponsor_id
      ORDER BY total_invested DESC
    `);

    const [deals] = await pool.query(`
      SELECT ts.*, t.team_name, s.sponsor_name, ch.season_year
      FROM teamsponsor ts
      JOIN team t ON ts.team_id = t.team_id
      JOIN sponsor s ON ts.sponsor_id = s.sponsor_id
      JOIN championship ch ON ts.championship_id = ch.championship_id
    `);

    res.json({
      sponsors,
      deals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sponsors', async (req, res) => {
  try {
    const { sponsor_name, industry, country } = req.body;
    const [result] = await pool.query(
      'INSERT INTO sponsor (sponsor_name, industry, country) VALUES (?, ?, ?)',
      [sponsor_name, industry || null, country || null]
    );
    res.status(201).json({ sponsor_id: result.insertId, message: 'Sponsor added' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/teamsponsors', async (req, res) => {
  try {
    const { team_id, sponsor_id, championship_id, sponsorship_amount } = req.body;
    await pool.query(`
      INSERT INTO teamsponsor (team_id, sponsor_id, championship_id, sponsorship_amount)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE sponsorship_amount = VALUES(sponsorship_amount)
    `, [team_id, sponsor_id, championship_id, sponsorship_amount || 0]);
    res.status(201).json({ message: 'Sponsorship deal linked successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/sponsors/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM sponsor WHERE sponsor_id = ?', [req.params.id]);
    res.json({ message: 'Sponsor deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Interactive Raw Tables Studio (Inspect & Direct Edit any table)
// -------------------------------------------------------------
app.get('/api/tables', async (req, res) => {
  try {
    const [tables] = await pool.query(`
      SELECT TABLE_NAME, TABLE_TYPE, TABLE_ROWS 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY TABLE_NAME ASC
    `);
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    // Verify valid table in database to prevent SQL injection
    const [[tableCheck]] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND TABLE_NAME = ?
    `, [tableName]);

    if (!tableCheck) {
      return res.status(404).json({ error: 'Table or view not found in database' });
    }

    const [columns] = await pool.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA, COLUMN_DEFAULT
      FROM information_schema.columns
      WHERE table_schema = DATABASE() AND table_name = ?
      ORDER BY ORDINAL_POSITION
    `, [tableName]);

    const [rows] = await pool.query(`SELECT * FROM ?? LIMIT 100`, [tableName]);

    res.json({
      tableName,
      columns,
      rows,
      totalRows: rows.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🏎️ Formula Racing DB API Server running on http://localhost:${PORT}`);
  });
}

export default app;
