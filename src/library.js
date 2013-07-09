var wrench = require('wrench')
  , fs = require('fs')
  , path = require('path')
  , _ = require('underscore')
  , uuid = require('node-uuid')
  , xld = new require('xld')()
  , targz = new require('./targz')();

var LIBRARY_HOME = '/Users/jmnunezizu/Music/iTunes/iTunes Media/Music'
  , IGNORED_FILES_REGEX = /\.DS_Store/
  , DOWNLOAD_HOME = path.join(process.cwd(), '/tmp');

var removeIgnoredFiles = function(files) {
    return _.reject(files, function(f) { return IGNORED_FILES_REGEX.test(f); });
};

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

Library.prototype.getArtists = function(cb) {
    cb(null, this.cache.artists);
};

Library.prototype.getAlbums = function(artistName, cb) {
    cb(null, this.cache.artists[artistName].albums);
};

Library.prototype.getAlbumDownloadLink = function(artistName, albumName) {
    var source = path.join(this.home, artistName, albumName);
    var target = path.join(DOWNLOAD_HOME, uuid.v4() + '.tar.gz');
    targz.compress(source, target, function() {
        console.log('done');
    });
    return target;
};

Library.prototype.getSongDownloadLink = function(artistName, albumName, songName) {
    return path.join(this.home, artistName, albumName, songName);
};

module.exports = new Library(LIBRARY_HOME);
