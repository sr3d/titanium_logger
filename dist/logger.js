/* Logger class to take care of the logging and conneting to the server.*/
var Logger = function(host,port) {
  this.host = host;
  this.port = port;
  this.socket = null;
  this.connected = false;
  this._msgs = []; // just to queued up the messages
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
      eval('(function(){' + msg.data + '})()' );
    } catch(ex) {
      Ti.API.debug(ex);
    };
  });
  this.socket.addEventListener('readError', function(){
    Ti.API.debug('readError');
    self.connected = false;
    self.ensureConnection();
  });
  this.socket.addEventListener('writeError', function() {
    Ti.API.debug('writeError');
    self.connected = false;
    self.ensureConnection();
  });
  this.ensureConnection();
};

Logger.prototype.ensureConnection = function() {
  if(this.socket.isValid) {return; };
  this.connected = false;
  var self = this;
  var attempts = 0;
  var checkSocketConnected = setInterval( function() {
    self.connected = self.socket && self.socket.isValid;
    attempts++;
    if(attempts > 3) { 
      clearInterval(checkSocketConnected);
      Ti.API.debug('Giving up trying to connect to Logging server');
    };
    if(self.connected) {
      clearInterval(checkSocketConnected);
      self.log('===========================================');
      self.log('Device ' + Titanium.Platform.macaddress + ' connected (' + String.formatDate( new Date(), 'medium') + ')');
      for(var i = 0, len = self._msgs.length; i < len; i++ ) {
        self.log(self._msgs[i]);
      };
      self._msgs = [];
    } else {
      self.socket.connect(); // attempt to connect
    };
  }, 1000);
};
/*
 Log a message to the remote logging server
 If the socket is not ready, queue up the messages to an array that will be sent when there's a good connection
*/
Logger.prototype.log = function(msg) {
  if(msg === null) { msg = ''; }
  try {
    this.ensureConnection();
    if(this.connected) {
      this.socket.write(JSON.stringify(msg));
    } else {
      this._msgs.push(msg); // queue up the msg
    };
  } catch (ex) {
    Ti.API.debug(ex);
  };
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
    Ti.API.debug(ex);
  };
  return logger;
};