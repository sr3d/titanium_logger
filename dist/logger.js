/* Logger class to take care of the logging and conneting to the server.*/
/* jshint eqnull:true */
function debug(message, method) {
  Ti.API.debug("[Logger" + (method != null ? "." + method : "") + "] " + message);
}

var Sandbox = function(logger) {
  // Normally saving a reference to logger whould no be a problem. However we
  // use "this" as the context to execute the eval. So we want to hide logger
  // and only expose the log function. Because of this we use a closure to
  // hide the logger object but still offer a log function.
  this.log   = function() { return logger.log.apply(logger, arguments); };
  this.reset = function() { return logger.reset.apply(logger, arguments); };
};

Sandbox.exec = function(code, sandbox) {
  /* jshint evil:true, boss:true */
  var result;
  if (result = code.match(/^\s*\/([A-za-z]+)(?:\s+(.+))?$/)) {
    return Sandbox.command(sandbox, result[1].toLowerCase(), result[2]);
  }
  else {
    return eval("(function(exports){" + code + "}).call(sandbox,sandbox)");
  }
};

Sandbox.command = function(/* sandbox, command, options... */) {
  var
    sandbox = arguments[0],
    command = arguments[1],
    options = 3 <= arguments.length ? [].slice.call(arguments, 2) : [];
  switch (command) {
    case "reset":
      sandbox.reset();
      break;
    default:
      throw "Unknown command: " + command;
  }
};

var Logger = function(host,port) {
  this.host = host;
  this.port = port;
  this.socket = null;
  this.connected = false;
  this._msgs = []; // just to queued up the messages
  this.reset();
};

Logger.prototype.reset = function() {
  this.sandbox = new Sandbox(this);
};

Logger.prototype.connect = function() {
  var self = this;
  this.socket = Ti.Network.createTCPSocket( {
    hostName: this.host, 
    port: this.port,
    mode: Ti.Network.READ_WRITE_MODE
  });
  this.socket.addEventListener('read', function(msg) {
    try {
      self.log(Sandbox.exec(msg.data,self.sandbox));
    } catch(ex) {
      self.log(ex);
      debug(ex, "connect");
    }
  });
  this.socket.addEventListener('readError', function(){
    debug('Error Reading from Logging Server', "connect");
    self.connected = false;
    // self.ensureConnection();
  });
  this.socket.addEventListener('writeError', function() {
    debug('Error Writing to Logging Server', "connect");
    self.connected = false;
    // self.ensureConnection();
  });
  this.ensureConnection();
};

Logger.prototype.ensureConnection = function() {
  if (this.socket.isValid) { return; }
  this.connected = false;
  var self = this;
  var attempts = 0;
  var checkSocketConnected = setInterval( function() {
    self.connected = self.socket && self.socket.isValid;
    attempts++;
    if(attempts > 3) { 
      clearInterval(checkSocketConnected);
      debug('Giving up trying to connect to Logging server', "ensureConnection");
    }
    if(self.connected) {
      clearInterval(checkSocketConnected);
      self.log('===========================================');
      self.log('Device ' + Titanium.Platform.macaddress + ' connected (' + String.formatDate( new Date(), 'medium') + ')');
      for(var i = 0, len = self._msgs.length; i < len; i++ ) {
        self.log(self._msgs[i]);
      }
      self._msgs = [];
    } else {
      self.socket.connect(); // attempt to connect
    }
  }, 10000);
};
/*
 Log a message to the remote logging server
 If the socket is not ready, queue up the messages to an array that will be sent when there's a good connection
*/
Logger.prototype.log = function(msg) {
  if (msg == null) { return; } // make sure it doesn't bomb out on null objects
  try {
    // this.ensureConnection();
    if(this.connected) {
      this.socket.write(JSON.stringify(msg));
    } else {
      this._msgs.push(msg); // queue up the msg
    }
  } catch (ex) {
    debug(ex, "log");
  }
  debug(msg, "log"); // Redundent data is ok.
};


/*
* Exports the Logger class to create a new instance of the logger.
*/
exports.logger = function(host, post) {
  var logger = new Logger(host, post);
  try {
    logger.connect();
  } catch (ex) {
    alert( 'Connection Error' );
    debug(ex);
  }
  return logger;
};
