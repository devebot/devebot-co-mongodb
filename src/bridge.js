'use strict';

var events = require('events');
var util = require('util');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongojs = require('mongojs');

var Devebot = require('devebot');
var Promise = Devebot.require('bluebird');
var lodash = Devebot.require('lodash');
var pinbug = Devebot.require('pinbug');
var debuglog = pinbug('devebot:co:mongodb:bridge');

var Helper = require('./helper');
var chores = require('./utils/chores');

var Service = function(params) {
  debuglog.enabled && debuglog(' + constructor start ...');

  params = params || {};

  var self = this;

  self.logger = self.logger || params.logger || chores.emptyLogger;

  var mongo_conf = params.connection_options || params.connectionOptions || {};
  var mongo_connection_string = chores.buildMongodbUrl(mongo_conf);

  self.open = function(url) {
    url = url || mongo_connection_string;
    return Promise.promisify(function(done) {
      MongoClient.connect(url, function(err, client) {
        debuglog.enabled && debuglog(' - Make a connection to [%s]', url);
        done(err, client);
      });
    })();
  }

  var _client;
  Object.defineProperty(self, 'client', {
    get: function() {
      return (_client = _client || mongojs(mongo_connection_string));
    },
    set: function(value) {}
  });

  var _helper;
  Object.defineProperty(self, 'helper', {
    get: function() {
      return (_helper = _helper || new Helper({ client: self.client, logger: self.logger }));
    },
    set: function(value) {}
  });

  self.getServiceInfo = function() {
    var conf = lodash.pick(mongo_conf, ['host', 'port', 'name', 'username', 'password']);
    lodash.assign(conf, { password: '***' });
    return {
      connection_info: conf,
      url: chores.buildMongodbUrl(conf)
    };
  };

  self.getServiceHelp = function() {
    var info = self.getServiceInfo();
    return [{
      type: 'record',
      title: 'MongoDB bridge',
      label: {
        connection_info: 'Connection options',
        url: 'URL'
      },
      data: {
        connection_info: JSON.stringify(info.connection_info, null, 2),
        url: info.url
      }
    }];
  };

  debuglog.enabled && debuglog(' - constructor has finished');
};

Service.metadata = require('./metadata');

module.exports = Service;
