// // @TODO: YOUR CODE HERE!


// // define dimensions of svg
// var svgWidth = 960;
// var svgHeight = 660;

// // define chart margin
// var chartMargin = {
//     top: 100,
//     right: 100,
//     bottom: 100,
//     left: 100
//   };
// console.log("S")
// // define chart dimensions
// var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
// var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// // create svg
// var svg = d3.select("#scatter")
//   .append("svg")
//   .attr("height", svgHeight)
//   .attr("width", svgWidth);

// // create chart group
// var chartGroup = svg.append("g")
//   .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// import data python http server to be initialised





        



d3.json("/api/data", function(data2) {

 console.log(data2)
    groupoption = "Gastrointestinal diseases"
    f = data2.filter(function(d) { return d.Disease_Group===groupoption})
    allGroup = d3.map(data2, function(d){return(d.Disease_Group)}).keys()

      d3.select("#selectButton")
  .selectAll('myOptions')
  .data(allGroup)
  .enter()
  .append('option')
  .text(function (d) { return d; }) // text showed in the menu
  .attr("value", function (d) { return d; }) // corresponding value returned by the button

    

    ds = f.filter(function(d) { return d.Location==="WA"})
    fd = d3.map(data2, function(d){return(d.Location)}).keys()

    console.log(f)
    wa = d3.sum(data2.filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location==="WA"}).map(d => d.Infection_Rate))
    sa = d3.sum(data2.filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location==="SA"}).map(d => d.Infection_Rate))

    dtt = d3.map(f, function(d) {return(d.Disease)}).keys()
    console.log(dtt.length)

    stest = ["New South Wales", "Victoria", "Queensland", "South Australia", "Western Australia", "Tasmania", "Northern Territory", "Australian Capital Territory"]

    col = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT", "Aust", "Last 5yearsmean"]
    total = col.map(state => d3.sum(data2.filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location===state}).map(d => d.Infection_Rate))/dtt.length)

    console.log(total)

    // var myColour = d3.scaleLinear().domain(d3.extent(stdobs)).range(["white","blue"]);


  var svg = d3.select("#map")
  width = +svg.attr("width")
  height = +svg.attr("height")
  
  
  d3.json("/static/data/australian-states.min.geojson", function(data){
  
  
  console.log(data.features[0].properties.STATE_NAME)

  fpt = data.features.map(d => d.properties.STATE_NAME)
  var colourscheme = ['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02','#a6761d','#666666']
  console.log(fpt)
  var myColour = d3.scaleSequential().domain(d3.extent(total)).interpolator(d3.interpolateReds);
         // .attr("fill", function(d,i) { return myColour(stdobs[metrolga.indexOf(d.properties.name)])})
  
  var statefilter = ""
  var projection = d3.geoMercator()
  .center([131, -25.95])       
  .scale(500)                    
  .translate([ width/2, height/2 ])
  svg.append("g")
      .selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
        .attr("opacity",0.7)
          .attr("d", d3.geoPath()
              .projection(projection)
          )
          .attr("fill", function(d,i) { return myColour(total[i])})
          .style("stroke", "grey")
          .on("click", function(d,i) {d3.select(this).attr("fill","green"), statefilter = col[i], updateY(statefilter),console.log(statefilter)} )
  
        })


// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg2 = d3.select("#scatter")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// group the data: I want to draw one line per group
var nestedbydisease = d3.nest() // nest function allows to group the calculation per level of a factor
.key(function(d) { return d.Disease;})
.entries(ds);

console.log(nestedbydisease)

  // x = f.map(d => d.Infection_Rate)
  // console.log(x)

  // y = f.map(d => d.Year)
  // console.log(y)
  

// Add X axis --> it is a date format
var x = d3.scaleLinear()
.domain(d3.extent(ds, function(d) { return d.Year; }))
.range([ 0, width ]);
svg2.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));

// Add Y axis
var y = d3.scaleLinear()
.domain([0, d3.max(ds, function(d) { return d.Infection_Rate; })])
.range([ height, 0 ]);
svg2.append("g")
.attr("class", "yaxis")
.call(d3.axisLeft(y));

