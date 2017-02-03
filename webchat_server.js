var fs = require('fs');
var http = require('http');
var WebSockSrv = require('websocket').server;

var server_headers = {
    'Content-Type': 'text/html',
    'X-Powered-By': 'nodejs'
};

var clients = [];

var server = http.createServer(function(request, response) {
    var headers = request.headers;
    var method = request.method;
    var url = request.url;
    var body = [];
    request.on('error', function(err) {
        console.error(err);
    }).on('data', function(chunk){
        body.push(chunk);
    }).on('end', function(){
        body = Buffer.concat(body).toString();

        response.on('error', function(err) {
            console.error(err);
        });

        fs.readFile('index.html', (err,data) => {
            if (err) {
                response.writeHeader(500, server_headers);
                response.write('Something bad happened!\n');
                response.end();
            } else {
                response.writeHeader(200,server_headers);
                response.write(data);
                response.end();
            }
        });
    });
}).listen(8080);

console.log("Listening on port *:8080");

wss = new WebSockSrv({
    httpServer: server
});

wss.on('request', function(request) {
    var conn = request.accept(null, request.origin + "/sys");
    var index = clients.push(conn) - 1;
    console.log((new Date()) + ": Client connected!");

    conn.on('message', function(msg) {
        data = null;
        switch (msg.type) {
            case "utf8":
                data = msg.utf8Data;
                break;
            default:
                data = msg;
        }
        console.log((new Date()) + ": " + data);
        for (var client in clients) {
            if (clients[client] === this) {
                continue;
            } else {
                clients[client].send(data);
            }
        }
    });

    conn.on('close', function(conn){
        clients.splice(index,1);
    });
});
