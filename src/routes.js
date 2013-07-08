var library = require('./library');
var _ = require('underscore');
var artistsMiddleware = require('./middleware/artists')();

var prettyEncodeUriComponent = function(str) {
    return encodeURIComponent(str).replace(/%20/g, '+');
};

var prettyDecoreUriComponent = function(str) {
    return decodeURIComponent(str.replace(/\+/g, '%20'));
};

var view = function(viewName, locals) {
    locals = locals || {};
    return function(req, res) {
        res.render(viewName, { locals: locals });
    };
};

module.exports = function(app) {

    app.get('/', view('index'));

    app.get('/artists', artistsMiddleware, function(req, res) {
        var encodedArtists = _.map(req.artists, function(value, artist) {
            return {
                displayName: artist,
                linkName: prettyEncodeUriComponent(artist)
            };
        });

        res.render('artists', {artists: encodedArtists});
    });

    app.get('/artists/:id', function(req, res) {
        var artistName = prettyDecoreUriComponent(req.param('id'));
        library.getAlbums(artistName, function(err, albums) {
            if (err) return res.send(err);

            var encodedAlbums = albums.map(function(album) {
                album.linkName = prettyEncodeUriComponent(album.name)
                return album;
            });

            var model = {
                artist: prettyEncodeUriComponent(artistName),
                albums: encodedAlbums
            };

            console.log(model);

            res.render('albums', model);
        });
    });

    app.get('/artists/:artistId/albums/:albumId', function(req, res) {
        var artistId = prettyDecoreUriComponent(req.param('artistId'))
        var albumId = prettyDecoreUriComponent(req.param('albumId'));
        library.getSongsFromAlbum(artistId, albumId, function(err, songs) {
            if (err) return res.send(err);

            var model = {
                artist: req.param('artistId'),
                album: req.param('albumId'),
                songs: songs
            };

            res.render('songs', model);
        })
    });

    app.get('/artists/:artistId/albums/:albumId/download', function(req, res) {
        var artistId = prettyDecoreUriComponent(req.param('artistId'))
        var albumId = prettyDecoreUriComponent(req.param('albumId'));

        var downloadLink = library.getAlbumDownloadLink(artistId, albumId);
        console.log(downloadLink);
        res.download(downloadLink);
    });

    app.get('/artists/:artistId/albums/:albumId/songs/:songId/download', function(req, res) {
        var artistId = prettyDecoreUriComponent(req.param('artistId'))
        var albumId = prettyDecoreUriComponent(req.param('albumId'));
        var songId = prettyDecoreUriComponent(req.param('songId'));

        var downloadLink = library.getSongDownloadLink(artistId, albumId, songId);
        res.download(downloadLink);
    });

};