// color palette
var res = nestedbydisease.map(function(d){ return d.key }) // list of group names
var color = d3.scaleOrdinal()
.domain(res)
.range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

var linepath = d3.line()
.x(d=>x(d.Year))
.y(d=>y(d.Infection_Rate));


// Draw the line
var dataPlot = svg2.selectAll(".line")
  .data(nestedbydisease)
  .enter()
  .append("path")
    .attr("fill", "none")
    .attr("stroke", function(d){ return color(d.key) })
    .attr("stroke-width", 2)
    .attr("d", function(d){
      return d3.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(+d.Infection_Rate); })
        (d.values)
    })


  // Add one dot in the legend for each name.
  var legend = d3.select("#scatter")
  .append("svg")
    .attr("width", 200)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

legend.selectAll("mydots")
.data(res)
.enter()
.append("circle")
  .attr("cx", 0)
  .attr("cy", function(d,i){ return 30 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
  .attr("r", 5)
  .style("fill", function(d){ return color(d)})

// Add one dot in the legend for each name.
legend.selectAll("mylabels")
.data(res)
.enter()
.append("text")
  .attr("x", 10)
  .attr("y", function(d,i){ return 30 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
  .style("fill", function(d){ return color(d)})
  .text(function(d){ return d})
  .attr("text-anchor", "left")
  .style("alignment-baseline", "middle")

    

    function updateY(state) {

      var newdata = f.filter(function(d) { return d.Location===state})

      var newnestedbydisease = d3.nest() // nest function allows to group the calculation per level of a factor
      .key(function(d) { return d.Disease;})
      .entries(newdata);

      
      y.domain([0, d3.max(newdata, function(d) { return d.Infection_Rate; })])
      svg2.select(".yaxis")
      .transition()
      .duration(1000)
      .call(d3.axisLeft(y));

      dataPlot.data(newnestedbydisease)
      .transition()
      .duration(1000)
      .attr("d", function(d){
        return d3.line()
          .x(function(d) { return x(d.Year); })
          .y(function(d) { return y(+d.Infection_Rate); })
          (d.values)})
      }












})







// d3.json("/api/data").then(function(data) {

              // groupoption = "Zoonosis"
                // var bounds = data.features.filter(function(d){return metrolga.includes(d.properties.name)});
    // f = data.filter(function(d) { return d.Disease_Group===groupoption})
    // console.log(f)
  

  
//   // data.forEach(function(d) {if (d.Disease==="Campylobacteriosis") {console.log(d.Infection_Rate)}})

  // var Groupeddiseases = d3.map(data, function(d){return(d.Disease_Group)}).keys()
  // console.log(Groupeddiseases)

 
// });


//   var allGroup = d3.map(data, function(d){return(d.Disease)}).keys()
//   console.log(allGroup)

//   d3.select("#selectButton")
//   .selectAll('myOptions')
//   .data(allGroup)
//   .enter()
//   .append('option')
//   .text(function (d) { return d; }) // text showed in the menu
//   .attr("value", function (d) { return d; }) // corresponding value returned by the button

//   f = data.filter(function(d) { return d.Disease==="Campylobacteriosis"} )
//   console.log(f)



//   x = f.map(d => d.Infection_Rate)
//   console.log(x)

//   y = f.map(d => d.Year)
//   console.log(y)
  
   





//   // set x scale
//   var xScale = d3.scaleLinear()
//     .domain([d3.min(y),d3.max(y)])
//     .range([0,chartWidth]);

//   // set y scale
//   var yScale = d3.scaleLinear()
//     .domain([d3.min(x)*0.9,d3.max(x)*1.1])
//     .range([chartHeight,0]);

//   // set x and y axis
//   var yAxis = d3.axisLeft(yScale);
//   var xAxis = d3.axisBottom(xScale);

//   // display y axis
//   chartGroup.append("g")
//     .attr("class", "yaxis")
//     .call(yAxis);

//   // display x axis
//   chartGroup.append("g")
//     .attr("class", "xaxis")
//     .attr("transform", `translate(0, ${chartHeight})`)
//     .call(xAxis);

//  7
//   var dataPlot = chartGroup.append("g")
//     .selectAll("dot")
//     .data(x)
//     .enter()
//     .append("circle")
//     .attr("cx", (d,i) => xScale(y[i])  )
//     .attr("cy", (d,i) => yScale(d) )
//     .attr("r", 5)
//     .style("fill", "#9ecae1");




//     d3.select("#selectButton").on("change", function(d) {
//       // recover the option that has been chosen
//       var selectedOption = d3.select(this).property("value")
//       // run the updateChart function with this selected option
//       update(selectedOption)
//   })

//   // var line1 = d3.line()
//   //     .x(d => xScale(d.Year))
//   //     .y(d => yScale(d.Infection_Rate))
//   //     .classed("line green", true);

//   // var dataPlot = chartGroup
//   //   .append("path")
//   //   .attr("d",line1(f))


//   // d3.select("#selectButton").on("change", function(d) {
//   //   // recover the option that has been chosen
//   //   var groupoption = d3.select(this).property("value")
//   //   // run the updateChart function with this selected option
//   //   updates(groupoption)
//   //   })


//   // function updates(newselection) {

//   //   f = data.filter(function(d) { return d.Disease_Group===newselection} )
//   //   console.log(f)
  
//   //   x = f.map(d => d.Infection_Rate)
//   //   console.log(x)
      
//   //   yScale.domain([d3.min(x)*0.9,d3.max(x)*1.1])
//   //   chartGroup.select(".yaxis")
//   //   .transition()
//   //   .duration(1000)
//   //   .call(yAxis);

//   //   dataPlot.data(f)
//   //   .transition()
//   //   .duration(1000)
//   //   .attr("cy", d => yScale(d.Infection_Rate));
    
 


//   // };



//   function update(newy) {

//     f = data.filter(function(d) { return d.Disease===newy} )
//     console.log(f)
  
//     x = f.map(d => d.Infection_Rate)
//     console.log(x)
      
//     yScale.domain([d3.min(x)*0.9,d3.max(x)*1.1])
//     chartGroup.select(".yaxis")
//     .transition()
//     .duration(1000)
//     .call(yAxis);

//     dataPlot.data(x)
//     .transition()
//     .duration(1000)
//     .attr("cy", d => yScale(d));
    
 


//   };





// var svg = d3.select("svg"),
//     width = +svg.attr("width"),
//     height = +svg.attr("height");




// d3.json("/static/data/australian-states.min.geojson", function(data){

//     // var bounds = data.features.filter(function(d){return metrolga.includes(d.properties.name)});

//     var myColour = d3.scaleLinear().domain(d3.extent(stdobs)).range(["white","blue"]);
 

//     var projection = d3.geoMercator()
//     .center([115.85, -31.95])       
//     .scale(500)                    
//     .translate([ width/2, height/2 ])
//     console.log(data.features)
//     svg.append("g")
//         .selectAll("path")
//         .data(data.features)
//         .enter()
//         .append("path")
//           .attr("opacity",0.7)
//           .attr("fill", function(d,i) { return myColour(stdobs[metrolga.indexOf(d.properties.name)])})
//             .attr("d", d3.geoPath()
//                 .projection(projection)
//             )
//             .style("stroke", "grey")

        
// })




// // Creating map object
// var myMap = L.map("map", {
//   center: [40.7128, -74.0059],
//   zoom: 11
// });

// // Adding tile layer
// L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//   attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
//   tileSize: 512,
//   maxZoom: 18,
//   zoomOffset: -1,
//   id: "mapbox/streets-v11",
//   accessToken: API_KEY
// }).addTo(myMap);

// // Use this link to get the geojson data.
// var link = "static/data/australian-states.min.geojson";

// Grabbing our GeoJSON data..
// d3.json(link).then(function(data) {
//   // Creating a GeoJSON layer with the retrieved data
//   L.geoJson(data).addTo(myMap);
// });


