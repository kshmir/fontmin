/**
 * @file ttf2woff2
 * @author kshmir
 */

/* eslint-env node */

var isTtf = require('is-ttf');
var through = require('through2');
var ttf2woff2 = require('ttf2woff2');
var b2ab = require('b3b').b2ab;
var ab2b = require('b3b').ab2b;
var replaceExt = require('replace-ext');
var deflate = require('pako').deflate;
var _ = require('lodash');

function compileTtf(buffer, options, cb) {
    var output;
    var ttf2woffOpts = {};

    if (options.deflate) {
        ttf2woffOpts.deflate = deflate;
    }

    try {
        output = ttf2woff2(
                buffer
            )
        ;
    }
    catch (ex) {
        cb(ex);
    }

    output && cb(null, output);
}

/**
 * ttf2woff2 fontmin plugin
 *
 * @param {Object} opts opts
 * @return {Object} stream.Transform instance
 * @api public
 */
module.exports = function (opts) {

    opts = _.extend({clone: true}, opts);

    return through.ctor({
        objectMode: true
    }, function (file, enc, cb) {

        // check null
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        // check stream
        if (file.isStream()) {
            cb(new Error('Streaming is not supported'));
            return;
        }

        // check ttf
        if (!isTtf(file.contents)) {
            cb(null, file);
            return;
        }

        // clone
        if (opts.clone) {
            this.push(file.clone());
        }

        // replace ext
        file.path = replaceExt(file.path, '.woff2');

        compileTtf(file.contents, opts, function (err, buffer) {

            if (err) {
                cb(err);
            }

            file.contents = buffer;
            cb(null, file);
        });

    });

};

