var library = require('./library');
var _ = require('underscore');

// Controllers
var artistController = require('./controllers/artist');
var albumController = require('./controllers/album');

// Middleware
var artistsMiddleware = require('./middleware/artists')();

var view = function(viewName, locals) {
    locals = locals || {};
    return function(req, res) {
        res.render(viewName, { locals: locals });
    };
};

module.exports = function(app) {

    app.get('/', view('index'));

    // artists
    app.get('/artists', artistsMiddleware, artistController.artists);
    app.get('/artists/:id', artistController.artist);

    // album
    app.get('/artists/:artistId/albums/:albumId', albumController.album);

    app.get('/artists/:artistId/albums/:albumId/download', function(req, res) {
        var artistId = req.param('artistId');
        var albumId = req.param('albumId');

        var downloadLink = library.getAlbumDownloadLink(artistId, albumId);
        console.log(downloadLink);
        res.download(downloadLink);
    });

    app.get('/artists/:artistId/albums/:albumId/songs/:songId/download', function(req, res) {
        var artistId = req.param('artistId');
        var albumId = req.param('albumId');
        var songId = req.param('songId');

        var downloadLink = library.getSongDownloadLink(artistId, albumId, songId);
        res.download(downloadLink);
    });

};
