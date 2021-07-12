// @TODO: YOUR CODE HERE!


// define dimensions of svg
var svgWidth = 960;
var svgHeight = 660;

// define chart margin
var chartMargin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100
  };
console.log("S")
// define chart dimensions
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// create svg
var svg = d3.select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// create chart group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// import data python http server to be initialised
d3.json("/api/ACT/Gastrointestinal diseases").then(function(data) {

  data.forEach(function(d) {if (d.Disease==="Campylobacteriosis") {console.log(d.Infection_Rate)}})



  f = data.filter(function(d) { return d.Disease==="Campylobacteriosis"} )
  console.log(f)

  x = f.map(d => d.Infection_Rate)
  console.log(x)

  y = f.map(d => d.Year)
  console.log(y)
  
    // parse each parameter as integer
    // data.forEach(function(d) {
    //     d.poverty = +d.poverty;
    //     d.healthcare = +d.healthcare;
    //     d.obesity = +d.obesity;
    //     d.smokes = +d.smokes;
    //     d.age = +d.age;
    //     d.income = +d.income;
    //   });





  // set x scale
  var xScale = d3.scaleLinear()
    .domain([d3.min(y),d3.max(y)])
    .range([0,chartWidth]);

  // set y scale
  var yScale = d3.scaleLinear()
    .domain([d3.min(x)*0.9,d3.max(x)*1.1])
    .range([chartHeight,0]);

  // set x and y axis
  var yAxis = d3.axisLeft(yScale);
  var xAxis = d3.axisBottom(xScale);

  // display y axis
  chartGroup.append("g")
    .attr("class", "yaxis")
    .call(yAxis);

  // display x axis
  chartGroup.append("g")
    .attr("class", "xaxis")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(xAxis);

  // create data points in scatter graph
  var dataPlot = chartGroup.append("g")
    .selectAll("dot")
    .data(x)
    .enter()
    .append("circle")
    .attr("cx", (d,i) => xScale(y[i])  )
    .attr("cy", (d,i) => yScale(d) )
    .attr("r", 10)
    .style("fill", "#9ecae1");




});


