/** Module imported to provide forking and spawning capabilities */
var child_process = require("child_process");
var spawn = child_process.spawn;
/** Module imported to provide utility functions */
var util = require("util");

/** 
 * Loops to check if native execSync is available
 * @returns null
 */
var execSync = (function() {
    if(child_process.execSync) { 
        /** @returns TBD */
        return function(cmd) { return child_process.execSync(cmd); };
	} else {
		try { // Try using fallback package if available
            /** Module imported to provide synchronous execution with status code support */
			var execSync = require("sync-exec");
            /** @returns TBD */
			return function(cmd) { return execSync(cmd).stdout; };
		} catch(e) {}
	}
	return null;
})();

var config;

/**  
 * Determines which platform is used
 * Throws error if platform is unknown to module
 */
switch(process.platform) {
	case "darwin":
		config = require("./platform/darwin");
		break;
	case "win32":
		config = require("./platform/win32");
		break;
	case "linux":
		config = require("./platform/linux");
		break;
	case "openbsd":
		config = require("./platform/openbsd");
		break;
	default:
		throw new Error("Unknown platform: '" + process.platform + "'.  Send this error to xavi.rmz@gmail.com.");
}

/**
 * no operation (do nothing) function
 */
var noop = function() {};

/**
 * Copies text to clipboard
 * @param text - data that will be copied to clipboard
 * @param callback
 * @return text - data that is copied to clipboard
 */
exports.copy = function(text, callback) {
	var child = spawn(config.copy.command, config.copy.args);
    
    /** Copy data to clipboard if callback exists, otherwise do nothing */
	var done = (callback ? function() { callback.apply(this, arguments); done = noop; } : noop);

	var err = [];
    
	/**
     * COMMENT NEEDED HERE
     */
    child.stdin.on("error", function (err) { done(err); });
	child
        /**
         * COMMENT NEEDED HERE
         */
		.on("exit", function() { done(null, text); })
        /**
         * COMMENT NEEDED HERE
         */
		.on("error", function(err) { done(err); })
		.stderr
            /**
             * Data is pushed to the err array
             */
			.on("data", function(chunk) { err.push(chunk); })
            /**
             * Tests whether there is data to be copied to clipboard
             * @returns 'nothing'
             */
			.on("end", function() {
				if(err.length === 0) { return; }
				done(new Error(config.decode(err)));
			})
	;
    /** Reads in text if work done on text is finished */
	if(text.pipe) { text.pipe(child.stdin); }
	else {
		var output, type = Object.prototype.toString.call(text);
        
        /** Determines the data type that is copied and converts data into text format */
		if(type === "[object String]") { output = text; }
		else if(type === "[object Object]") { output = util.inspect(text, { depth: null }); }
		else if(type === "[object Array]") { output = util.inspect(text, { depth: null }); }
		else { output = text.toString(); }

		child.stdin.end(config.encode(output));
	}

	return text;
};

/** Chains the saved data located in the clipboard */
var pasteCommand = [ config.paste.command ].concat(config.paste.args).join(" ");

/** 
 * Pastes text from clipboard
 * @param callback
 */
exports.paste = function(callback) {
	/** Pastes text from second parameter of callback function if callback exists */
    /** Throws error if callback does not exist and execSync is not supported */
    if(execSync && !callback) { return config.decode(execSync(pasteCommand)); }
	else if(callback) {
		var child = spawn(config.paste.command, config.paste.args);

		/** Paste text from clipboard and perform no operation if callback function exists */
        var done = callback && function() { callback.apply(this, arguments); done = noop; };

		var data = [], err = [];
        
        /**
         * COMMENT NEEDED HERE
         */
		child.on("error", function(err) { done(err); });
		child.stdout
			/**
             * Data is pushed into the data array
             */
            .on("data", function(chunk) { data.push(chunk); })
            /**
             * Data is decoded
             */
			.on("end", function() { done(null, config.decode(data)); })
		;
		child.stderr
            /**
             * Data is pushed into the err array
             */
			.on("data", function(chunk) { err.push(chunk); })
			/**
             * Tests whether clipboard contains data or not
             * @returns 'nothing'
             */
            .on("end", function() {
				if(err.length === 0) { return; }

				done(new Error(config.decode(err)));
			})
		;
	} else {
		throw new Error("A synchronous version of paste is not supported on this platform.");
	}
};

/**
 * If silent is called, throw deprecated error
 */
exports.silent = function() {
	throw new Error("DEPRECATED: copy-paste is now always silent.");
};

/**
 * If noConflict is called, throw deprecated error
 */
exports.noConflict = function() {
	throw new Error("DEPRECATED: copy-paste no longer adds global variables by default.");
};

/**
 * If global is called and chained to require("copy-paste"), copy and paste are added to global namespace
 * @returns exports - public functions
 */
exports.global = function() {
	GLOBAL.copy = exports.copy;
	GLOBAL.paste = exports.paste;

	return exports;
};
