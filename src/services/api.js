// Formula Racing DB API Service Layer
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api`;

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error or invalid server response' }));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Health & DB Connection
  getHealth: () => fetch(`${BASE_URL}/health`).then(handleResponse),
  getDashboardStats: (season) => fetch(`${BASE_URL}/dashboard/stats?season=${season || ''}`).then(handleResponse),
  searchAll: (query) => fetch(`${BASE_URL}/search?q=${encodeURIComponent(query || '')}`).then(handleResponse),

  // Championships
  getChampionships: () => fetch(`${BASE_URL}/championships`).then(handleResponse),
  createChampionship: (data) => fetch(`${BASE_URL}/championships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateChampionship: (id, data) => fetch(`${BASE_URL}/championships/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteChampionship: (id) => fetch(`${BASE_URL}/championships/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Standings
  getDriverStandings: (season) => fetch(`${BASE_URL}/standings/drivers?season=${season || ''}`).then(handleResponse),
  getConstructorStandings: (season) => fetch(`${BASE_URL}/standings/constructors?season=${season || ''}`).then(handleResponse),

  // Teams & Cars
  getTeams: () => fetch(`${BASE_URL}/teams`).then(handleResponse),
  createTeam: (data) => fetch(`${BASE_URL}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateTeam: (id, data) => fetch(`${BASE_URL}/teams/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteTeam: (id) => fetch(`${BASE_URL}/teams/${id}`, { method: 'DELETE' }).then(handleResponse),

  getCars: () => fetch(`${BASE_URL}/cars`).then(handleResponse),
  createCar: (data) => fetch(`${BASE_URL}/cars`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteCar: (id) => fetch(`${BASE_URL}/cars/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Drivers
  getDrivers: (season) => fetch(`${BASE_URL}/drivers?season=${season || ''}`).then(handleResponse),
  createDriver: (data) => fetch(`${BASE_URL}/drivers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateDriver: (id, data) => fetch(`${BASE_URL}/drivers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteDriver: (id) => fetch(`${BASE_URL}/drivers/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Circuits
  getCircuits: () => fetch(`${BASE_URL}/circuits`).then(handleResponse),
  createCircuit: (data) => fetch(`${BASE_URL}/circuits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateCircuit: (id, data) => fetch(`${BASE_URL}/circuits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteCircuit: (id) => fetch(`${BASE_URL}/circuits/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Races
  getRaces: (season) => fetch(`${BASE_URL}/races?season=${season || ''}`).then(handleResponse),
  createRace: (data) => fetch(`${BASE_URL}/races`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateRace: (id, data) => fetch(`${BASE_URL}/races/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteRace: (id) => fetch(`${BASE_URL}/races/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Race Results
  getResults: (raceId) => fetch(`${BASE_URL}/results?raceId=${raceId || ''}`).then(handleResponse),
  createResult: (data) => fetch(`${BASE_URL}/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateResult: (id, data) => fetch(`${BASE_URL}/results/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteResult: (id) => fetch(`${BASE_URL}/results/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Laps
  getLaps: (raceId, resultId) => fetch(`${BASE_URL}/laps?raceId=${raceId || ''}&resultId=${resultId || ''}`).then(handleResponse),
  createLap: (data) => fetch(`${BASE_URL}/laps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateLap: (id, data) => fetch(`${BASE_URL}/laps/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteLap: (id) => fetch(`${BASE_URL}/laps/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Pit Stops & Tyres
  getPitStops: (raceId) => fetch(`${BASE_URL}/pitstops?raceId=${raceId || ''}`).then(handleResponse),
  createPitStop: (data) => fetch(`${BASE_URL}/pitstops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deletePitStop: (id) => fetch(`${BASE_URL}/pitstops/${id}`, { method: 'DELETE' }).then(handleResponse),
  getPitStopAnalytics: () => fetch(`${BASE_URL}/analytics/pitstops`).then(handleResponse),
  getTyreCompounds: () => fetch(`${BASE_URL}/tyres`).then(handleResponse),

  // Penalties & Incidents
  getPenalties: () => fetch(`${BASE_URL}/penalties`).then(handleResponse),
  createPenalty: (data) => fetch(`${BASE_URL}/penalties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deletePenalty: (id) => fetch(`${BASE_URL}/penalties/${id}`, { method: 'DELETE' }).then(handleResponse),

  getIncidents: () => fetch(`${BASE_URL}/incidents`).then(handleResponse),
  createIncident: (data) => fetch(`${BASE_URL}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteIncident: (id) => fetch(`${BASE_URL}/incidents/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Sponsors
  getSponsors: () => fetch(`${BASE_URL}/sponsors`).then(handleResponse),
  createSponsor: (data) => fetch(`${BASE_URL}/sponsors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  createTeamSponsorship: (data) => fetch(`${BASE_URL}/teamsponsors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteSponsor: (id) => fetch(`${BASE_URL}/sponsors/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Raw Database Tables Studio
  getTables: () => fetch(`${BASE_URL}/tables`).then(handleResponse),
  getTableData: (tableName) => fetch(`${BASE_URL}/tables/${tableName}`).then(handleResponse)
};
