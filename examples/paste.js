'use strict';

var cp = require('copy-paste');
var text;

// When executed on command line, second parameter of callback function is ready for pasting
var paste = cp.paste(function(undefined, text) {
    console.log('You pasted --> ' + text);
});