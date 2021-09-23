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

document.querySelector("#show-hide-search").addEventListener("click", () => {
  toggleDisplay("#floating-search");
});

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

  var initialData = element.innerHTML;

  element.innerHTML = "Loading...";
  var resData = (
    await axios.get(COWIN_BASE_API_URL + API_END_POINT_URL_calendarByCenter, {
      params: { center_id: centerID, date: getCurrentDate() },
    })
  ).data;

  if (resData.centers) {
    let data = resData.centers;

    //update pop-up
    element.innerHTML = "";
    let button = document.createElement("div");
    button.innerHTML =
      '<div class="container-flex text-center">' +
      '<img id="vaccine-image" src="images/vaccine_calendar.png">' +
      '<p class="m-0 mt-1 mb-2">Vaccination booking services are availavle at this center.</p>' +
      '<button class="btn btn-sm btn-primary" data-bs-toggle="modal" id="continue-booking" data-bs-target="#staticBackdrop">Continue to booking</button></div>';
    element.appendChild(button);

    //show static elements hidden by previous user interaction
    document
      .getElementById("continue-booking")
      .addEventListener("click", () => {
        document.querySelector("#confirm-booking").classList.remove("d-none");
        slotPicker.classList.remove("d-none");
      });

    //update appointmment information
    var appointmmentInfoElement = document.querySelector(
      "#appointmment-information"
    );
    var updatedHtml =
      `<h6>Vaccination Center: ${data.name}</h6>` +
      `<text class="small">Center ID: ${data.center_id}` +
      `<br>Address: ${data.address}, ${data.district_name}, ${data.state_name}` +
      `<br>Vaccine: ${data.sessions[0].vaccine}, Vaccination Cost: ${data.fee_type}</text>`;
    appointmmentInfoElement.innerHTML = updatedHtml;

    //on confirm booking display results
    var bookingDetails = [];
    let slotPicker = document.querySelector("datetime-slot-picker");
    slotPicker.addEventListener("slotUpdate", function (event) {
      bookingDetails.push(event.detail);
      document.querySelector("#confirm-booking").classList.remove("disabled");
    });

    document.querySelector("#confirm-booking").addEventListener("click", () => {
      //hide certain elements and disable continue booking btn on successful booking
      document.getElementById("continue-booking").classList.add("disabled");
      document.querySelector("#confirm-booking").classList.add("d-none");
      slotPicker.classList.add("d-none");

      //display booking confirmation message
      var bookedSlot = bookingDetails[bookingDetails.length - 1];
      var bookingInfo =
        `<h5>Booking Successful!</h5>` +
        `<text class="small">Center: ${data.name}` +
        `<br>Date:  ${bookedSlot.date}` +
        `<br>Slot: ${bookedSlot.timeSlot}</text>`;
      appointmmentInfoElement.innerHTML = bookingInfo;
      ("");
    });

    //when modal is closed reset the array and disble confirm button
    document
      .querySelector("#staticBackdrop")
      .addEventListener("hidden.bs.modal", () => {
        document.querySelector("#confirm-booking").classList.add("disabled");
        bookingDetails = [];
      });

    /** @function
     * @name getFormattedDateStr
     * Return formatted date for datetime-slot-picker JS*/
    getFormattedDateStr = function (dateStr) {
      var dateArr = dateStr.split("-").map((e) => {
        return parseInt(e);
      });
      var dateObj = new Date(dateArr[2], dateArr[1] - 1, dateArr[0]);

      const dayIndex = {
        0: "Sun",
        1: "Mon",
        2: "Tue",
        3: "Wed",
        4: "Thu",
        5: "Fri",
        6: "Sat",
      };
      const monthIndex = {
        0: "Jan",
        1: "Feb",
        2: "Mar",
        3: "Apr",
        4: "May",
        5: "Jun",
        6: "Jul",
        7: "Aug",
        8: "Sep",
        9: "Oct",
        10: "Nov",
        11: "Dec",
      };

      var formattedDate =
        dayIndex[dateObj.getDay()] +
        ", " +
        dateArr[0] +
        " " +
        monthIndex[dateArr[1] - 1] +
        " " +
        dateArr[2];
      return formattedDate;
    };

    //option for datetime-slot-picker
    var slots = data.sessions.map((e) => {
      var date = getFormattedDateStr(e.date);
      var timeSlots = e.slots;
      return { date, timeSlots };
    });

    //update datetime-slot-picker DOM element
    const datetimeSlotPicker = document.querySelector("datetime-slot-picker");
    datetimeSlotPicker.slots = slots;
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
