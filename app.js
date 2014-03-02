var doubledecker = require('./lib/doubledecker');

doubledecker.getStopsNear({
  lat: 50.817384,
  lng: -0.106533,
  service: 7,
  within: 50
})
.then(function (stops) {
  stops.forEach(function (stop) {
    console.log(stop.name);

    stop.departures.forEach(function (dep) {
      console.log(dep.serviceName, dep.destination, dep.etdString);
    });
  });
});