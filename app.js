var Scraper = require('./lib/scraper');

Scraper.scrape(6743, function (err, timetable) {
  console.log(timetable);
});