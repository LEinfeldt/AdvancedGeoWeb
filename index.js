"use strict";


/**
 * @desc Import libraries and create an instance of express
 */
var config = require('./config.js');
var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var app = express();
//var client = new pg.Client();


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
    console.log(req.body);
    
    //Connect to the database
    pool.connect(function(err, client, done) {
        if (err) throw err;

        //execute an operation
        client.query("INSERT INTO locations(geom) VALUES(ST_GeomFromText('POINT(" + req.body.geometry.coordinates[1] + " " + 
        req.body.geometry.coordinates[0] + ")', 4326));", function(err, result) {
            //release client to pool
            done();
            res.status(200).send("Inserted location into the DB");
            if(err) {
                return console.error('error in query', err);
            }
        });
    });
});

app.get('/api/1.0/GPS', (req, res) => {
  const results = [];
  // Get a Postgres client from the connection pool
  pool.connect(function(err, client, done) {
	if (err) throw err;
	
	
	// SQL Query > Select Data
    const query = client.query("SELECT * FROM locations WHERE time > NOW() - interval '60 sec';");
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});


app.listen(8080, function() {
    console.log("Server listening on port 8080");
});