var prettyEncodeUriComponent = function(str) {
    return encodeURIComponent(str).replace(/%20/g, '+');
};

module.exports = function(options) {
    return function spaceHexUrlReplacer(req, res, next) {
        var decodedUrl = decodeURIComponent(req.url.replace(/\+/g, '%20'));
        console.log('Decoded the url from %s to %s', req.url, decodedUrl);
        
        req.url = decodedUrl;

        /*res.on('header', function() {
            res.url = encodeURIComponent(req.url).replace(/%20/g, '+');
        });*/

        next();
    };
};
