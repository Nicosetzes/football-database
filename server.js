/* -------------------- DOTENV -------------------- */

// Utilizo dotenv para aplicar variables de entorno //

const dotenv = require("dotenv").config();

/* -------------------- SERVER -------------------- */

const express = require("express");
const cors = require("cors");

/* -------------------- MIDDLEWARES -------------------- */

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(cors()); // This should allow all origins

/* -------------------- ROUTES -------------------- */

app.get("/api/leagues", (req, res) => {
  const leagues = require(`./database/leagues/leagues`);
  res.status(200).send({ leagues });
});

app.get("/api/leagues/:leagueId/teams", (req, res) => {
  const { leagueId } = req.params;
  const league = require(`./database/leagues/${leagueId}/league`);
  const leagueInfo = league.at(0).league;
  const teamsInfo = league.at(0).teams;
  const teams = teamsInfo.map(({ team }) => {
    return {
      id: team.id,
      name: team.name,
      code: team.code,
      country: team.country,
    };
  });
  res.status(200).send({ league: leagueInfo, teams });
});

app.get("/api/leagues/:leagueId/teams/:teamId", (req, res) => {
  const { leagueId, teamId } = req.params;
  const league = require(`./database/leagues/${leagueId}/league`);
  const leagueInfo = league.at(0).league;
  const teamsInfo = league.at(0).teams;
  const filteredTeams = teamsInfo.filter((item) => {
    let { team } = item;
    if (team.id == teamId) return item;
  });
  const foundTeam = {
    id: filteredTeams.at(0).team.id,
    name: filteredTeams.at(0).team.name,
    code: filteredTeams.at(0).team.code,
    country: filteredTeams.at(0).team.country,
  };
  res.status(200).send({ league: leagueInfo, team: foundTeam });
});

app.get("/api/leagues/:leagueId/teams/:teamId/logo", (req, res) => {
  const { leagueId, teamId } = req.params;
  res
    .status(200)
    .sendFile(__dirname + `/database/leagues/${leagueId}/logos/${teamId}.png`);
});

/* -------------------- PORT -------------------- */

const PORT = process.env.PORT || "8080";

app.listen(PORT, (err) => {
  if (!err) console.log(`Servidor Express escuchando en el puerto ${PORT}`);
  else console.log(`Error al iniciar el servidor Express: ${err}`);
});
