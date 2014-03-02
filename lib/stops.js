'use strict';

var fs = require('fs'),
    path = require('path');

var STOPS_PATH = path.join(__dirname, './../data/busses.json');

var stops = module.exports = JSON.parse(fs.readFileSync(STOPS_PATH, 'utf8'));

// re-implementing bits of underscore for lols
stops.find = function (fn, context) {
  var result;

  this.some(function (value, index, array) {
    if (fn.call(context, value, index, array)) {
      result = value;
      return true;
    }
  });

  return result;
};

stops.findWhere = function (obj) {
  return this.find(matches(obj));
};

stops.where = function (obj) {
  return this.filter(matches(obj));
};

stops.get = function (id) {
  return this.findWhere({id: id});
};

stops.near = function (location) {
  if (!location.lat || !location.lng) {
    throw new Error('object provided to "near" must have "lat" and "lng" properties');
  }

  if (!location.within) {
    location.within = 150;
  }

  return this.filter(function (stop) {
    var distance = getDistance(
      location.lat, 
      location.lng, 
      stop.location.lat, 
      stop.location.lng
    );

    return distance <= location.within;
  });
};


// from Underscore.js
function matches (attrs) {
  return function (obj) {
    if (obj === attrs) return true;
    for (var key in attrs) {
      if (attrs[key] !== obj[key])
        return false;
    }
    return true;
  }
};

function getDistance (lat1, lng1, lat2, lng2) {
  var R = 6371; // Radius of the earth in km

  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lng2 - lng1);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // distance in km
  return Math.round(d * 1000) // distance in metres;
}

function deg2rad (deg) {
  return deg * (Math.PI / 180)
}