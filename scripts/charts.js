//historic data
//https://data.covid19india.org/v4/min/timeseries.min.json

//current data
//https://data.covid19india.org/v4/min/data.min.json
document.addEventListener("DOMContentLoaded", async function () {
  async function loadData() {
    var currentData = (
      await axios.get("https://data.covid19india.org/v4/min/data.min.json")
    ).data;
    return currentData;
  }

  var data = await loadData();

  var keys = Object.keys(data);
  var confirmed = keys.map((element) => {
    return data[element].total.confirmed;
  });
  var deceased = keys.map((element) => {
    return data[element].total.deceased;
  });
  var recovered = keys.map((element) => {
    return data[element].total.recovered;
  });

  var options = {
    series: [
      {
        name: "Confirmed Cases",
        type: "column",
        data: confirmed,
      },
      {
        name: "Recovered",
        type: "line",
        data: recovered,
      },
    ],
    chart: {
      zoom: {
        enabled: true,
        type: "xy",
        resetIcon: {
          offsetX: -10,
          offsetY: 0,
          fillColor: "#fff",
          strokeColor: "#37474F",
        },
        selection: {
          background: "#90CAF9",
          border: "#0D47A1",
        },
      },
    },
    stroke: {
      width: [0, 4],
    },
    title: {
      text: "COVID-19 by State (in mil)",
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1],
    },
    labels: keys,
    xaxis: {
      type: "text",
    },
    yaxis: [
      {
        title: {
          text: "Confirmed Cases",
        },
        labels: {
          formatter: (value) => {
            return value / 100000000;
          },
        },
      },
      {
        opposite: true,
        title: {
          text: "Recovered",
        },
        labels: {
          formatter: (value) => {
            return value / 100000000;
          },
        },
      },
    ],
  };

  //FIXME:Update after all chart data done
  var chart = new ApexCharts(document.querySelector("#chart1-row1"), options);
  var chart1 = new ApexCharts(document.querySelector("#chart2-row1"), options);
  var chart2 = new ApexCharts(document.querySelector("#chart3-row1"), options);
  var chart3 = new ApexCharts(document.querySelector("#chart1-row2"), options);
  var chart4 = new ApexCharts(document.querySelector("#chart2-row2"), options);
  var chart5 = new ApexCharts(document.querySelector("#chart1-row3"), options);
  var chart6 = new ApexCharts(document.querySelector("#chart2-row3"), options);

  var charts = [chart, chart1, chart2, chart3, chart4, chart5, chart6];
  charts.forEach((eachChart) => {
    eachChart.render();
  });

  // TODO: remove this log after debugging
  console.log(data);
});
