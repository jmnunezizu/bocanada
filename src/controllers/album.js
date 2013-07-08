module.exports = {

    album: function(req, res) {
        var artistId = req.param('artistId');
        var albumId = req.param('albumId');
        library.getSongsFromAlbum(artistId, albumId, function(err, songs) {
            if (err) return res.send(err);

            var model = {
                artist: artistId,
                album: albumId,
                songs: songs
            };

            res.render('songs', model);
        })
    }

};
