const fs = require("fs");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
  res.status(200).send(leagues);
});

app.get("/api/leagues/:leagueId/teams", (req, res) => {
  const { leagueId } = req.params;
  const league = require(`./database/leagues/${leagueId}/league`);
  const leagueInfo = league[0].league;
  const teamsInfo = league[0].teams;
  const teams = teamsInfo.map(({ team }) => {
    return {
      team: {
        id: team.id,
        name: team.name,
        code: team.code,
        country: team.country,
      },
      league: {
        id: leagueInfo.id,
        name: leagueInfo.name,
        country: leagueInfo.country,
        year: leagueInfo.year,
        division: leagueInfo.division,
      },
    };
  });
  res.status(200).send(teams);
});

app.get("/api/leagues/:leagueId/teams/:teamId", (req, res) => {
  const { leagueId, teamId } = req.params;
  const league = require(`./database/leagues/${leagueId}/league`);
  const leagueInfo = league[0].league;
  const teamsInfo = league[0].teams;
  const filteredTeams = teamsInfo.filter((item) => {
    let { team } = item;
    if (team.id == teamId) return item;
  });
  const foundTeam = {
    team: {
      id: filteredTeams[0].team.id,
      name: filteredTeams[0].team.name,
      code: filteredTeams[0].team.country,
    },
    league: {
      id: leagueInfo.id,
      name: leagueInfo.name,
      country: leagueInfo.country,
      year: leagueInfo.year,
      division: leagueInfo.division,
    },
  };
  res.status(200).send(foundTeam);
});

app.get("/api/logos/:id", (req, res) => {
  const { id } = req.params;
  res.status(200).sendFile(__dirname + `/database/logos/${id}.png`);
});

app.get("/api/tournaments", (req, res) => {
  const tournaments = require(`./database/tournaments/tournaments`);
  res.status(200).send(tournaments);
});

app.post("/api/tournaments", upload.single("file"), (req, res) => {
  const { name, apa_id } = req.body;
  const img = req.file;

  console.log(img);

  // const tournaments = require(`./database/tournaments/tournaments`);
  // const newTournaments = [...tournaments, { name, apa_id, img }];
  // fs.writeFileSync(
  //   "./database/tournaments/tournaments.json",
  //   JSON.stringify(newTournaments)
  // );
  // res.status(200).send(newTournaments);
  res.status(200).send("Imagen cargada con éxito");
});

app.get("/api/tournaments/logos/:id", (req, res) => {
  const { id } = req.params;
  res.status(200).sendFile(__dirname + `/database/tournaments/logos/${id}.png`);
});

// app.get("/api/leagues/:leagueId/teams/:teamId/logo", (req, res) => {
//   const { leagueId, teamId } = req.params;
//   res
//     .status(200)
//     .sendFile(__dirname + `/database/leagues/${leagueId}/logos/${teamId}.png`);
// });

/* -------------------- PORT -------------------- */

const PORT = process.env.PORT || "8080";

app.listen(PORT, (err) => {
  if (!err) console.log(`Servidor Express escuchando en el puerto ${PORT}`);
  else console.log(`Error al iniciar el servidor Express: ${err}`);
});
