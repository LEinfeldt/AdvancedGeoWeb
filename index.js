"use strict";


/**
 * @desc Import libraries and create an instance of express
 */
var config = require('./config.js');
var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var fs  = require('fs');
var app = express();
//var client = new pg.Client();

var httpsport = 8443;

require('https').createServer({
    key: fs.readFileSync('newkey.pem'),
    cert: fs.readFileSync('cert_WWU.pem')
}, app).listen(httpsport);

/* Redirect all traffic over SSL */
app.set('port_https', httpsport);
app.all('*', function(req, res, next){
    if (req.secure) return next();
    res.redirect("https://" + req.hostname + ":" + httpsport + req.url);
});
console.log('https server now listening on port ' + httpsport);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


//accept headers stuff
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');    // allow CORS
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control_Allow-Headers', 'X-Requested-With, Content-Type');
    next();
});

/**
 * @desc Setup the client pool
 */
var pool = new pg.Pool(config);

pool.on('error', function(err, client) {
    console.error('idle client error', err.message, err.stack);
});

/**
 * @desc retreive data from the frontend and store it in the DB
 */
app.post('/api/1.0/GPS', function(req, res) {

    console.log("received some data");    
    //Connect to the database
    pool.connect(function(err, client, done) {
        if (err) throw err;
        // SQL Query > Insert Data
        //execute an operation
        client.query("INSERT INTO locations(geom, accuracy) VALUES(ST_SetSRID(ST_GeomFromGeoJSON($1::text), 4326), $2::int)",
            [JSON.stringify(req.body.geometry), req.body.properties.accuracy],
            function(err, result) {
            console.log('Inserted data');
            if(err) {
                res.send('An error occured: ' + err);
                return console.error('error in query', err);
            }
            else res.status(200).send("Inserted location into the DB");
            //release client to pool
            done();
        });
    });
});

app.get('/api/1.0/GPS', function (req, res) {

    const results = [];
    // Get a Postgres client from the connection pool
    pool.connect(function (err, client, done) {
        if (err) throw err;

        // SQL Query > Select Data
        //const query = client.query("SELECT id, ST_X(geom) AS longitude, ST_Y(geom) AS latitude, time FROM locations WHERE time > NOW() - interval '60 sec';");
        // for testing change query
        const query = client.query("SELECT id, ST_X(geom) AS longitude, ST_Y(geom) AS latitude, time AS timestamp, accuracy, crs FROM locations;");
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });
    });
});

/**
 * @desc Post data from processing results to the database.
 */
app.post('/api/1.0/timeslider/:string/:bounds', function(req, res) {
   
    var name = req.params.string;
    var bounds = req.params.bounds;
    //Connect to the database
    pool.connect(function(err, client, done) {
        if (err) throw err;

        //execute an operation
        client.query("INSERT INTO wms(path, bbox) VALUES($1::text, $2::text);", [name, bounds], function(err, result) {
            console.log('Inserted time data');
            if(err) {
                res.error('An error occured: ' + err);
                return console.error('error in query', err);
            }
            else res.status(200).send("Inserted history into the DB");
            //release client to pool
            done();
        });
    });
});

/**
 * @desc Return the DB entries from the last 10 minutes in a JSON file
 * @return JSON file containing the time and paths from the DB (last 10 min)
 */
app.get('/api/1.0/timeslider/:number', function(req, res) {

    var results = [];
    //Connect to the database
    pool.connect(function(err, client, done) {
        if (err) throw err;
        var query = client.query("SELECT time, path, bbox FROM wms WHERE time > NOW() - ($1 || ' min')::interval ORDER BY time DESC;", [req.params.number]);
        query.on('row', function (row) {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });
    });
});


/**
 * @desc Send the newest png in the DB to the client
 * @return JSON with one item --> the newest picture with its bbox
 */
app.get('/api/1.0/currentPicture', function(req, res) {

    var result = [];

    pool.connect(function(err, client, done) {
        if(err) throw err;
        var query = client.query("SELECT path, bbox, time FROM wms ORDER BY time DESC LIMIT 1;");
        query.on('row', function(row) {
            result = row;
        });
        query.on('end', function() {
            done();
            return res.json(result);
        });
    });
});

app.listen(8080, function () {
    console.log("Server listening on port 8080");
});