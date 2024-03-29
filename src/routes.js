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

module.exports = function(app, library) {

    app.get('/', view('index'));

    // artists
    app.get('/artists', artistsMiddleware, artistController.artists);
    app.get('/artists/:id', artistController.artist);

    // albums
    app.get('/artists/:artistId/albums/:albumId', albumController.album);

    app.get('/artists/:artistId/albums/:albumId/download', function(req, res) {
        var artistId = req.param('artistId');
        var albumId = req.param('albumId');

        var downloadLink = library.getAlbumDownloadLink(artistId, albumId);
        res.send(202, { status: 'queued' });
    });

    app.get('/artists/:artistId/albums/:albumId/songs/:songId/download', function(req, res) {
        var artistId = req.param('artistId');
        var albumId = req.param('albumId');
        var songId = req.param('songId');

        var downloadLink = library.getSongDownloadLink(artistId, albumId, songId);
        res.download(downloadLink);
    });

    app.get('/download/:id', function(req, res) {
        var downloadId = req.param('id');
        res.download(process.cwd() + '/tmp/' + downloadId);
    });

};
