"use strict";


/**
 * @desc Import libraries and create an instance of express
 */
var config = require('./config.js');
var express = require('express');
var pg = require('pg');
var app = express();
var client = new pg.Client();


//accept headers stuff
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');    // allow CORS
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    next();
});

/**
 * @desc Setup the client pool
 */
var pool = new pg.Pool(config.dbdata);

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

        //execute an operation
        client.query('INSERT INTO locations(geom) VALUES(ST_GeomFromText(POINT(' + req.json.geometry + '), 4326));', function(err, result) {
            //release client to pool
            done();

            if(err) {
                return console.error('error in query', err);
            }
            console.log(result.rows[0].numbers);
            // do some stuff with the output
        });
    });
});

app.listen(8080, function() {
    console.log("Server listening on port 8080");
});