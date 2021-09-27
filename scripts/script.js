//intiate empty array for heatmap
var covidData = [];

window.addEventListener("DOMContentLoaded", async () => {
  //create new map
  let map = createMap("map", [20.627352373712213, 77.99359383369028], 4.5);

  //--------- state boundaries group ---------
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
      layer.bindPopup(feature.properties.st_nm);
    },
  });

  //zoom to state on click
  stateDataLayer.on("click", (e) => {
    map.fitBounds(e.layer.getBounds());
  });

  stateDataLayer.addTo(stateBoundariesLayer);
  map.addLayer(stateBoundariesLayer);

  //--------- district boundaries group ---------
  let districtBoundariesLayer = L.layerGroup();
  let districtGeojsonData = (
    await axios.get("data/geojson/districts_india.geojson")
  ).data;
  let districDataLayer = L.geoJSON(districtGeojsonData, {
    style: () => {
      return {
        color: "orange",
        fillColor: "#ffffff",
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

  //--------- cowin api query layer ---------
  var vacinationCenterLayer = L.markerClusterGroup();

  /** @function
   * @name findByLatLong
   * Find vaccination center by lat, lng*/
  async function findByLatLong(lat, lng) {
    const API_END_POINT_URL_findByLatLong =
      "/v2/appointment/centers/public/findByLatLong";
    var apiResponse = await axios.get(
      COWIN_BASE_API_URL + API_END_POINT_URL_findByLatLong,
      { params: { lat: lat, long: lng } }
    );
    return apiResponse.data;
  }

  //On map moveend update vaccination center and plot on map
  map.on("moveend", async () => {
    var mapCenter = map.getCenter();
    vacinationCenterLayer.clearLayers();
    var apiReturn = await findByLatLong(mapCenter.lat, mapCenter.lng);
    var vaccineCenter = apiReturn.centers;
    vaccineCenter.forEach((element) => {
      let popup = document.createElement("div");
      popup.innerHTML = `<div id="popup" class="justify-content-center"><h6>
        ${element.name}</h6><p>Location: ${element.location}<br>District:
        ${element.district_name} , Center ID: ${element.center_id}
        </p><button type="button" onclick="getDetails(${element.center_id})"class="btn btn-primary">Check Availability</button></div>`;

      L.marker([element.lat, element.long], {
        icon: vaccinationCenterIcon,
      })
        .addTo(vacinationCenterLayer)
        .bindPopup(popup, { keepInView: true, closeButton: true });
    });
  });
  map.addLayer(vacinationCenterLayer);

  //--------- search results layer ---------
  var searchResultsLayer = L.layerGroup();
  document.querySelector("#search-btn").addEventListener("click", async () => {
    var searchQuery = document.querySelector("#search-query").value;
    createSearchResMarkers(searchQuery, searchResultsLayer, map);
  });

  map.addLayer(searchResultsLayer);

  //--------- heatmap layer ---------
  var heatMapConfig = {
    radius: 0.4,
    maxOpacity: 0.3,
    scaleRadius: true,
    useLocalExtrema: true,
    latField: "lat",
    lngField: "lng",
    valueField: "count",
    onExtremaChange: function (data) {
      updateLegend(data);
    },
  };
  var heatmapLayer = new HeatmapOverlay(heatMapConfig);
  var heatmapData = {
    max: 8,
    data: covidData,
  };

  //create canvas element for legend gradient img
  var legendCanvas = document.createElement("canvas");
  legendCanvas.width = 100;
  legendCanvas.height = 10;
  var min = document.querySelector("#min");
  var max = document.querySelector("#max");
  var gradientImg = document.querySelector("#gradient");
  var legendCtx = legendCanvas.getContext("2d");
  var gradientCfg = {};

  /** @function
   * @name updateLegend
   * Update heatmap legend*/
  function updateLegend(data) {
    var heatmapLegend = document.querySelector("#heatmap-legend");
    // the onExtremaChange callback gives min, max, and gradientConfig
    min.innerHTML = data.min;
    max.innerHTML = data.max;

    // regenerate gradient image
    if (data.gradient != gradientCfg) {
      gradientCfg = data.gradient;
      var gradient = legendCtx.createLinearGradient(0, 0, 100, 1);
      for (var key in gradientCfg) {
        gradient.addColorStop(key, gradientCfg[key]);
      }
      legendCtx.fillStyle = gradient;
      legendCtx.fillRect(0, 0, 100, 10);
      gradientImg.src = legendCanvas.toDataURL();
    }

    //hide legend if no valid extrema data
    if (data.max) {
      heatmapLegend.classList.remove("d-none");
    } else {
      heatmapLegend.classList.add("d-none");
    }
  }

  heatmapLayer.setData(heatmapData);

  //--------- map layer control ---------
  //on zoom
  map.on("zoom", () => {
    var zoomLevel = map.getZoom();
    if (zoomLevel > 5.9) {
      //display on zoom baased on geojson polygon bounds
      return (
        districDataLayer.addTo(districtBoundariesLayer),
        stateDataLayer.remove(stateBoundariesLayer),
        map.addLayer(heatmapLayer)
      );
    }
    return (
      districDataLayer.removeFrom(districtBoundariesLayer),
      stateDataLayer.addTo(stateBoundariesLayer),
      map.removeLayer(heatmapLayer)
    );
  });

  //--------- layers ---------
  let baseLayer = {
      "State Boundaries": stateBoundariesLayer,
    },
    otherLayers = {
      "District Boundaries": districtBoundariesLayer,
      "Vaccination Centers": vacinationCenterLayer,
      "Covid Clusters": heatmapLayer,
    };
  let controlLayer = L.control.layers(baseLayer, otherLayers, {
    position: "bottomright",
  });
  controlLayer.addTo(map);

  //add-remove heatmap legend based on user selection
  map.on("overlayadd", function (layer) {
    if (layer.name === "Covid Clusters") {
      document.querySelector("#heatmap-legend").classList.remove("d-none");
    }
  });
  map.on("overlayremove", function (layer) {
    if (layer.name === "Covid Clusters") {
      document.querySelector("#heatmap-legend").classList.add("d-none");
    }
  });

  //--------- map element  ---------

  //--------- non-map element  ---------
  //show/hide searchbookingDetails

  //clear search results on click outside or idle for too long
  document.querySelector("#map").addEventListener("click", () => {
    document.querySelector("#search-results").innerHTML = "";
  });

  var timeoutid = 0;
  document
    .querySelector("#search-results")
    .addEventListener("mousemove", () => {
      clearTimeout(timeoutid);
      timeoutid = setTimeout(() => {
        document.querySelector("#search-results").innerHTML = "";
      }, 2000);
    });

  /** @function
   * @name togglePage
   * Toggle pages for single page display*/
  togglePage = (page) => {
    document.querySelectorAll(".main-display-element").forEach((element) => {
      element.classList.add("d-none");
    });
    document.querySelector(page).classList.remove("d-none");
  };

  //horizontal scroll
  const scrollContainer = document.querySelector("#vaccine-wrapper");
  scrollContainer.addEventListener("wheel", (event) => {
    if (screen.width >= 1200) {
      event.preventDefault();
      scrollContainer.scrollLeft += event.deltaY * 10;
    }
  });
});
