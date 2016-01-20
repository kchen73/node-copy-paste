'use strict';

var cp = require('copy-paste');

// When executed on command line, first parameter is copied to clipboard
var copy = cp.copy('text-you-want-to-copy', function() {
    console.log('You copied --> ' + copy);
    console.log('You can now paste the text in any text field!');
});  
