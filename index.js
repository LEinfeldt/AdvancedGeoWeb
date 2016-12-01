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
            console.log('Inserted data');
            if(err) {
                res.error('An error occured: ' + err);
                return console.error('error in query', err);
            }
            else res.status(200).send("Inserted location into the DB");
            //release client to pool
            done();
        });
    });
});

app.listen(8080, function() {
    console.log("Server listening on port 8080");
});