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
  //TODO: remove this log after debugging
  console.log(resData);

  if (resData.centers) {
    element.innerHTML = "";
    //TODO: dummy data - add proper chart data here
    var options = {
      series: [
        {
          data: [
            {
              x: "13-Sept",
              y: [1, 5],
            },
            {
              x: "15-Sept",
              y: [5, 8],
            },
          ],
        },
      ],
      chart: {
        type: "rangeBar",
        height: 150,
      },
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      dataLabels: {
        enabled: true,
      },
    };
    //create and append button to continue with booking
    var chart = new ApexCharts(element, options);
    chart.render();
    let button = document.createElement("div");
    button.innerHTML =
      '<div class="d-flex justify-content-center">' +
      '<button class="btn btn-primary">Book Slot</button></div>';
    element.appendChild(button);
  } else {
    //else display no data for 2sec
    element.innerText = "No Data available!";
    setTimeout(() => {
      element.innerHTML = initialData;
    }, 2000);
  }
}

/** @function
 * @name searchLocation
 * Returns list of locations that match query string*/
async function searchLocation(query) {
  const API_END_POINT_URL_search = "/search";
  var searchDiv = document.querySelector("#search-results");
  searchDiv.innerHTML = "";
  if (query.length >= 3) {
    let resData = (
      await axios.get(NOMONATIM_BASE_API_URL + API_END_POINT_URL_search, {
        params: { countrycodes: "in", q: query, format: "jsonv2" },
      })
    ).data;

    //TODO: modify this code for proper display of search results
    resData.forEach((element) => {
      searchDiv.innerHTML += element.display_name + "<hr>";
    });
  } else {
    alert("At least 3 character required for search!");
  }
}
