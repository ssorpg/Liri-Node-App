// GLOBALS

// Requires
require('dotenv').config();
const fs = require('fs');
const util = require('util');

const keys = require('./keys.js');

const Spotify = require('node-spotify-api');
const moment = require('moment');
const axios = require('axios');

// API Keys
const bitAPIKey = keys.bandsInTown.key;
const spotify = new Spotify(keys.spotify);
const omdbAPIKey = keys.omdb.key;



// FUNCTIONS
function concertThis(searchTerm) {
    const queryURL = 'https://rest.bandsintown.com/artists/' + encodeURIComponent(searchTerm) + '/events?app_id=' + bitAPIKey;

    axios.get(queryURL).then(response => {
        const concerts = response.data;
        let numConcerts = 0;

        while (numConcerts < 5 && concerts[numConcerts] && typeof concerts === 'object') {
            const concertName = concerts[numConcerts].venue.name;
            const concertRegion = concerts[numConcerts].venue.region;
            const concertDate = moment(concerts[numConcerts].datetime).format('L');

            numConcerts++;

            console.log(numConcerts);
            console.log('Location: ' + concertName + ', ' + concertRegion);
            console.log('Date: ' + concertDate);
            console.log('-------------');
        }

        if (numConcerts === 0) {
            console.error('ERROR: No concerts found for ' + searchTerm + '.');
        }
    }).catch(error => {
        if (error.response) {
            console.error('ERROR: ' + error.response.data.errorMessage);
        }
        else {
            console.error('ERROR: ' + error);
        }
    });
}

function spotifyThisSong(searchTerm) {
    spotify.search({ type: 'track', query: searchTerm }).then(data => {
        const tracks = data.tracks.items;
        let numTracks = 0;

        while (numTracks < 5 && tracks[numTracks]) {
            const artistName = tracks[numTracks].artists[0].name;
            const trackName = tracks[numTracks].name;
            const trackPreview = tracks[numTracks].preview_url;
            const trackAlbum = tracks[numTracks].album.name;

            numTracks++;

            console.log(numTracks);
            console.log('Artist: ' + artistName);
            console.log('Song name: ' + trackName);
            console.log('Song preview: ' + trackPreview);
            console.log('Album: ' + trackAlbum);
            console.log('-------------');
        }

        if (numTracks === 0) {
            console.error('ERROR: No songs found for ' + searchTerm + '.');
        }
    }).catch(error => {
        console.error('ERROR: ' + error);
    });
}

function movieThis(searchTerm) {
    let queryURL = 'http://www.omdbapi.com/?apikey=' + omdbAPIKey + '&t=' + encodeURIComponent(searchTerm);

    axios.get(queryURL).then(response => {
        const movie = response.data;

        if (movie.Error) {
            return console.error('ERROR: ' + movie.Error);
        }

        console.log('Movie title: ' + movie.Title);
        console.log('Release year: ' + movie.Year);
        console.log('IMDB rating: ' + movie.imdbRating);

        let ratings = movie.Ratings;

        for (const rating in ratings) {
            if (ratings[rating].Source === 'Rotten Tomatoes') {
                console.log('Rotten Tomatoes rating: ' + ratings[rating].Value);
                break;
            }
        }

        console.log('Available in: ' + movie.Country);
        console.log('Language(s): ' + movie.Language);
        console.log('Plot: ' + movie.Plot);
        console.log('Actors: ' + movie.Actors);

    }).catch(error => {
        console.error('ERROR: ' + error);
    });
}

function doWhatItSays() {
    const readFile = util.promisify(fs.readFile);

    readFile('random.txt', 'utf8').then(data => {
        const matches = data.split(',');

        const searchType = matches[0].trim();
        const searchTerm = matches[1].trim();

        if (searchType === 'do-what-it-says') {
            console.error('ERROR: Loop detected, exiting...');
            return;
        }

        searchValidation(searchType, searchTerm);
    }).catch(error => {
        console.error('ERROR: ' + error);
    });
}

function joinSearchTerms(argumentArray) {
    let terms = [];

    for (let index = 3; index < argumentArray.length; index++) {
        terms.push(argumentArray[index]);
    }

    return terms.join(' ');
}

function searchValidation(searchType, searchTerm) {
    const validSearchTypes = ['concert-this', 'spotify-this-song', 'movie-this', 'do-what-it-says'];

    if (!validSearchTypes.includes(searchType)) {
        console.error('ERROR: Please enter a valid search type.');
        console.warn('Valid search types: ' + validSearchTypes.join(', ') + '.');
        return;
    }
    else if (searchType !== 'do-what-it-says' && !searchTerm) {
        console.error('ERROR: Please enter a search term.');
        return;
    }

    switch (searchType) {
        case 'concert-this':
            concertThis(searchTerm);
            break;
        case 'spotify-this-song':
            spotifyThisSong(searchTerm);
            break;
        case 'movie-this':
            movieThis(searchTerm);
            break;
        case 'do-what-it-says':
            doWhatItSays();
            break;
    }
}

function initialization() {
    console.log('');

    const searchType = process.argv[2];
    const searchTerm = joinSearchTerms(process.argv);

    searchValidation(searchType, searchTerm);
}



// FUNCTION CALLS
initialization();