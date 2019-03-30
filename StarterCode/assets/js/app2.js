function monify(string) {
  return "$" + string.slice(0, 2) + "," + string.slice(2);
}

var svgWidth = 700;
var svgHeight = 450;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, 
// and shift the chart by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv")
  .then(function (newsData) {

    // Parse Data/Cast as numbers
    // ==============================
    newsData.forEach(function (data) {

      data.healthcare = parseFloat(data.healthcare);
      data.smokes = parseFloat(data.smokes);
      data.obese = parseFloat(data.obese);
      data.poverty = parseFloat(data.poverty);
      data.age = parseFloat(data.age);
      data.income = parseFloat(data.income);

    });
    console.log("newsData as Float:", newsData);

    function drawTable(xProperty, yProperty, oldX, oldY) {

      // "Remember" old scale functions
      // ==============================
      var xOldPropMin = d3.min(newsData, d => d[oldX]);
      var xOldPropMax = d3.max(newsData, d => d[oldX]);
      var yOldPropMin = d3.min(newsData, d => d[oldY]);
      var yOldPropMax = d3.max(newsData, d => d[oldY]);

      var xOldLinearScale = d3.scaleLinear()
        .domain([0.95 * xOldPropMin, 1.05 * xOldPropMax])
        .range([0, width]);

      var yOldLinearScale = d3.scaleLinear()
        .domain([0.85 * yOldPropMin, 1.05 * yOldPropMax])
        .range([height, 0]);

      var oldBottomAxis = d3.axisBottom(xOldLinearScale);
      var oldLeftAxis = d3.axisLeft(yOldLinearScale);

      // Create new scale functions
      // ==============================
      var xPropertyMin = d3.min(newsData, d => d[xProperty]);
      var xPropertyMax = d3.max(newsData, d => d[xProperty]);
      var yPropertyMin = d3.min(newsData, d => d[yProperty]);
      var yPropertyMax = d3.max(newsData, d => d[yProperty]);

      var xLinearScale = d3.scaleLinear()
        .domain([0.95 * xPropertyMin, 1.05 * xPropertyMax])
        .range([0, width]);

      var yLinearScale = d3.scaleLinear()
        .domain([0.85 * yPropertyMin, 1.05 * yPropertyMax])
        .range([height, 0]);

      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);

      if (oldX) {
        // Append Axes to the chart with transitions
        // ==============================
        chartGroup.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0, ${height})`)
          .call(oldBottomAxis);

        chartGroup.append("g")
          .attr("class", "y-axis")
          .call(oldLeftAxis);

        svg.select(".x-axis")
          .transition()
          .duration(500)
          .call(bottomAxis);

        svg.select(".y-axis")
          .transition()
          .duration(500)
          .call(leftAxis);

        // Create Circles with transitions
        // ==============================
        var circleRadius = 10;
        var circlesGroup = chartGroup.selectAll("circle")
          .data(newsData)
          .enter()
          .append("circle")
          .classed("stateCircle", true)
          .attr("r", `${circleRadius}`)
          .attr("opacity", ".75")
          .attr("cx", d => xOldLinearScale(d[oldX]))
          .attr("cy", d => yOldLinearScale(d[oldY]));

        circlesGroup.transition()
          .duration(500)
          .attr("cx", d => xLinearScale(d[xProperty]))
          .attr("cy", d => yLinearScale(d[yProperty]));

        var circleText = chartGroup.selectAll(".stateText")
          .data(newsData)
          .enter()
          .append("text")
          .classed("stateText", true)
          .text(d => d.abbr)
          .attr("x", d => xOldLinearScale(d[oldX]))
          .attr("y", d => yOldLinearScale(d[oldY]) + circleRadius / 2);

        circleText.transition()
          .duration(500)
          .attr("x", d => xLinearScale(d[xProperty]))
          .attr("y", d => yLinearScale(d[yProperty]) + circleRadius / 2);
      }
      else {
        // Append Axes to the chart for the first time
        // ==============================
        chartGroup.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0, ${height})`)
          .call(bottomAxis);

        chartGroup.append("g")
          .attr("class", "y-axis")
          .call(leftAxis);

        // Create Circles for the first time
        // ==============================
        var circleRadius = 10;
        var circlesGroup = chartGroup.selectAll("circle")
          .data(newsData)
          .enter()
          .append("circle")
          .classed("stateCircle", true)
          .attr("r", `${circleRadius}`)
          .attr("opacity", ".75")
          .attr("cx", d => xLinearScale(d[xProperty]))
          .attr("cy", d => yLinearScale(d[yProperty]));

        var circleText = chartGroup.selectAll(".stateText")
          .data(newsData)
          .enter()
          .append("text")
          .classed("stateText", true)
          .text(d => d.abbr)
          .attr("x", d => xLinearScale(d[xProperty]))
          .attr("y", d => yLinearScale(d[yProperty]) + circleRadius / 2);
      };

      // Initialize tool tip
      // ==============================
      var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60]);

      if (xProperty == "income") {
        toolTip.html(function (d) {
          return (`${d.state}<br>
            ${xProperty}: ${monify(String(d[xProperty]))}<br>
            ${yProperty}: ${d[yProperty]}`);
        });
      }
      else {
        toolTip.html(function (d) {
          return (`${d.state}<br>
            ${xProperty}: ${d[xProperty]}<br>
            ${yProperty}: ${d[yProperty]}`);
        });
      }

      // Write correlation descriptions.
      // ==============================
      var correlationHeader = d3.select(".correlationHeader");
      var correlationText = d3.select(".correlation");
      var trendHeader = d3.select(".trendHeader")
      var trendText = d3.select(".trend");

      correlationText.text("");
      correlationHeader.text("");
      trendHeader.text("");
      trendText.text("");

      switch (xProperty) {
        case "age":

          if (yProperty == "smokes") { yDescription = "smoking" }
          else { yDescription = yProperty };

          correlationText.text(`There is insufficient evidence to 
            discern a trend between states’ median age and ${yDescription} under coverage rates.`)
          trendText.text(`Overall, the trends among median age and obesity, smoking, 
            and healthcare under coverage are imperceptible at this level of scrutiny.`);
          break;

        case "poverty":

          if (yProperty == "smokes") { yDescription = "smoking" }
          else {
            if (yProperty == "healthcare") { yDescription = yProperty + " under coverage" }
            else { yDescription = yProperty };
          };

          correlationText.text(`The data suggests that states with higher ${xProperty} 
            rates also have higher ${yDescription} rates.`);
          trendText.text(`Overall at this level of scrutiny, the data suggests that 
            states with higher poverty rates have higher rates of obesity, smoking, 
            and healthcare under coverage, and states with lower poverty rates have lower 
            rates of these health risks.`);
          break;

        case "income":

          if (yProperty == "smokes") { yDescription = "smoking" }
          else {
            if (yProperty == "healthcare") { yDescription = yProperty + " under coverage" }
            else { yDescription = yProperty };
          };

          correlationText.text(`The data suggests that states with higher ${xProperty} 
            rates also have lower ${yDescription} rates.`);
          trendText.text(`Overall at this level of scrutiny, the data suggests that 
            states with a higher median household income also have higher rates of obesity, 
            smoking, and under coverage of healthcare, and states with a lower median 
            household income have lower rates of these health risks.`);
          break;
      }

      correlationHeader.text(`Correlation Between ${xProperty} and ${yProperty}`);
      trendHeader.text(`Correlation Between ${xProperty} and All Health Risks`);

      // Create tooltip in the chart
      // ==============================
      chartGroup.call(toolTip);

      // Create event listeners to display and hide the tooltip
      // ==============================
      circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
      })
        // onmouseout event
        .on("mouseout", function (data, index) {
          toolTip.hide(data);
        });

      // end function drawTable
    }

    // Initialize Table
    // ==============================
    var currentXProperty = "poverty";
    var currentYProperty = "healthcare";

    drawTable(currentXProperty, currentYProperty);

    // Create y-axis labels
    // ==============================
    // Whenever the user changes the viewable dataset we must 
    // clear the chart's html tags.  Otherwise, the data will
    // not bind to the tags.
    // ==============================
    // Append each tag to the parent node so that
    // it will not be cleared when we redraw the chart. 
    chartGroup.select(function () { return this.parentNode })
      .append("text")
      .classed("inactive ylabel", true)
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .text("Obese (%)")
      .on("click", function () {
        chartGroup.html("");
        drawTable(currentXProperty, "obesity", currentXProperty, currentYProperty);
        currentYProperty = "obesity";
        d3.selectAll(".ylabel").attr("class", "inactive ylabel");
        d3.select(this).attr("class", "active ylabel");
      });

    chartGroup.select(function () { return this.parentNode })
      .append("text")
      .classed("inactive ylabel", true)
      .attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .text("Smokes (%)")
      .on("click", function () {
        chartGroup.html("");
        drawTable(currentXProperty, "smokes", currentXProperty, currentYProperty);
        currentYProperty = "smokes";
        d3.selectAll(".ylabel").attr("class", "inactive ylabel");
        d3.select(this).attr("class", "active ylabel");
      });

    chartGroup.select(function () { return this.parentNode })
      .append("text")
      .classed("active ylabel", true)
      .attr("transform", "rotate(-90)")
      .attr("y", 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .text("Lacks Healthcare (%)")
      .on("click", function () {
        chartGroup.html("");
        drawTable(currentXProperty, "healthcare", currentXProperty, currentYProperty);
        currentYProperty = "healthcare";
        d3.selectAll(".ylabel").attr("class", "inactive ylabel");
        d3.select(this).attr("class", "active ylabel");
      });

    // Create x-axis labels
    // ==============================
    // Whenever the user changes the viewable dataset we must 
    // clear the chart's html tags.  Otherwise, the data will
    // not bind to the tags.
    // ==============================
    // Append each tag to the parent node so that
    // it will not be cleared when we redraw the chart. 
    chartGroup.select(function () { return this.parentNode })
      .append("text")
      .classed("active xlabel", true)
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .text("Poverty (%)")
      .on("click", function () {
        chartGroup.html("");
        drawTable("poverty", currentYProperty, currentXProperty, currentYProperty);
        currentXProperty = "poverty";
        d3.selectAll(".xlabel").attr("class", "inactive xlabel");
        d3.select(this).attr("class", "active xlabel");
      });

    chartGroup.select(function () { return this.parentNode })
      .append("text")
      .classed("inactive xlabel", true)
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 50})`)
      .text("Age (Median)")
      .on("click", function () {
        chartGroup.html("");
        drawTable("age", currentYProperty, currentXProperty, currentYProperty);
        currentXProperty = "age";
        d3.selectAll(".xlabel").attr("class", "inactive xlabel");
        d3.select(this).attr("class", "active xlabel");
      });

    chartGroup.select(function () { return this.parentNode })
      .append("text")
      .classed("inactive xlabel", true)
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 70})`)
      .text("Household Income (Median)")
      .on("click", function () {
        chartGroup.html("");
        drawTable("income", currentYProperty, currentXProperty, currentYProperty);
        currentXProperty = "income";
        d3.selectAll(".xlabel").attr("class", "inactive xlabel");
        d3.select(this).attr("class", "active xlabel");
      });

    // end .then()
  });
