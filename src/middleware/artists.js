var library = require('../library');

module.exports = function() {
    return function artistsMiddleware(req, res, next) {
        library.getArtists(function(err, artists) {
            if (err) return next(err);

            req.artists = artists;
            next();
        });
    };
};
