'use strict';

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var Devebot = require('devebot');
var Promise = Devebot.require('bluebird');
var chores = require('./utils/chores');

var Service = function(params) {
  params = params || {};

  var L = this.logger || chores.emptyLogger, T = this.tracer;

  var mongo_conf = params.connection_options || params.connectionOptions || {};
  var mongo_connection_string = chores.buildMongodbUrl(mongo_conf);

  this.open = function(url) {
    url = url || mongo_connection_string;
    return Promise.promisify(function(done) {
      MongoClient.connect(url, mongo_conf, function(err, client) {
        L && T && L.has('debug') && L.log('debug', T.add({ url }).toMessage({
          message: 'Make a connection to: ${url}'
        }));
        done(err, client);
      });
    })();
  }
};

Service.metadata = require('./metadata');

module.exports = Service;
