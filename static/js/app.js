


      
// Call database data
d3.json("/api/data", function(apidata) {

 console.log(apidata)
  
  // default options
  var groupoption = "Gastrointestinal diseases";
  var locationoption = "Aust";
  var yearoption = 2015;

  f = apidata.filter(function(d) { return d.Disease_Group===groupoption})


  // get list of all disease groups for dropdown list
  var allGroups = d3.map(apidata, function(d){return(d.Disease_Group)}).keys()

  // get list of all years for dropdown list
  var allYears = d3.map(apidata, function(d){return(d.Year)}).keys()


  // append options to menu
  d3.select("#selectButton")
  .selectAll('myOptions')
  .data(allGroups)
  .enter()
  .append('option')
  .text(d => d) 
  .attr("value", d => d) 

    // append options to menu
  d3.select("#selectYear")
    .selectAll('yearOptions')
    .data(allYears)
    .enter()
    .append('option')
    .text(d => d) 
    .attr("value", d => d) 



    
 
    ds = f.filter(function(d) { return d.Location==="WA"})
    var alllocation = apidata
.filter(d=>d.Location===locationoption).filter(d=>d.Year===yearoption)

    fd = d3.map(apidata
  , function(d){return(d.Location)}).keys()

    console.log(f)
    wa = d3.sum(apidata
  .filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location==="WA"}).map(d => d.Infection_Rate))
    sa = d3.sum(apidata
  .filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location==="SA"}).map(d => d.Infection_Rate))

    dtt = d3.map(f, function(d) {return(d.Disease)}).keys()
    console.log(dtt.length)

    stest = ["New South Wales", "Victoria", "Queensland", "South Australia", "Western Australia", "Tasmania", "Northern Territory", "Australian Capital Territory"]

    col = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT", "Aust", "Last 5yearsmean"]
    
    
    var maxgroupperstate = col.map(state => d3.max(apidata
  .filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location===state}).filter(d=>d.Year===yearoption).map(d => d.Infection_Rate)))

    console.log(maxgroupperstate)

    // var myColour = d3.scaleLinear().domain(d3.extent(stdobs)).range(["white","blue"]);


  var svgmap = d3.select("#map")
  widthmap = +svgmap.attr("width")
  heightmap = +svgmap.attr("height")
  
  
  // get states geojson data
  d3.json("/static/data/australian-states.min.geojson", function(data){
  
  
  console.log(data.features[0].properties.STATE_NAME)

  fpt = data.features.map(d => d.properties.STATE_NAME)
  var colourscheme = ['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02','#a6761d','#666666']
  console.log(fpt)

  // create colour scale
  var myColour = d3.scaleSequential().domain(d3.extent(maxgroupperstate)).interpolator(d3.interpolateReds);
  
  var statefilter = ""
  // map state, colour based on total
  var projection = d3.geoMercator()
  .center([140, -30.95])       
  .scale(600)                    
  .translate([ widthmap/2, heightmap/2 ])
  var mapchart = svgmap.append("g")
      .selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
        .attr("opacity",0.7)
          .attr("d", d3.geoPath()
              .projection(projection))
          .attr("fill", function(d,i) { return myColour(maxgroupperstate[i])})
          .style("stroke", "grey")
          .attr("class","state")
          .on("click", function(d,i) {locationoption = col[i], updateY(),console.log(locationoption)} )

       
 // on option selected change option value and run update
    d3.select("#selectButton").on("change", function(d) {
          
      groupoption = d3.select(this).property("value")
      
      updateY()
    })
     // on option selected change option value and run update
     d3.select("#selectYear").on("change", function(d) {
      
      yearoption = d3.select(this).property("value")
      
      updateY()
    })














      



        



// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    heightline = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg2 = d3.select("#scatter")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", heightline + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// group the data: I want to draw one line per group
var nestedbydisease = d3.nest() // nest function allows to group the calculation per level of a factor
.key(function(d) { return d.Disease;})
.entries(ds);

var nestedbygroup = d3.nest()
.key(function(d){return d.Disease_Group})
.entries(alllocation)

console.log(nestedbygroup)

var maxgroup = nestedbygroup.map(d => d.values)
var mapped = maxgroup.map(d => d)

var nested_max = d3.nest()
.key(function(d) { return d.Disease_Group; })
.rollup(function(leaves) { return {"total_infection": d3.max(leaves, function(d) {return d.Infection_Rate})} })
.entries(alllocation);

var nested_mfax = d3.nest()
.key(function(d) { return d.Disease_Group; })
.rollup(function(leaves) { return {"total_infection": d3.min(leaves, function(d) {return d.Infection_Rate})} })
.entries(alllocation);



console.log(nested_max)

  // x = f.map(d => d.Infection_Rate)
  // console.log(x)

  // y = f.map(d => d.Year)
  // console.log(y)
  

// Add X axis --> it is a date format
var xline = d3.scaleLinear()
.domain(d3.extent(ds, function(d) { return d.Year; }))
.range([ 0, width ]);



// Add Y axis
var yline = d3.scaleLinear()
.domain([0, d3.max(ds, function(d) { return d.Infection_Rate; })])
.range([ heightline, 0 ]);


var ylineAxis = d3.axisLeft(yline);
var xlineAxis = d3.axisBottom(xline).ticks(5).tickFormat(d3.format("d"));

svg2.append("g")
.attr("class", "yaxis")
.call(ylineAxis);

svg2.append("g")
.attr("transform", "translate(0," + heightline + ")")
.call(xlineAxis);

// color palette
var res = nestedbydisease.map(function(d){ return d.key })
var color = d3.scaleOrdinal()
.domain(res)
.range(d3.schemeCategory10)

// var linepath = d3.line()
// .x(d=>x(d.Year))
// .y(d=>y(d.Infection_Rate));


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
        .x(function(d) { return xline(d.Year); })
        .y(function(d) { return yline(+d.Infection_Rate); })
        (d.values)
    })


  // Add one dot in the legend for each name.
  var legend = d3.select("#scatter")
  .append("svg")
    .attr("width", 350)
    .attr("height", heightline + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var legenddots = legend.selectAll("mydots")
.data(res)
.enter()
.append("circle")
  .attr("cx", 0)
  .attr("cy", function(d,i){ return 30 + i*25})
  .attr("r", 5)
  .style("fill", function(d){ return color(d)})

// Add one dot in the legend for each name.
var legendtext = legend.selectAll("mylabels")
.data(res)
.enter()
.append("text")
  .attr("font-family", "sans-serif")
  .attr("x", 10)
  .attr("y", function(d,i){ return 30 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
  .style("fill", function(d){ return color(d)})
  .text(function(d){ return d})
  .attr("text-anchor", "left")
  .style("alignment-baseline", "middle")

    

    

  // initialize tooltip
  var toolTip = d3.tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function(d) {
      return (`${d.key}`)});

  // add tooltip to chart
  dataPlot.call(toolTip);

  // mouseover to display tip
  dataPlot.on("mouseover", function(d) {
  toolTip.show(d, this)
  d3.select(this).style("stroke-width",4)
  })

  // mouseout to hide tip
  .on("mouseout", function(d) {
    toolTip.hide(d)
    d3.select(this).style("stroke-width",2)
  });












var sortednested = nested_max.sort((a, b) => b.value.total_infection - a.value.total_infection);

// Setting vabriable for height and width for ease of calculations
var svgbHeight = 400;
var svgbWidth = 700;

var chartMargin = {
  top: 30,
  right: 30,
  bottom: 30,
  left: 150
};

// Define dimensions of the chart area
var chartWidth = svgbWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgbHeight - chartMargin.top - chartMargin.bottom;


// Append an SVG wrapper to the page and set a variable equal to a reference to it


var svgbar = d3.select("#bar")
  .append("svg")
  .attr("align","center")
    .attr("height", svgbHeight)
    .attr("width", svgbWidth)
    .append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);;

//     var bargroup = svgbar.append("g")
//     .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);



    // var svgbar = d3.select("#bar")
    // .append("svg")
    //   .attr("width", width + margin.left + margin.right)
    //   .attr("height", height + margin.top + margin.bottom)
    // .append("g")
    //   .attr("transform",
    //         "translate(" + margin.left + "," + margin.top + ")");


  //           var x = d3.scaleBand()
  //           .range([ 0, width ])
  //           .domain(nested_max.map(function(d) { return d.key; }))
  //           .padding(0.2);
    

  //           var y = d3.scaleLinear()
  // .range([ height, 0])
  // .domain([0, d3.max(nested_max, function(d) { return d.value.total_infection }) ]);



  // var bottomAxis = d3.axisBottom(x);
  // var leftAxis = d3.axisLeft(y);
  // svgbar.append("g")
  // .attr("class", "labels")
  // .call(leftAxis);
  
  // svgbar.append("g")
  // .attr("transform", `translate(0, ${chartHeight})`)
  // .attr("class", "scale")
  // .call(bottomAxis);
  

// svgbar.selectAll("rect")
//   .data(sortednested)
//   .enter().append("rect")
//   .classed("bar", true)
//   .attr("width", function(d) {
//     return d.value.total_infection/2;
//   })
//   .attr("height", 30)
//   .attr("fill","#31a354")
//   .attr("x", 0)
//   .attr("y", function(d, i) {
//     return i * 40;
//   });


  var yBandScale = d3.scaleBand()
  .domain(nested_max.map(d => d.key))
  .range([chartHeight, 30])
  .padding(0.1);

  var xLinearScale = d3.scaleLinear()
  .domain([0, d3.max(nested_max, d => d.value.total_infection)])
  .range([0,chartWidth]);


  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yBandScale);


  svgbar.append("g")
  .attr("class", "labels")
  .call(leftAxis);
  
  svgbar.append("g")
  .attr("transform", `translate(0, ${chartHeight})`)
  .attr("class", "scale")
  .call(bottomAxis);

  var bargroup = svgbar.selectAll("rect")
    .data(nested_max)
  .enter()
  .append("rect")
  .attr("fill","#31a354")
  .attr("class", "bar")
  .attr("x", 0)
  .attr("y", d => yBandScale(d.key))
  .attr("width", d => xLinearScale(d.value.total_infection))
  .attr("height", yBandScale.bandwidth());







  function updateY() {

      
    var newlocation = apidata
    .filter(d=>d.Location===locationoption)
    var newdata = newlocation.filter(function(d) { return d.Disease_Group===groupoption})
    
    var newnested_max = d3.nest()
    .key(function(d) { return d.Disease_Group; })
    .rollup(function(leaves) { return {"total_infection": d3.max(leaves, function(d) {return d.Infection_Rate})} })
    .entries(newlocation.filter(d=>d.Year===+yearoption));


    var newnestedbydisease = d3.nest() 
    .key(function(d) { return d.Disease;})
    .entries(newdata);

   

var maxline = d3.nest()
.key(d=>d.Disease)
.rollup(s =>{return {"max" : d3.max(s, d=> d.Infection_Rate)}})
.entries(newdata)

console.log(d3.max(maxline, function(d) { return d.value.max }))

  var newmaxgroupperstate = col.map(state => d3.max(apidata
  .filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location===state}).filter(d=>d.Year===+yearoption).map(d => d.Infection_Rate)))

    myColour = d3.scaleSequential().domain(d3.extent(newmaxgroupperstate)).interpolator(d3.interpolateReds);

    console.log(d3.max(newdata, function(d) { return d.Infection_Rate }))
    
    yline.domain([0, d3.max(maxline, function(d) { return d.value.max })])
    .range([heightline, 0]);

    svg2.select(".yaxis")
    .transition()
    .duration(1000)
    .call(ylineAxis);



    var  newres = newnestedbydisease.map(function(d){ return d.key }) // list of group names
    var newcolor = d3.scaleOrdinal()
    .domain(newres)
    .range(d3.schemeCategory10)


    var newplot = svg2.selectAll("path").data(newnestedbydisease);

    newplot
    .enter()
    .append("path")
    .merge(newplot)
    .transition()
    .duration(1000)
    .attr("fill", "none")
    .attr("stroke", function(d){ return newcolor(d.key) })
    .attr("stroke-width", 2)
    .attr("d", function(d){
      return d3.line()
        .x(function(d) { return xline(d.Year) })
        .y(function(d) { return yline(d.Infection_Rate) })
        (d.values)})



        newplot
        .exit()
        .remove()


      mapchart.data(data.features)
      .attr("fill", function(d,i) { return myColour(newmaxgroupperstate[i])})




    xLinearScale.domain([0, d3.max(newnested_max, function(d) { return d.value.total_infection; })])
    .range([0,chartWidth]);

        svgbar.select(".scale")
        .transition()
        .duration(1000)
        .call(bottomAxis);



    bargroup.data(newnested_max)
        .transition()
        .duration(1000)
        .attr("width", d => xLinearScale(d.value.total_infection))
        .attr("y", d => yBandScale(d.key))
        .attr("height", yBandScale.bandwidth());


      
