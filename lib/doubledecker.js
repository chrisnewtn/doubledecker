'use strict';

var scraper = require('./scraper'),
    Q = require('q');

var doubledecker = module.exports = {},
    stops = doubledecker.stops = require('./stops');

doubledecker.getStop = function (options, callback) {
  var deferred = Q.defer(),
      stop;

  if (!options.id) {
    throw new Error('Call to getStop missing "id" option');
  }

  stop = stops.get(options.id);

  if (!stop) {
    throw new Error('Unable to find stop with matching "id"');
  }

  scraper.scrape(stop.id, options.service, function (err, departures) {
    if (!err) {
      stop.services = departures.services;
      stop.departures = departures.timetable;

      if (callback) {
        callback(null, stop);
      } else {
        deferred.resolve(stop);
      }
    } else {
      if (callback) {
        callback(err);
      } else {
        deferred.reject(err);
      }
    }
  });

  return deferred.promise;
};

doubledecker.getStopsNear = function (options, callback) {
  var deferred = Q.defer(), 
      nearbyStops = stops.near(options);

  var gotData = Q.all(nearbyStops.map(function (stop) {
    return doubledecker.getStop({id: stop.id, service: options.service});
  }));

  gotData.then(function (nearbyStops) {
    if (callback) {
      callback(null, nearbyStops);
    } else {
      deferred.resolve(nearbyStops);
    }
  }, function (err) {
    if (callback) {
      callback(err);
    } else {
      deferred.reject(err);
    }
  });

  return deferred.promise;
};