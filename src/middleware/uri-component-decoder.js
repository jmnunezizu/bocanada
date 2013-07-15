module.exports = function(options) {
    return function uriComponentDecoder(req, res, next) {
        var decodedUrl = decodeURIComponent(req.url.replace(/\+/g, '%20'));
        //console.log('Decoded the url from %s to %s', req.url, decodedUrl);
        req.url = decodedUrl;

        next();
    };
};
