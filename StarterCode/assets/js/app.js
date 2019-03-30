
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 60
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv")
  .then(function (newsData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    newsData.forEach(function (data) {
      // health care
      data.healthcare = parseFloat(data.healthcare);
      data.healthcareLow = parseFloat(data.healthcareLow);
      data.healthcareHigh = parseFloat(data.healthcareHigh);

      // poverty
      data.poverty = parseFloat(data.poverty);

    });
    console.log("newsData as Int:", newsData);
    // Step 2: Create scale functions
    // ==============================
    /* function scalex(property) {
        var propertyMin = d3.min(news)
    }    */
    // health care
    var healthcareMin = d3.min(newsData, d => d.healthcare);
    var healthcareMax = d3.max(newsData, d => d.healthcare);

    // poverty
    var povertyScaleMin = d3.min(newsData, d => d.poverty);
    var povertyScaleMax = d3.max(newsData, d => d.poverty);

    var xLinearScale = d3.scaleLinear()
      .domain([povertyScaleMin - 1, povertyScaleMax + 1])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([healthcareMin - 1, healthcareMax + 1])
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circleRadius = 10;
    var circlesGroup = chartGroup.selectAll("circle")
      .data(newsData)
      .enter()
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", `${circleRadius}`)
      .attr("opacity", ".75")
       /* .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.healthcare) + 7)
        .text(d => d.abbr)*/;

    var stateText = chartGroup.selectAll(".stateText")
      .data(newsData)
      .enter()
      .append("text")
      .classed("stateText", true)
      .attr("x", d => xLinearScale(d.poverty))
      .attr("y", d => yLinearScale(d.healthcare) + circleRadius / 2)
      .text(d => d.abbr);

    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function (d) {
        return (`${d.state}<br>Poverty: ${d.poverty}<br>Health care: ${d.healthcare}`);
      });

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("mouseover", function (data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function (data, index) {
        toolTip.hide(data);
      });

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("Poverty (%)");
  });
