"use strict";


/**
 * @desc Import libraries and create an instance of express
 */
var config = require('./config.js');
var express = require('express');
var pg = require('pg');
var app = express();
var client = new pg.Client();


/**
 * @desc Setup the client pool
 */
var pool = new pg.Pool(config.dbdata);


/**
 * @desc Connect to the database
 */
pool.connect(function(err, client, done) {
    if (err) throw err;

    //execute an operation
    client.query(/*...someQuery...,*/ function(err, result) {
        //release client to pool
        done();

        if(err) {
            return console.error('error in query', err);
        }
        console.log(result.rows[0].numbers);
        // do some stuff with the output
    })
});

pool.on('error', function(err, client) {
    console.error('idle client error', err.message, err.stack);
});

/**
 * @desc retreive data from the frontend and store it in the DB
 */
app.post('/saveGPS', function(req, res) {
    // store the data in the DB
})

app.listen(8080, function() {
    console.log("Server listening on port 8080");
});