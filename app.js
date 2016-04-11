var http = require('http'),
    J = require('j'),
    fs = require('fs'),
    url = require('url'),
    qs = require('querystring');

http.createServer(function(req, res) {
  var urlParts = url.parse(req.url, true);
  req.urlParts = urlParts,
  reqPath = urlParts.pathname;
  if (reqPath !== '/extract/spreadsheet') {
    res.writeHead(400, {'Content-type': 'text/plain'});
    res.end("Bad request!")
  } else {
    parseData(req, res, function() {
      switch(req.method) {
        case "POST":
          postReq(req, res);
          break;
        default:
          notFound(req,res);
          break;
      }
    });
  };
}).listen(8080, "localhost");

//Parse the incomning request data 
function parseData(req, res, cb) {
    var body = '';
    req.on('data', function (data) {
        body += data;
        if (body.length > 1e6) {
            req.connection.destroy();
        }
    });
    req.on('end', function () {
        req.body = qs.parse(body);
        console.log(req.body);
        req.urlParams = qs.parse(req.urlParts.query);
        cb(req, res);
    });     
}


//Processing POST request
function postReq(req, res) {
  var path = req.body.location;
  if (typeof(path) !== "string") {
    res.writeHead(400, {'Content-type': 'text/plain'});
    res.end("Bad request: expected path to spreadsheet in form field 'location'");
    return;
  }
  try {
    fs.accessSync(path, fs.R_OK)
  } catch (err) {
    console.log("Error:", err)
    res.writeHead(404, {'Content-type': 'text/plain'});
    res.end(err.message);
    return;
  }
  var oo = "";
  try {
    oo = JSON.stringify(J.utils.to_json(J.readFile(path),true));
  } catch (err) {
    res.writeHead(500, {'Content-type': 'text/plain'});
    res.end(err.message);
    return;
  }
  oo = JSON.stringify(J.utils.to_json(J.readFile(path),true));
  res.writeHead(200, {'Content-type': 'application/json'});
  res.end(oo)
}