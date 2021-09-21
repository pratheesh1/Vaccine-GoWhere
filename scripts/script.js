//API Base url
const COWIN_BASE_API_URL = "https://cdn-api.co-vin.in/api";
const NOMINATIM_BASE_API_URL = "https://nominatim.openstreetmap.org";

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

  //--------- map layer control ---------
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

  //--------- layers ---------
  let baseLayer = {
      "State Boundaries": stateBoundariesLayer,
    },
    otherLayers = {
      "District Boundaries": districtBoundariesLayer,
      "Vaccination Centers": vacinationCenterLayer,
    };
  let controlLayer = L.control.layers(baseLayer, otherLayers, {
    position: "bottomright",
  });
  controlLayer.addTo(map);

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
});
