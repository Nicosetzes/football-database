const fs = require("fs");
const path = require("path");
const multer = require("multer");

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

// MULTER CONFIG FOR TOURNAMENT IMG UPLOAD BEGINS //

const tournamentImgStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./database/tournaments/logos`);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
    // cb(null, "file.png");
  },
});

const uploadTournamentImg = multer({
  storage: tournamentImgStorage,
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(req, file, cb) {
    // if (!file.originalname.match(/\.(png|jpg)$/)) {     // upload only png and jpg format
    if (!file.originalname.match("png")) {
      // upload only png and jpg format
      return cb(new Error("Please upload a Image in PNG format"));
    }
    cb(undefined, true);
  },
});

// MULTER CONFIG FOR TOURNAMENT IMG UPLOAD ENDS //

app.post("/api/tournaments", uploadTournamentImg.single("file"), (req, res) => {
  const { name, apa_id } = req.body;

  console.log(req.file);

  // Actualizo tournaments.json en football-database //

  const tournaments = require(`./database/tournaments/tournaments`);

  const apaIdsFromTournaments = tournaments
    .map(({ apa_id }) => Number(apa_id))
    .sort((a, b) => (a > b ? 1 : -1));

  console.log(apaIdsFromTournaments);

  console.log(apaIdsFromTournaments.at(-1));

  console.log(apa_id); // Será null si es un nuevo formato de torneo //

  // if (!apa_id) { // No entra con esta linea, REVISAR //
  const newApaId = Number(apaIdsFromTournaments.at(-1)) + 1;
  console.log(newApaId);
  const newTournaments = [...tournaments, { name, apa_id: newApaId }];
  fs.writeFileSync(
    "./database/tournaments/tournaments.json",
    JSON.stringify(newTournaments)
  );
  console.log("Se actualizó tournaments.json");
  // Guardo el archivo imagen del nuevo torneo en tournaments/logos //

  fs.renameSync(
    req.file.path,
    req.file.path.replace(
      req.file.filename,
      newApaId + path.extname(req.file.originalname)
    )
  );

  console.log("La nueva imagen se cargó con éxito");

  res.status(200).send("OK");
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
