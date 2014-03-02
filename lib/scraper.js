'use strict';

// Requires
var request = require('request'),
    cheerio = require('cheerio'),
    moment  = require('moment'),
    url     = require('url');

// The Module
var scraper = module.exports = {};

// Magic strings
var BAH_ENDPOINT = 'http://bh.buscms.com/api/REST/html/departureboard.aspx?clientid=BrightonBuses',
    STOP_KEY = 'stopid',
    SERVICE_NAME_KEY = 'servicenamefilter';

moment.lang('en', {
  relativeTime : {
    future: "%s",
    past:   "%s ago",
    s:  "sec",
    m:  "1 min",
    mm: "%d min",
    h:  "1 hr",
    hh: "%d hr",
  }
});

function convertToMoment (ukFormattedDatetime) {
  if (ukFormattedDatetime === '01/01/0001 00:00:00') {
    return moment();
  }
  return moment(ukFormattedDatetime, 'DD-MM-YYYY HH:mm:ss');
}

function getETDString (momentTime) {
  if (momentTime.diff(moment()) < 40000) {
    return 'due';
  } 
  return momentTime.fromNow();
}

function extractTimetableData (htmlString) {
  var $ = cheerio.load(htmlString),
      timetable = [],
      services = [];

  $('.rowServiceDeparture').each(function (i, el) {
    var service = $(el).find('.colServiceName').text();

    if (!service) {
      return;
    }

    var departure = $(el).find('.colDepartureTime'),
        momentTime = convertToMoment(departure.data('departuretime'));

    timetable.push({
      serviceName: service,
      destination: $(el).find('.colDestination').text(),
      departureTime: momentTime.toISOString(),
      etdString: getETDString(momentTime)
    });
  });

  $('.service').each(function (i, el) {
    var service = $(el).text();

    if (service === 'all') {
      return;
    }

    services.push(service);
  });

  return {
    stopName: $('tr.rowStopName th:first-child').text(),
    services: services,
    timetable: timetable
  };
}

function scrapeUrl (href, callback) {
  request(href, function (err, res, body) {
    if (!err && res.statusCode === 200) {
      callback(null, extractTimetableData(body.replace(/\\/g, '')));
    } else {
      callback(err);
    }
  });
}

function constructUrl (stopId, serviceName) {
  var urlParts = url.parse(BAH_ENDPOINT, true);
  
  urlParts.query[STOP_KEY] = stopId;

  if (serviceName) {
    urlParts.query[SERVICE_NAME_KEY] = serviceName;
  }

  delete urlParts.search;

  return url.format(urlParts);
}

scraper.scrape = function (stopId, serviceName, callback) {
  var service;

  if (typeof serviceName === 'function' && !callback) {
    callback = serviceName;
  } else {
    service = serviceName;
  }

  scrapeUrl(constructUrl(stopId, service), callback);
};
