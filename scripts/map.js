// Create map and base tile layer

/** @function
 * @name createMap
 * Return new map instance given ID, coordinates and zoom*/
function createMap(divID, coordinates, zoom) {
  // create map instance
  var map = L.map(divID, { attributionControl: false }).setView(
    coordinates,
    zoom
  );
  // create tile layer
  L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: mapBoxToken,
    }
  ).addTo(map);

  // returns map with tile layer
  return map;
}

// custom leaflet marker class
var LeafIcon = L.Icon.extend({
  options: {
    iconSize: [40, 40],
    iconAnchor: [0, 0],
    popupAnchor: [0, -0],
  },
});

var vaccinationCenterIcon = new LeafIcon({
  iconUrl: "images/vaccine.png",
});

var locationIcon = new LeafIcon({
  iconSize: [24, 40],
  iconUrl: "images/search_location.png",
});
