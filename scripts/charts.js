//historic data
const HISTORIC_DATA_API_URL =
  "https://data.covid19india.org/v4/min/timeseries.min.json";
//current data
const CURRENT_DATA_API_URL =
  "https://data.covid19india.org/v4/min/data.min.json";

document.addEventListener("DOMContentLoaded", async function () {
  /** @function
   * @name loadData
   * Returns raaw data from api endpoint*/
  async function loadData(url) {
    var resData = (await axios.get(url)).data;
    return resData;
  }

  //global chart settings
  Apex = {
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      labels: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
  };

  var currentData = await loadData(CURRENT_DATA_API_URL);

  var keys = Object.keys(currentData);
  var confirmed = keys.map((element) => {
    return currentData[element].total.confirmed;
  });
  var deceased = keys.map((element) => {
    return currentData[element].total.deceased;
  });
  var recovered = keys.map((element) => {
    return currentData[element].total.recovered;
  });

  /**
   * //FIXME:Update after all chart data done
  var chart1 = new ApexCharts(document.querySelector("#chart1-row1"), chart1Options);
  var chart2 = new ApexCharts(document.querySelector("#chart2-row1"), chart2Options);
  var chart3 = new ApexCharts(document.querySelector("#chart3-row1"), chart3Options);
  var chart4 = new ApexCharts(document.querySelector("#chart1-row2"), chart4Options);
  var chart5 = new ApexCharts(document.querySelector("#chart2-row2"), chart5Options);
  var chart6 = new ApexCharts(document.querySelector("#chart1-row3"), chart5Options);
  var chart7 = new ApexCharts(document.querySelector("#chart2-row3"), chart6Options); 

  var charts = [chart1, chart2, chart3, chart4, chart5, chart6, chart7];
  charts.forEach((eachChart) => {
    eachChart.render();
  });
*/

  // TODO: remove this log after debugging
  console.log(currentData);
});
