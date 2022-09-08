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

app.use(
  cors({
    origin:
      process.env.NODE_ENV == "development"
        ? "http://localhost:3000"
        : "https://apa-website-fe.vercel.app",
    credentials: true,
  })
); // IMPORTANTE

/* -------------------- ROUTES -------------------- */

app.get("/api/leagues", (req, res) => {
  const allLeagues = require(`./database/leagues/leagues`);
  res.status(200).send(allLeagues);
});

app.get("/api/leagues/:leagueId/teams", (req, res) => {
  const { leagueId } = req.params;
  const league = require(`./database/leagues/${leagueId}/league`);
  const teams = league.map((item) => {
    let { team } = item;
    return {
      id: team.id,
      name: team.name,
      code: team.code,
      country: team.country,
    };
  });
  res.status(200).send(teams);
});

app.get("/api/leagues/:leagueId/teams/:teamId", (req, res) => {
  const { leagueId, teamId } = req.params;
  const league = require(`./database/leagues/${leagueId}/league`);
  const teams = league.filter((item) => {
    let { team } = item;
    if (team.id == teamId) return item;
  });
  teams.at(0).team;
  const foundTeam = {
    id: teams.at(0).team.id,
    name: teams.at(0).team.name,
    code: teams.at(0).team.code,
    country: teams.at(0).team.country,
  };
  res.status(200).send(foundTeam);
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
