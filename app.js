const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dataBasePath = path.join(__dirname, 'cricketTeam.db')
const app = express()
app.use(express())

let database = null
const initializaDbAndServer = async () => {
  try {
    database = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Runing at http://localhost:3009/')
    })
  } catch (error) {
    console.log(`DB Error:${error.message}`)
    process.exit(1)
  }
}

initializaDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayerQuery = `
    SELECT * FROM cricket_team;
    `
  const playersArray = await database.all(getPlayerQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  SELECT * FROM cricket_team WHERE player_id = ${playerId};
  `

  const player = await database.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.post('/players/', async (response, request) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPlayerQuery = `
  INSERT INTO
   cricket_team (player_name, jersey_number,role)
  VALUES (${playerName}, ${jerseyNumber},${role});
  `
  const player = await database.run(postPlayerQuery)
  response.send('Player Added to Team')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updatePlayerQuery = `
  UPDATE
    cricket_team 
  SET
    player_name = ${playerName},
    jersey_number = ${jerseyNumber},
    role = ${role}
  where
    plater_id = ${playerId};
  `
  await database.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete(`/players/:playerId/`, async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  DELETE FROM cricket_team WHERE player_id = ${playerId};
  `
  await database.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
