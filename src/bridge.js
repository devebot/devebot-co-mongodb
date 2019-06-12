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

  const mongo_conf = params.connection_options || params.connectionOptions || params || {};
  const connection_string = chores.buildMongodbUrl(mongo_conf);
  const connection_options = extractConnectionOpts(mongo_conf);

  this.open = function(url, opts) {
    url = url || connection_string;
    opts = opts || connection_options;
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

function extractConnectionOpts(conf = {}) {
  const connection_options = lodash.get(conf, "options", {});
  if (false) {
    return lodash.pick(connection_options, [
      "uri_decode_auth",
      "db",
      "server",
      "replSet",
      "mongos"
    ]);
  }
  return connection_options;
}

Service.manifest = require('./manifest');

module.exports = Service;
