//--------- functions ---------
/** @function
 * @name toggleDisplay
 * Toggle display property of given element*/
function toggleDisplay(elementID) {
  var selectedElement = document.querySelector(elementID);
  var currentClassList = Object.values(selectedElement.classList);

  if (currentClassList.includes("d-none")) {
    selectedElement.classList.remove("d-none");
  } else {
    selectedElement.classList.add("d-none");
  }
}

/** @function
 * @name getDate
 * Returns date string as DD-MM-YYYY*/
function getCurrentDate() {
  //create datetime instance variable
  var currentDateTime = new Date();

  //get year
  var currentYear = currentDateTime.getFullYear().toString();
  //get month
  var currentMonth =
    currentDateTime.getMonth() < 9
      ? "0" + (currentDateTime.getMonth() + 1).toString()
      : (currentDateTime.getMonth() + 1).toString();
  //get date
  var currentDay =
    currentDateTime.getDate() < 10
      ? "0" + currentDateTime.getDate().toString()
      : currentDateTime.getDate().toString();

  var date = currentDay + "-" + currentMonth + "-" + currentYear;
  return date;
}

/** @function
 * @name getDetails
 * Get vaccine center details by center ID inside pop-up*/
async function getDetails(centerID) {
  var element = document.querySelector("#popup");

  const API_END_POINT_URL_calendarByCenter =
    "/v2/appointment/sessions/public/calendarByCenter";

  var initialData = element.innerHTML;

  element.innerHTML = "Loading...";
  var resData = (
    await axios.get(COWIN_BASE_API_URL + API_END_POINT_URL_calendarByCenter, {
      params: { center_id: centerID, date: getCurrentDate() },
    })
  ).data;
  //TODO: add available slots data and remove this log after debugging
  console.log(resData);

  if (resData.centers) {
    element.innerHTML = "";
    let button = document.createElement("div");
    button.innerHTML =
      '<div class="container-flex text-center">' +
      '<img id="vaccine-image" src="images/vaccine_calendar.png">' +
      '<p class="m-0 mt-1 mb-2">Vaccination booking services are availavle at this center.</p>' +
      '<button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop">Continue to booking</button></div>';
    element.appendChild(button);
  } else {
    element.innerText =
      "No pre-booking services available at this centre. Walk-in only!";
    //revert after 2 sec
    setTimeout(() => {
      element.innerHTML = initialData;
    }, 2000);
  }
}

/** @function
 * @name searchLocation
 * - Returns list of locations that match query string
 * - Clears search results div and appends new results*/
async function searchLocation(query) {
  const API_END_POINT_URL_search = "/search";
  if (query.length >= 3) {
    let resData = (
      await axios.get(NOMINATIM_BASE_API_URL + API_END_POINT_URL_search, {
        params: { countrycodes: "in", q: query, format: "jsonv2", limit: 15 },
      })
    ).data;
    return resData;
  } else {
    alert("At least 3 character required for search!");
  }
}

/** @function
 * @name createSearchResMarkers
 * Create and display search result and result markers*/
async function createSearchResMarkers(searchQuery, mapLayer, map) {
  var searchResults = await searchLocation(searchQuery);
  var searchDiv = document.querySelector("#search-results");
  searchDiv.innerHTML = "";

  let markerArr = [];
  searchResults.forEach((result) => {
    //create markers
    var coordinate = [result.lat, result.lon];
    var marker = L.marker(coordinate, { icon: locationIcon }).on(
      "click",
      () => {
        searchDiv.innerHTML = "";
        map.flyTo(coordinate, 10);
        marker.openPopup();
        setTimeout(() => {
          mapLayer.clearLayers();
        }, 3500);
      }
    );
    marker.bindPopup(`<div>${result.display_name}</div>`);
    marker.addTo(mapLayer);
    markerArr.push(marker);

    //create and add results to search result div
    var resultElement = document.createElement("div");
    resultElement.classList = [
      "container text-nowrap inline-block p-1 px-2 m-0",
    ];
    resultElement.innerHTML = result.display_name;
    searchDiv.appendChild(resultElement);

    //on click zoom to marker on map
    resultElement.addEventListener("click", () => {
      searchDiv.innerHTML = "";
      map.flyTo(coordinate, 10);
      marker.openPopup();
      setTimeout(() => {
        mapLayer.clearLayers();
      }, 3500);
    });

    //remove search results and markers after 10 sec
    setTimeout(() => {
      searchDiv.innerHTML = "";
      mapLayer.clearLayers();
    }, 10000);
  });

  //fit to bounds on search based on all markers
  var group = new L.featureGroup(markerArr);
  map.flyTo(group.getBounds().getCenter(), 7);
}
