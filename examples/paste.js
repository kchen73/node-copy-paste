// Before running on command line, copy text externally
'use strict';

var cp = require('copy-paste');
var text;

// When executed on command line, second parameter of callback function is ready for paste
var paste = cp.paste(function(undefined, text) {
    console.log('You pasted --> ' + text);
});
