//API Base url
const COWIN_BASE_API_URL = "https://cdn-api.co-vin.in/api";

window.addEventListener("DOMContentLoaded", async () => {
  // create new map
  let map = createMap("map", [20.627352373712213, 77.99359383369028], 4.5);

  //state boundaries group
  let stateBoundariesLayer = L.layerGroup();
  let stateGeojsonData = (await axios.get("data/geojson/states_india.geojson"))
    .data;

  let stateDataLayer = L.geoJSON(stateGeojsonData, {
    style: () => {
      return {
        color: "blue",
        weight: 2,
        dashArray: "10, 5",
        dashOffset: "5",
      };
    },
    onEachFeature: (feature, layer) => {
      //  TODO: remove this pop-up to add with others
      layer.bindPopup(feature.properties.st_nm);
    },
  });

  //zoom to state on click
  stateDataLayer.on("click", (e) => {
    map.fitBounds(e.layer.getBounds());
  });

  stateDataLayer.addTo(stateBoundariesLayer);
  map.addLayer(stateBoundariesLayer);

  //district boundaries group
  let districtBoundariesLayer = L.layerGroup();
  let districtGeojsonData = (
    await axios.get("data/geojson/districts_india.geojson")
  ).data;
  let districDataLayer = L.geoJSON(districtGeojsonData, {
    style: () => {
      return {
        color: "orange",
        weight: 1,
      };
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(feature.properties.NAME_2);
    },
  });

  //zoom to district on click
  districDataLayer.on("click", (e) => {
    map.fitBounds(e.layer.getBounds());
  });

  map.addLayer(districtBoundariesLayer);

  //cowin api query layer
  var vacinationCenterLayer = L.markerClusterGroup();

  async function findByLatLong(lat, lng) {
    const API_END_POINT_URL_findByLatLong =
      "/v2/appointment/centers/public/findByLatLong";
    var apiResponse = await axios.get(
      COWIN_BASE_API_URL +
        API_END_POINT_URL_findByLatLong +
        "?lat=" +
        lat +
        "&long=" +
        lng
    );
    return apiResponse.data;
  }

  async function getVaccineCenter() {
    var mapCenter = map.getCenter();
    var apiReturn = await findByLatLong(mapCenter.lat, mapCenter.lng);
    var vaccineCenter = apiReturn.centers;
    vaccineCenter.forEach((element) => {
      L.marker([element.lat, element.long], {
        icon: vaccinationCenterIcon,
      })
        .addTo(vacinationCenterLayer)
        //TODO: modify this popup
        .bindPopup(element.name);
    });
  }
  map.addLayer(vacinationCenterLayer);

  //map layer toggle
  //on zoom
  map.on("zoom", () => {
    var zoomLevel = map.getZoom();
    if (zoomLevel > 5.9) {
      //display on zoom baased on geojson polygon bounds
      return (
        districDataLayer.addTo(districtBoundariesLayer),
        stateDataLayer.remove(stateBoundariesLayer)
      );
    }
    //TODO: anymore conditions to add/remove layer add here in if statemets
    return (
      districDataLayer.removeFrom(districtBoundariesLayer),
      stateDataLayer.addTo(stateBoundariesLayer)
    );
  });

  //on move
  map.on("move", () => {
    vacinationCenterLayer.clearLayers();
    getVaccineCenter();
  });

  //layers
  let baseLayer = {
      "State Boundaries": stateBoundariesLayer,
    },
    otherLayers = {
      "District Boundaries": districtBoundariesLayer,
    };
  let controlLayer = L.control.layers(baseLayer, otherLayers, {
    position: "bottomright",
  });
  controlLayer.addTo(map);

  //non-map element styling
  document.querySelector("#show-hide-search").addEventListener("click", () => {
    toggleDisplay("#floating-search");
  });
});
