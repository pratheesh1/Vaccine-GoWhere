//historic data
const HISTORIC_DATA_API_URL =
  "https://data.covid19india.org/v4/min/timeseries.min.json";
//daily data
const DAILY_DATA_API_URL = "https://data.covid19india.org/v4/min/data.min.json";

// state code mapping
// prettier-ignore
const stateMap = {
    AN: {name: "Andaman and Nicobar Islands", latLng:[12.46975841741018, 92.79722389703363]},
    AP: {name:"Andhra Pradesh", latLng:[14.954289938003473, 78.65402072453963]},
    AR: {name: "Arunachal Pradesh", latLng:[28.236053545862053, 94.22295457802034]},
    AS: {name: "Assam", latLng:[26.36187734021463, 92.91011110351327]},
    BR: {name:"Bihar" ,latLng:[26.00994426540667, 85.71748156154506]},
    CH: {name:"Chandigarh" ,latLng:[30.7354412645371, 76.77202360217501]},
    CT: {name:"Chhattisgarh" ,latLng:[21.490729548838623, 82.0335446948367]},
    DL: {name:"Delhi" ,latLng:[28.636442412762644, 77.16205796674416]},
    DN: {name:"Daman and Diu" ,latLng:[20.201054732794773, 73.03584680181017]},
    GA: {name:"Goa" ,latLng:[15.403976113622534, 74.0534719913892]},
    GJ: {name:"Gujarat" ,latLng:[22.67351746984397, 72.11183042394401]},
    HP: {name:"Himachal Pradesh" ,latLng:[31.789186667068087, 77.1898650445589]},
    HR: {name:"Haryana" ,latLng:[29.274114230388513, 76.27843009687845]},
    JH: {name:"Jharkhand" ,latLng:[23.512146001524552, 85.38403868227613]},
    JK: {name:"Jammu and Kashmir" ,latLng:[33.83590307501808, 74.85762290239707]},
    KA: {name:"Karnataka" ,latLng:[14.995658955105167, 75.68899212249738]},
    KL: {name:"Kerala" ,latLng:[10.652047992683432, 76.38589386426908]},
    LA: {name:"Ladakh" ,latLng:[34.90692686446303, 76.97045511980484]},
    LD: {name:"Lakshadweep" ,latLng:[10.844509323700068, 72.84105889325865]},
    MH: {name:"Maharashtra" ,latLng:[19.73534540621259, 75.57699804231846]},
    ML: {name:"Meghalaya" ,latLng:[25.501988594513318, 91.4917087070507]},
    MN: {name:"Manipur" ,latLng:[24.806222736345106, 93.86323614463433]},
    MP: {name:"Madhya Pradesh" ,latLng:[23.807022696175764, 77.76143557126368]},
    MZ: {name:"Mizoram" ,latLng:[23.487567944851946, 92.84203617178747]},
    NL: {name:"Nagaland" ,latLng:[26.10172346779438, 94.53388434431864]},
    OR: {name:"Odisha" ,latLng:[20.804897061338696, 84.41666784726772]},
    PB: {name:"Punjab" ,latLng:[30.87195641246671, 75.41697425659169]},
    PY: {name:"Puducherry" ,latLng:[11.914298402176275, 79.75932906013745]},
    RJ: {name:"Rajasthan" ,latLng:[26.601654649250417, 73.63901535296378]},
    SK: {name:"Sikkim" ,latLng:[27.547646390855892, 88.43894696323599]},
    TG: {name:"Telangana" ,latLng:[17.961862988554813, 78.72566878538811]},
    TN: {name:"Tamil Nadu" ,latLng:[10.753181148681607, 78.40668145145044]},
    TR: {name:"Tripura" ,latLng:[23.79396463566396, 91.70974986612711]},
    UP: {name:"Uttar Pradesh" ,latLng:[27.22153617569504, 80.0056849838949]},
    UT: {name:"Uttarakhand" ,latLng:[30.193370806101758, 78.93787718760554]},
    WB: {name:"West Bengal" ,latLng:[23.149656217647415, 87.93605704550306]}
  }

