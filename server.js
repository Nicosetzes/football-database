/* -------------------- DOTENV -------------------- */

// Utilizo dotenv para aplicar variables de entorno //

const dotenv = require("dotenv").config();

/* -------------------- SERVER -------------------- */

const express = require("express");

/* -------------------- MIDDLEWARES -------------------- */

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* -------------------- ROUTES -------------------- */

app.get("/", (req, res) => {
  res.status(200).send("Hola");
});

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
  console.log("hola");
  res
    .status(200)
    .sendFile(__dirname + `/database/leagues/${leagueId}/logos/${teamId}.png`);
});

// app.get("/api/league/:id/:season", async (req, res) => {
//   const leagueId = req.params.id;
//   const season = req.params.season;

//   const teams = [];

//   const axios = require("axios");
//   const config = {
//     method: "get",
//     url: `https://v3.football.api-sports.io/teams?league=${leagueId}&season=${season}`,
//     headers: {
//       "x-rapidapi-key": "c6fc4afceaf077867ce47212440002cf",
//       "x-rapidapi-host": "v3.football.api-sports.io",
//     },
//   };

//   axios(config)
//     .then(function (response) {
//       // console.log("JSON STRINGIFY RESPONSE.DATA")
//       // console.log(JSON.stringify(response.data));
//       teams.push(response.data);
//       const { response: apiResponse } = teams[0];
//       // console.log("teams")
//       // console.log(teams)
//       // console.log("apiResponse")
//       // console.log(apiResponse)
//       // console.log(apiResponse);
//       res.status(200).send(apiResponse);
//       // res.render("api", { apiResponse });
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// });

/* -------------------- PORT -------------------- */

const PORT = process.env.PORT || "8080";

app.listen(PORT, (err) => {
  if (!err) console.log(`Servidor Express escuchando en el puerto ${PORT}`);
  else console.log(`Error al iniciar el servidor Express: ${err}`);
});
