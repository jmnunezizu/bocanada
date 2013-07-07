var wrench = require('wrench');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var LIBRARY_HOME = '/Users/jmnunezizu/Music/iTunes/iTunes Media/Music';
var IGNORED_FILES_REGEX = /\.DS_Store/

var removeIgnoredFiles = function(files) {
    return _.reject(files, function(f) { return IGNORED_FILES_REGEX.test(f); });
}

function Library(home, config) {
    this.home = home;
    this.cache = {
        artists: {}
    };
    this.init();
};

Library.prototype.init = function() {
    var artists = this.cache.artists;

    // artists
    var files = removeIgnoredFiles(fs.readdirSync(LIBRARY_HOME));
    files.forEach(function(file) {
        artists[file] = {
            albums: []
        };
        // albums
        var albums = removeIgnoredFiles(fs.readdirSync(path.join(LIBRARY_HOME, file)));
        albums.forEach(function(album) {
            var albumObj = {
                name: album,
                songs: [],
                dir: path.join(file, album)
            };

            var stats = fs.statSync(path.join(LIBRARY_HOME, file, album));
            if (stats.isDirectory()) {
                albumObj.songs = removeIgnoredFiles(wrench.readdirSyncRecursive(path.join(LIBRARY_HOME, file, album)));
            }

            artists[file].albums.push(albumObj);
        });
    });

    //console.log(artists);
};

Library.prototype._init = function() {
    var artistNames = removeIgnoredFiles(fs.readdirSync(this.home));
    var self = this;
    artistNames.forEach(function(artistName) {
        self.cache.artists[artistName] = {};
    });
};

Library.prototype.getArtists = function(cb) {
    cb(null, this.cache.artists);
};

Library.prototype.getAlbums = function(artistName, cb) {
    cb(null, this.cache.artists[artistName].albums);
};

Library.prototype.getAlbumDownloadLink = function(artistName, albumName) {
    return path.join(this.home, artistName, albumName);
};

Library.prototype.getSongDownloadLink = function(artistName, albumName, songName) {
    return path.join(this.home, artistName, albumName, songName);
};

module.exports = new Library(LIBRARY_HOME);
