// Добавляем правильный поисковый запрос
        // Ищем трек с указанием артиста для более точного поиска
        const searchTracksResponse = await spotifyApi.searchTracks(`track:${song} artist:${artist}`);
        const searchArtistsResponse = await spotifyApi.searchArtists(artist);

        // Проверяем наличие результатов
        const tracks = searchTracksResponse.body.tracks.items;
        const artists = searchArtistsResponse.body.artists.items;

        if (!tracks.length || !artists.length) {
            return res.status(404).send("Song or artist not found");
        }

        const track = tracks[0];
        const foundArtist = artists[0];