console.log(newnested_max.map(function(d) { return d.value.total_infection; }))
    console.log(newnested_max)


   


    
  var newlegend = legend.selectAll('text').data(newres)

  newlegend
    .enter()
    .append("text")
    .merge(newlegend)
    .transition()
    .duration(1000)
      .style("fill", function(d){ return newcolor(d)})
      .text(function(d){ return d})
      .attr("font-family", "sans-serif")
      .attr("x", 10)
      .attr("y", function(d,i){ return i*25}) 
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

  var newdots = legend.selectAll('circle').data(newres)

  newdots
  .enter()
  .append("circle")
    .merge(newdots)
    .transition()
    .duration(1000)
    .attr("cx", 0)
    .attr("cy", function(d,i){ return i*25})
    .attr("r", 5)
    .style("fill", function(d){ return newcolor(d)})
    
    

    newlegend
      .exit()
      .remove()
      newdots
      .exit()
      .remove()

      console.log(newres)



}















})

})




// var xBandScale = d3.scaleBand()
// .domain(tvData.map(d => d.name))
// .range([0, chartWidth])
// .padding(0.1);

// Create a linear scale for the vertical axis.
// var yLinearScale = d3.scaleLinear()
// .domain([0, d3.max(tvData, d => d.hours)])
// .range([chartHeight, 0]);

// Create two new functions passing our scales in as arguments
// These will be used to create the chart's axes


// Append two SVG group elements to the chartGroup area,
// and create the bottom and left axes inside of them
// chartGroup.append("g")
// .call(leftAxis);

// chartGroup.append("g")
// .attr("transform", `translate(0, ${chartHeight})`)
// .call(bottomAxis);

// Create one SVG rectangle per piece of tvData
// Use the linear and band scales to position each rectangle within the chart
// chartGroup.selectAll(".bar")
// .data(tvData)
// .enter()
// .append("rect")
// .attr("class", "bar")
// .attr("x", d => xBandScale(d.name))
// .attr("y", d => yLinearScale(d.hours))
// .attr("width", xBandScale.bandwidth())
// .attr("height", d => chartHeight - yLinearScale(d.hours));



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