document.addEventListener("DOMContentLoaded", async function () {
  /** @function
   * @name loadData
   * Returns raw data from api endpoint*/
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

  //load data
  var historicData = await loadData(HISTORIC_DATA_API_URL);
  var currentData = await loadData(DAILY_DATA_API_URL);

  var totalTally = currentData.TT;
  //remove TT (Total tally) from API data
  delete currentData.TT;

  //create selection
  var currentDayaKey = Object.keys(currentData);
  var currentDataState = currentDayaKey.map((elem) => {
    return stateMap[elem].name;
  });

  let selectionList = document.querySelector("#select-state");

  currentDayaKey.forEach((state) => {
    var stateOption = `<option value=${state} aria-label=${
      currentDataState[currentDayaKey.indexOf(state)]
    }>${currentDataState[currentDayaKey.indexOf(state)]}</option>`;
    selectionList.innerHTML += stateOption;
  });

  /** @function
   * @name renderChart
   * Renders chart*/
  function renderChart() {
    var selection = selectionList.value ? selectionList.value : "TT";

    var totalCases = historicData[selection].dates;
    var totalCasesDate = Object.keys(totalCases);

    //chart label
    var totalCaseslabel = totalCasesDate.map((e) => {
      return Date.parse(e);
    });

    //data for chart1
    var confirmedCases = totalCasesDate.map((e) => {
      return totalCases[e].total.confirmed ? totalCases[e].total.confirmed : 0;
    });

    //data for chart2
    var recoveredCases = totalCasesDate.map((e) => {
      return totalCases[e].total.recovered ? totalCases[e].total.recovered : 0;
    });
    var activeCases = [];
    for (let i = 0; i < confirmedCases.length; i++) {
      activeCases.push(confirmedCases[i] - recoveredCases[i]);
    }

    //data for chart3
    var fatalCases = totalCasesDate.map((e) => {
      return totalCases[e].total.deceased ? totalCases[e].total.deceased : 0;
    });

    //data for chart4
    var vaccinationOneDose = totalCasesDate.map((e) => {
      return totalCases[e].total.vaccinated1
        ? totalCases[e].total.vaccinated1
        : 0;
    });
    var vaccinationTwoDose = totalCasesDate.map((e) => {
      return totalCases[e].total.vaccinated2
        ? totalCases[e].total.vaccinated2
        : 0;
    });

    //data for chart5
    var testsDone = totalCasesDate.map((e) => {
      return totalCases[e].total.tested ? totalCases[e].total.tested : 0;
    });

    //chart1 options
    var chart1Options = {
      chart: {
        id: "chart1-row-1",
        group: "total",
        type: "area",
        height: 160,
        sparkline: {
          enabled: true,
        },
      },
      stroke: {
        curve: "smooth",
      },
      fill: {
        opacity: 1,
      },
      series: [
        {
          name: "Total Cases",
          data: confirmedCases,
        },
      ],
      labels: totalCaseslabel,
      yaxis: {
        min: 0,
      },
      xaxis: {
        type: "datetime",
      },
      colors: ["#DCE6EC"],
      title: {
        text: confirmedCases[confirmedCases.length - 1],
        offsetX: 0,
        offsetY: 5,
        style: {
          fontSize: "18px",
          cssClass: "apexcharts-yaxis-title",
        },
      },
      subtitle: {
        text: "Total confirmed cases",
        offsetX: 0,
        style: {
          fontSize: "14px",
          cssClass: "apexcharts-yaxis-title",
        },
      },
    };

    //chart2 options
    var chart2Options = {
      chart: {
        id: "chart2-row-1",
        group: "total",
        type: "area",
        height: 160,
        sparkline: {
          enabled: true,
        },
      },
      stroke: {
        curve: "smooth",
      },
      fill: {
        opacity: 1,
      },
      series: [
        {
          name: "Recovered",
          data: recoveredCases,
        },
        {
          name: "Active",
          data: activeCases,
        },
      ],
      labels: totalCaseslabel,
      yaxis: {
        min: 0,
      },
      xaxis: {
        type: "datetime",
      },
      colors: ["#DCE6EC", "#008FFB"],
      title: {
        text: activeCases[activeCases.length - 1],
        offsetX: 0,
        offsetY: 5,
        style: {
          fontSize: "18px",
          cssClass: "apexcharts-yaxis-title",
        },
      },
      subtitle: {
        text: "Total active cases",
        offsetX: 0,
        style: {
          fontSize: "14px",
          cssClass: "apexcharts-yaxis-title",
        },
      },
    };

    //chart3 options
    var chart3Options = {
      chart: {
        id: "chart3-row-1",
        group: "total",
        type: "area",
        height: 160,
        sparkline: {
          enabled: true,
        },
      },
      stroke: {
        curve: "smooth",
      },
      fill: {
        opacity: 1,
      },
      series: [
        {
          name: "Death",
          data: fatalCases,
        },
      ],
      labels: totalCaseslabel,
      yaxis: {
        min: 0,
      },
      xaxis: {
        type: "datetime",
      },
      colors: ["#FFA07A"],
      title: {
        text: fatalCases[fatalCases.length - 1],
        offsetX: 0,
        offsetY: 5,
        style: {
          fontSize: "18px",
          cssClass: "apexcharts-yaxis-title",
        },
      },
      subtitle: {
        text: "Total death",
        offsetX: 0,
        style: {
          fontSize: "14px",
          cssClass: "apexcharts-yaxis-title",
        },
      },
    };

    //chart4 options
    var chart4Options = {
      chart: {
        type: "bar",
        height: 380,
        width: "100%",
        stacked: true,
      },
      plotOptions: {
        bar: {
          columnWidth: "45%",
        },
      },
      series: [
        {
          name: "One Dose",
          data: vaccinationOneDose,
        },
        {
          name: "Two Dose",
          data: vaccinationOneDose,
        },
      ],
      labels: totalCaseslabel,
      xaxis: {
        labels: {
          show: true,
        },
        type: "datetime",
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: true,
        },
      },
      yaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: "#78909c",
          },
        },
      },
      subtitle: {
        text: [
          "Vaccine doses administered",
          `Single Dose: ${vaccinationOneDose[vaccinationOneDose.length - 1]}`,
          `Both Doses: ${vaccinationTwoDose[vaccinationTwoDose.length - 1]}`,
        ],
        offsetX: 0,
        offsetY: 40,
        style: {
          fontSize: "14px",
          cssClass: "apexcharts-yaxis-title",
        },
      },
      title: {
        text:
          vaccinationOneDose[vaccinationOneDose.length - 1] +
          vaccinationTwoDose[vaccinationTwoDose.length - 1],
        style: {
          fontSize: "18px",
        },
        offsetX: 0,
        offsetY: 20,
      },
    };

    //chart5 options
    var chart5Options = {
      chart: {
        type: "donut",
        width: "100%",
        height: 400,
      },
      dataLabels: {
        enabled: true,
      },
      plotOptions: {
        pie: {
          customScale: 0.9,
          donut: {
            size: "75%",
          },
          offsetY: -40,
        },
      },
      title: {
        text: "Testing",
        offsetY: 20,
        style: {
          fontSize: "18px",
        },
      },
      subtitle: {
        offsetX: 0,
        offsetY: 50,
        text: [
          "Infection Rate:",
          `${(
            (confirmedCases[confirmedCases.length - 1] /
              testsDone[testsDone.length - 1]) *
            100
          ).toFixed(3)} %`,
        ],
        style: {
          fontSize: "16px",
          cssClass: "apexcharts-yaxis-title",
        },
      },
      series: [
        testsDone[testsDone.length - 1] -
          confirmedCases[confirmedCases.length - 1],
        confirmedCases[confirmedCases.length - 1],
      ],
      labels: ["Total Tests", "Positive cases"],
      legend: {
        position: "left",
        offsetX: 40,
        offsetY: 80,
      },
    };

    // create charts
    var chart1 = new ApexCharts(
      document.querySelector("#chart1-row1"),
      chart1Options
    );
    var chart2 = new ApexCharts(
      document.querySelector("#chart2-row1"),
      chart2Options
    );
    chart1;
    var chart3 = new ApexCharts(
      document.querySelector("#chart3-row1"),
      chart3Options
    );

    var chart4 = new ApexCharts(
      document.querySelector("#chart1-row2"),
      chart4Options
    );

    var chart5 = new ApexCharts(
      document.querySelector("#chart2-row2"),
      chart5Options
    );

    //render all charts
    var allCharts = [chart1, chart2, chart3, chart4, chart5];
    allCharts.forEach((e) => {
      e.render();
    });

    /** @function
     * @name updateChartOptions
     * Update chartoptions based on vw*/
    var updateChartOptions = function () {
      var chartsRow1 = [chart1, chart2, chart3];
      if (screen.width > 577 && screen.width <= 992) {
        //update chart for iPad
        //chart 1-3
        chartsRow1.forEach((e) => {
          e.updateOptions({
            chart: {
              height: 200,
            },
            title: {
              offsetX: -10,
              style: {
                fontSize: "24px",
              },
            },
            subtitle: {
              offsetX: -10,
            },
          });
        });

        //chart 4
        chart4.updateOptions({
          subtitle: {
            text: [
              "Vaccine doses administered",
              "",
              `Single Dose: ${
                vaccinationOneDose[vaccinationOneDose.length - 1]
              }`,
              `Both Doses: ${
                vaccinationTwoDose[vaccinationTwoDose.length - 1]
              }`,
            ],
            offsetX: 0,
            offsetY: 50,
            style: {
              fontSize: "14px",
            },
          },
          title: {
            style: {
              fontSize: "24px",
            },
            offsetX: 0,
            offsetY: 20,
          },
        });

        //chart 5
        chart5.updateOptions({
          plotOptions: {
            pie: {
              offsetY: 20,
            },
          },
          subtitle: {
            offsetX: 0,
            offsetY: 50,
          },
          title: {
            style: {
              fontSize: "24px",
            },
          },
          legend: {
            position: "bottom",
            offsetX: 20,
            offsetY: 0,
          },
        });
      } else if (screen.width > 992) {
        //update chart for large screen
        //chart 1-3
        chartsRow1.forEach((e) => {
          e.updateOptions({
            chart: {
              height: 260,
            },
            title: {
              offsetX: 30,
              style: {
                fontSize: "24px",
              },
            },
            subtitle: {
              offsetX: 30,
            },
          });
        });

        //chart 4
        chart4.updateOptions({
          subtitle: {
            text: [
              "Vaccine doses administered",
              "",
              `Single Dose: ${
                vaccinationOneDose[vaccinationOneDose.length - 1]
              }`,
              `Both Doses: ${
                vaccinationTwoDose[vaccinationTwoDose.length - 1]
              }`,
            ],
            offsetX: 0,
            offsetY: 50,
            style: {
              fontSize: "14px",
            },
          },
          title: {
            style: {
              fontSize: "24px",
            },
            offsetX: 0,
            offsetY: 20,
          },
        });

        //chart 5
        chart5.updateOptions({
          plotOptions: {
            pie: {
              offsetY: 20,
            },
          },
          subtitle: {
            offsetX: 30,
            offsetY: 230,
          },
          title: {
            style: {
              fontSize: "24px",
            },
          },
        });
      }
    };

    updateChartOptions();
    window.addEventListener("resize", function () {
      updateChartOptions();
    });
  }

  renderChart();
  //re-render charts based on selction
  document.querySelector("#select-state").addEventListener("change", () => {
    var chartElement = document.querySelector("#chart-wrapper");
    chartElement.classList.add("d-none");
    renderChart();
    //wait 0.5 sec for all charts to re-render before display
    setTimeout(() => {
      chartElement.classList.remove("d-none");
    }, 500);
  });
});
