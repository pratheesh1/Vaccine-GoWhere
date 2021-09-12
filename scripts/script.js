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
      };
    },
    onEachFeature: (feature, layer) => {
      //  TODO: remove this pop-up to add with others
      layer.bindPopup(feature.properties.st_nm);
    },
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
      };
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(feature.properties.NAME_2);
    },
  });
  districDataLayer.addTo(districtBoundariesLayer);
  map.addLayer(districtBoundariesLayer);
});
