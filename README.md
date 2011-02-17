# Titanium Logger

This is a remote logging server and client code for Titanium applications.  The idea is inspired from <http://cloudebug.com>.  I needed a better tool so I built Titanium Logger.
<img src="https://github.com/sr3d/titanium_logger/raw/master/src/images/webconsole.png" alt="Titanium Logger Webconsole" />


## Features
- Remote logging from any connected devices, however, the connecting device will need to be able to communicate with the logging server.
- Server is written in Ruby using EventMachine, em-websocket, Sinatra
- Web console is done in Websocket, so Chrome, Safari, and Firefox are be supported.
- Any code can be pushed down to the connected devices at anytime, allowing you to test code at run-time.
- Titanium client script is written as a CommonJS module that can be require'd anywhere.

# Usage
## Running server script
- Download the server script:  [server](https://github.com/sr3d/titanium_logger/raw/master/dist/server)
- Install the required gems:
    
        gem install em-websocket            # or with sudo gem install em-websocke
        gem install sinatra                 # or with sudo gem install sinatra
        gem install thin                    # or with sudo gem install thin
    
- chmod the server file to +x and run it, or run with ruby
- if everything goes correctly, you should see something like this ...

        == Sinatra/1.0 has taken the stage on 8486 for development with backup from Thin
        >> Thin web server (v1.2.7 codename No Hup)
        >> Maximum connections set to 1024
        >> Listening on 0.0.0.0:8486, CTRL+C to stop
        ==================
        Web Console locates at:     0.0.0.0:8486
        Logging Server locates at:  0.0.0.0:8484
        ==================

## Client javascript
- download the client script and put it in your Titanium's Resources folder:  [client script](https://github.com/sr3d/titanium_logger/raw/master/dist/logger.js) 
- at the top of your app.js, put 

    var logger = require('path/to/logger').logger('localhost', 8484);
    
- remember, you don't need to put the .js extension.
- anywhere you want to log remotely, just use 

    logger.log("this is a test message");
    
- Object passed to the log() method will be serialized to a string with JSON.stringify()


## Webconsole
- Once the server is up running, point your web browser to http://localhost:8486.  
- profit!


# Limitation
- Your device must be on the same network, otherwise it won't be able to communicate with the logging server.  If you need any devices to see the server, deploy the server script to your own server and point your logger's host to that server accordingly.


# About
- My name is Alex Le.  I'm an entrepreneur and I build web applications.  I'm a single founder bootstrapping Marrily (<http://marrily.com>), an online wedding planner.  Come check it out!  My blog is at <http://alexle.net>
    