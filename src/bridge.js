'use strict';

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const Devebot = require('devebot');
const Promise = Devebot.require('bluebird');
const lodash = Devebot.require('lodash');
const chores = require('./utils/chores');

function Service(params) {
  params = params || {};

  const L = this.logger || chores.emptyLogger, T = this.tracer;

  const mongo_conf = params.connection_options || params.connectionOptions || {};
  const connection_string = chores.buildMongodbUrl(mongo_conf);
  const connection_options = lodash.pick(mongo_conf, [
    "uri_decode_auth",
    "db",
    "server",
    "replSet",
    "mongos"
  ])

  this.open = function(url) {
    url = url || connection_string;
    return Promise.promisify(function(done) {
      MongoClient.connect(url, connection_options, function(err, client) {
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
