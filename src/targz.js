var fs = require('fs')
var fstream = require('fstream');
var tar = require('tar');
var zlib = require('zlib');
var _ = require('underscore');

var defaultOptions = {
    level: 6, // compression level, from 0-9
    memLevel: 6, // memory allocation, from 1-9
    noProprietary: true
};

function TarGz(options) {
    options = options || {};
    this.options = _.defaults(options, defaultOptions);
}

TarGz.prototype.compress = function(source, target, cb) {
    var self = this;
    console.log('source %s', source);
    console.log('target %s', target);
    fs.stat(source, function(err, stat) {
        if (err) return cb(err);

        process.nextTick(function() {
            var gzip = zlib.createGzip({
                level: self.options.level,
                memLevel: self.options.memLevel
            });

            var reader = fstream.Reader({
                path: source,
                type: 'Directory'
            });
            reader.pipe(tar.Pack({ noProprietary: self.noProprietary }))
                  .pipe(gzip)
                  .pipe(
                    fstream.Writer(target)
                        .on('close', function() {
                            cb(null, {
                                link: target
                            });
                        })
            );
        });
    });

};

module.exports = TarGz;
