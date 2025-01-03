const express = require("express");
const bodyParser = require("body-parser");
const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Spotify API Client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Home page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Find song and artist
// Find song and artist
app.post("/find", async (req, res) => {
    const { song, artist } = req.body;
  
    if (!song) {
      return res.status(400).send("Please provide a song name.");
    }
  
    try {
      // Получаем токен доступа
      await spotifyApi.clientCredentialsGrant().then(
        (data) => spotifyApi.setAccessToken(data.body["access_token"]),
        (err) => {
          console.error("Failed to retrieve access token", err);
          throw new Error("Failed to authenticate with Spotify.");
        }
      );
  
      // Выполняем поиск трека
      const searchTracksResponse = await spotifyApi.searchTracks(
        artist ? `track:${song} artist:${artist}` : `track:${song}`
      );
  
      const track = searchTracksResponse.body.tracks.items[0];
      if (!track) {
        return res.status(404).send("Track not found.");
      }
  
      const trackArtist = track.artists[0]; // Первый артист трека
      const albumName = track.album.name; // Имя альбома
      const songUrl = track.external_urls.spotify; // Ссылка на песню
  
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale:1.0">
            <title>Spotify Song Finder</title>
            <link rel="stylesheet" href="/style.css">
          </head>
          <body>
            <h1>Spotify Song Finder</h1>
            <h2>Information</h2>
            <h3>Song Name: ${track.name}</h3>
            <h3>Artist: ${trackArtist.name}</h3>
            <h3>Album: ${albumName}</h3>
            <h3>Song Link: <a href="${songUrl}" target="_blank">Listen on Spotify</a></h3>
            <a href='/'>Find Another Song</a>
          </body>
        </html>
      `);
    } catch (err) {
      console.error(err);
      res.status(500).send(`Error fetching Spotify data: ${err.message}`);
    }
  });
  

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
