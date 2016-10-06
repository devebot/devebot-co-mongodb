'use strict';

var events = require('events');
var util = require('util');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var Devebot = require('devebot');
var Promise = Devebot.require('bluebird');
var lodash = Devebot.require('lodash');
var debug = Devebot.require('debug');
var debuglog = debug('devebot:co:mongodb:mongodbBridge');

var chores = require('../utils/chores.js');

var noop = function() {};

var Service = function(params) {
  debuglog.isEnabled && debuglog(' + constructor start ...');

  params = params || {};

  var self = this;

  self.logger = self.logger || params.logger || { trace: noop, info: noop, debug: noop, warn: noop, error: noop };

  var mongo_conf = params.connection_options || {};
  var mongo_connection_string = chores.buildMongodbUrl(mongo_conf);

  self.getDbObject = function(url) {
    url = url || mongo_connection_string;
    return Promise.promisify(function(done) {
      MongoClient.connect(url, function(err, db) {
        debuglog.isEnabled && debuglog(' - Make a connection to [%s]', url);
        done(err, db);
      });
    })();
  }

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

  debuglog.isEnabled && debuglog(' - constructor has finished');
};

Service.argumentSchema = {
  "id": "mongodbBridge",
  "type": "object",
  "properties": {
    "connection_options": {
      "type": "object"
    }
  }
};

module.exports = Service;
