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
      //  TODO: remove this pop-up to add with others
      layer.bindPopup(feature.properties.NAME_2);
    },
  });
  districDataLayer.addTo(districtBoundariesLayer);
  map.addLayer(districtBoundariesLayer);

  //map layer toggle
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
