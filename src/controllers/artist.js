var library = require('../library');
var _ = require('underscore');

var prettyEncodeUriComponent = function(str) {
    return encodeURIComponent(str).replace(/%20/g, '+');
};

var ArtistController = {

    artists: function(req, res) {
        var encodedArtists = _.map(req.artists, function(value, artist) {
            return {
                displayName: artist,
                linkName: prettyEncodeUriComponent(artist)
            };
        });

        res.render('artists', {artists: encodedArtists});
    },

    artist: function(req, res) {
        var artistName = req.param('id');
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
    }

};

module.exports = ArtistController;
