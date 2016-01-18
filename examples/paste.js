'use strict';

var cp = require('copy-paste');
var text;

var paste = cp.paste(function(undefined, text) {
    console.log('You pasted --> ' + text);
});