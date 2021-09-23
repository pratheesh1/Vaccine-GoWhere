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

  //data for heatmap
  currentDayaKey.forEach((state) => {
    var district = Object.keys(currentData[state].districts);
    district.forEach((district) => {
      if (district != "Unknown" && currentData[state].delta) {
        var confirmedCases = currentData[state].delta.confirmed;
        var latLng = districtMap[district];
        if (latLng) {
          dataPoint = {
            lat: latLng[0],
            lng: latLng[1],
            count: confirmedCases,
          };
          if (dataPoint) {
            covidData.push(dataPoint);
          }
        }
      }
    });
  });

  /** @function
   * @name renderChart
   * Renders chart*/
  function renderChart() {
    /** @function
     * @name getData
     * Returns data for chart options*/
    getData = function () {
      var selection = selectionList.value ? selectionList.value : "TT";

      var totalCases = historicData[selection].dates;
      var totalCasesDate = Object.keys(totalCases);

      //chart label
      var totalCaseslabel = totalCasesDate.map((e) => {
        return Date.parse(e);
      });

      //data for chart1
      var confirmedCases = totalCasesDate.map((e) => {
        return totalCases[e].total.confirmed
          ? totalCases[e].total.confirmed
          : 0;
      });

      //data for chart2
      var recoveredCases = totalCasesDate.map((e) => {
        return totalCases[e].total.recovered
          ? totalCases[e].total.recovered
          : 0;
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

      return {
        selection,
        totalCases,
        totalCasesDate,
        totalCaseslabel,
        confirmedCases,
        recoveredCases,
        activeCases,
        fatalCases,
        vaccinationOneDose,
        vaccinationTwoDose,
        testsDone,
      };
    };

    var {
      totalCaseslabel,
      confirmedCases,
      recoveredCases,
      activeCases,
      fatalCases,
      vaccinationOneDose,
      vaccinationTwoDose,
      testsDone,
    } = getData();

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
          data: vaccinationTwoDose,
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

    //re-render charts based on selction
    document.querySelector("#select-state").addEventListener("change", () => {
      var spinnier = document.querySelector("#spinner-wrapper");
      spinnier.classList.remove("d-none");
      //updateOptions based on state selection
      //removed grouping for using updateOptions. Known apexchart bug
      var {
        confirmedCases,
        recoveredCases,
        activeCases,
        fatalCases,
        vaccinationOneDose,
        vaccinationTwoDose,
        testsDone,
      } = getData();

      // Update chart1
      chart1.updateOptions({
        chart: {
          group: "total1",
        },
        title: {
          text: confirmedCases[confirmedCases.length - 1],
        },
        series: [
          {
            data: confirmedCases,
          },
        ],
      });

      // Update chart2
      chart2.updateOptions({
        chart: {
          group: "total2",
        },
        series: [
          {
            data: recoveredCases,
          },
          {
            data: activeCases,
          },
        ],
        title: {
          text: activeCases[activeCases.length - 1],
        },
      });

      // Update chart3
      chart3.updateOptions({
        chart: {
          group: "total3",
        },
        series: [
          {
            data: fatalCases,
          },
        ],
        title: {
          text: fatalCases[fatalCases.length - 1],
        },
      });

      // Update chart4
      chart4.updateOptions({
        series: [
          {
            name: "One Dose",
            data: vaccinationOneDose,
          },
          {
            name: "Two Dose",
            data: vaccinationTwoDose,
          },
        ],
        subtitle: {
          text: [
            "Vaccine doses administered",
            `Single Dose: ${vaccinationOneDose[vaccinationOneDose.length - 1]}`,
            `Both Doses: ${vaccinationTwoDose[vaccinationTwoDose.length - 1]}`,
          ],
        },
        title: {
          text:
            vaccinationOneDose[vaccinationOneDose.length - 1] +
            vaccinationTwoDose[vaccinationTwoDose.length - 1],
        },
      });

      // Update chart5
      chart5.updateOptions({
        subtitle: {
          text: [
            "Infection Rate:",
            `${(
              (confirmedCases[confirmedCases.length - 1] /
                testsDone[testsDone.length - 1]) *
              100
            ).toFixed(3)} %`,
          ],
        },
        series: [
          testsDone[testsDone.length - 1] -
            confirmedCases[confirmedCases.length - 1],
          confirmedCases[confirmedCases.length - 1],
        ],
      });
      setTimeout(() => {
        spinnier.classList.add("d-none");
      }, 1500);
    });
  }

  renderChart();
});
