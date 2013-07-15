var wrench = require('wrench')
  , fs = require('fs')
  , path = require('path')
  , _ = require('underscore')
  , uuid = require('node-uuid')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter
  , kue = require('kue')
  , xld = new require('xld')()
  , TarGz = new require('./targz');

var LIBRARY_HOME = '/Users/jmnunezizu/Music/iTunes/iTunes Media/Music'
  , IGNORED_FILES_REGEX = /\.DS_Store/
  , DOWNLOAD_HOME = path.join(process.cwd(), '/tmp');

var removeIgnoredFiles = function(files) {
    return _.reject(files, function(f) { return IGNORED_FILES_REGEX.test(f); });
};

function Library(home, config) {
    EventEmitter.call(this);
    this.home = home;
    this.cache = {
        artists: {}
    };
    this.jobs = kue.createQueue();
    this.targz = new TarGz();

    var self = this;
    
    this.jobs.process('compress', function(job, done) {
        console.log('Processing the job', job.id);
        var filename = job.id + '.tar.gz';
        self.targz.compress(job.data.source, path.join(job.data.targetDir, filename), function(err, compressedFile) {
            compressedFile.filename = filename;
            self.emit('downloadReady', compressedFile);
            done();
        });
    });

    this.init();
}

/**
 * Inherit from EventEmitter.
 */
util.inherits(Library, EventEmitter);

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
    var compressJob = this.jobs.create('compress', {
        source: path.join(this.home, artistName, albumName),
        targetDir: DOWNLOAD_HOME
    }).save();

    return compressJob;
};

Library.prototype.getSongDownloadLink = function(artistName, albumName, songName) {
    return path.join(this.home, artistName, albumName, songName);
};

module.exports = new Library(LIBRARY_HOME);
