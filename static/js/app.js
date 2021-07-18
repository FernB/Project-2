
 
// Call database data
d3.json("/api/data", function(apidata) {

 console.log(apidata)
  
  // default options for disease group, year and location
  var groupoption = "Gastrointestinal diseases";
  var locationoption = "Aust";
  var yearoption = 2015;

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


    f = apidata.filter(function(d) { return d.Disease_Group===groupoption})
    
 
  ds = f.filter(function(d) { return d.Location==="WA"})

  var yearfiltered = apidata.filter(function(d) { return d.Year===yearoption})

  var alllocation = apidata.filter(d=>d.Location===locationoption).filter(d=>d.Year===yearoption)

    fd = d3.map(apidata, function(d){return(d.Location)}).keys()

    console.log(f)
    wa = d3.sum(apidata
  .filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location==="WA"}).map(d => d.Infection_Rate))
    sa = d3.sum(apidata
  .filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location==="SA"}).map(d => d.Infection_Rate))

    dtt = d3.map(f, function(d) {return(d.Disease)}).keys()
    console.log(dtt.length)

  // array of state names from geojson
  var fullstatenames = ["New South Wales", "Victoria", "Queensland", "South Australia", "Western Australia", "Tasmania", "Northern Territory", "Australian Capital Territory"]
    
  // array of state abbreviations from database
  var stateabbr = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT", "Aust", "Last 5yearsmean"]
    
  // map max rate of infection for each state per group and year
  var maxgroupperstate = stateabbr.map(state => d3.max(apidata.filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location===state}).filter(d=>d.Year===yearoption).map(d => d.Infection_Rate)))

    console.log(maxgroupperstate)


  // get states geojson data
  d3.json("/static/data/australian-states.min.geojson", function(data){
  
  
    // create map svg
    var widthmap = 550;
    var heightmap = 550;
  
    var svgmap = d3.select("#map")
                  .append("svg")
                  .attr("height",heightmap)
                  .attr("width",widthmap);


  // console.log(data.features[0].properties.STATE_NAME)

  // fpt = data.features.map(d => d.properties.STATE_NAME)
  // console.log(fpt)

  // create colour scale
  var myColour = d3.scaleSequential().domain(d3.extent(maxgroupperstate)).interpolator(d3.interpolateReds);
  
  // map state, colour based on max infection rate of selected group
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
          .on("click", function(d,i) {locationoption = stateabbr[i], updateY(),console.log(locationoption)} )

       
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




// line chart margins
var marginline = {top: 10, right: 30, bottom: 30, left: 60},
    widthline = 460 - marginline.left - marginline.right,
    heightline = 400 - marginline.top - marginline.bottom;

// line chart svg
var svgline = d3.select("#scatter")
  .append("svg")
    .attr("width", widthline + marginline.left + marginline.right)
    .attr("height", heightline + marginline.top + marginline.bottom)
  .append("g")
    .attr("transform",
          "translate(" + marginline.left + "," + marginline.top + ")");

var nestedbydisease = d3.nest() 
.key(function(d) { return d.Disease;})
.entries(ds);

var nestedbygroup = d3.nest()
.key(function(d){return d.Disease_Group})
.entries(alllocation)

var nestedyeargroup = d3.nest().key(d=>d.Location).key(d=>d.Disease_Group).rollup(function(leaves) {return d3.sum(leaves, d => d.Infection_Rate)}).entries(yearfiltered)

console.log(nestedyeargroup)

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
.range([ 0, widthline ]);



// Add Y axis
var yline = d3.scaleLinear()
.domain([0, d3.max(ds, function(d) { return d.Infection_Rate})])
.range([heightline, 0]);


var ylineAxis = d3.axisLeft(yline);
var xlineAxis = d3.axisBottom(xline).ticks(5).tickFormat(d3.format("d"));



svgline.append("g")
.attr("class", "yaxis")
.call(ylineAxis);

svgline.append("g")
.attr("class", "xaxis")
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
var dataPlot = svgline.selectAll(".line")
  .data(nestedbydisease)
  .enter()
  .append("path")
    .attr("class",".line")
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
    .attr("height", heightline + marginline.top + marginline.bottom)
  .append("g")
    .attr("transform",
          "translate(" + marginline.left + "," + marginline.top + ")");

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
  .offset([-2, 0])
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


var mappedstates = data.features.map(d => d.properties.STATE_NAME)
console.log(mappedstates)
  var maptoolTip = d3.tip()
  .attr("class", "d3-tip")
  .offset([0, 0])
  .html(d => { i = data.features.map(d => d.properties.STATE_NAME).indexOf(d.properties.STATE_NAME)
      return (`<h6>${d.properties.STATE_NAME}</h6><h6>${groupoption}</h6><h6>Max Disease Infection Rate:  ${maxgroupperstate[i]}</h6>`)});

  mapchart.call(maptoolTip);

  mapchart.on("mouseover", function(d) {
    maptoolTip.show(d, this)
    })

    .on("mouseout", function(d) {
      maptoolTip.hide(d)
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

var chartWidth = svgbWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgbHeight - chartMargin.top - chartMargin.bottom;




var svgbar = d3.select("#bar")
  .append("svg")
  .attr("align","center")
    .attr("height", svgbHeight)
    .attr("width", svgbWidth)
    .append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);;


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

  var bartoolTip = d3.tip()
  .attr("class", "d3-tip")
  .offset([0,50])
  .html(function(d) {
      return (`<h6>${d.key}</h6><h6>Max Disease Infection Rate:   ${d.value.total_infection}</h6>`)});

      bargroup.call(bartoolTip);

      bargroup.on("mouseover", function(d) {
    bartoolTip.show(d, this)
    })

    .on("mouseout", function(d) {
      bartoolTip.hide(d)
    });





// set the dimensions and margins of the graph
var marginsb = {top: 10, right: 30, bottom: 20, left: 50},
    widthsb = 460 - marginsb.left - marginsb.right,
    heightsb = 400 - marginsb.top - marginsb.bottom;

// append the svg object to the body of the page
var svgsb = d3.select("#stackedbar")
  .append("svg")
    .attr("width", widthsb + marginsb.left + marginsb.right)
    .attr("height", heightsb + marginsb.top + marginsb.bottom)
  .append("g")
    .attr("transform",
          "translate(" + marginsb.left + "," + marginsb.top + ")");




var flatten = [];
var total = []
nestedyeargroup.forEach(function(d) {
    var obj = { Location: d.key }
        d.values.forEach(function(f) {
            obj[f.key] = f.value;
            total.push(f.value)
        });
    flatten.push(obj);
  });




 // Add X axis
 var xsb = d3.scaleBand()
     .domain(flatten.map(function(d) {return d.Location}))
     .range([0, widthsb])
     .padding([0.2])
     svgsb.append("g")
   .attr("transform", "translate(0," + heightsb + ")")
   .attr("class","xsbaxis")
   .call(d3.axisBottom(xsb).tickSizeOuter(0));

 // Add Y axis
 var ysb = d3.scaleLinear()
   .domain([0, d3.max(total)])
   .range([heightsb, 0 ]);
   svgsb.append("g")
   .attr("class","ysbaxis")
   .call(d3.axisLeft(ysb));

 var colorsb = d3.scaleOrdinal()
   .domain(allGroups)
   .range(d3.schemeCategory10);

   console.log(flatten)
 
 //stack the data? --> stack per subgroup
 var stackedData = d3.stack()
   .keys(allGroups)
   (flatten)

   var mouseoversb = function(d) {
    
    var subgroupName = d3.select(this.parentNode).attr("class"); 
    var subgroupValue = d.data[allGroups];
   
    console.log(subgroupName)
    // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
    svgsb.selectAll("rect").style("opacity",0.2)
    d3.select(this.parentNode).selectAll("rect").style("opacity", 1)
    
    


     

    }

  // When user do not hover anymore
  var mouseleavesb = function(d) {
    // Back to normal opacity: 0.8
    d3.selectAll("rect")
      .style("opacity",0.8)
    }
console.log(stackedData)
  // Show the bars
  var stackedbar = svgsb.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
      .attr("fill", function(d) { return colorsb(d.key); })
      .attr("class", function(d){ return "myRect " + d.key }) // Add a class to each subgroup: their name
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return xsb(d.data.Location); })
        .attr("y", function(d) {return ysb(Object.values(d)[1])})
        .attr("height", function(d,i) { return (ysb(Object.values(d)[0]) - ysb(Object.values(d)[1])); })
        .attr("width",xsb.bandwidth())
        .attr("stroke", "grey")
        .style("opacity",0.8)
      .on("mouseover", mouseoversb)
      .on("mouseleave", mouseleavesb)



      var legendsb = d3.select("#stackedbar")
      .append("svg")
        .attr("width", 350)
        .attr("height", heightsb + marginsb.top + marginsb.bottom)
      .append("g")
        .attr("transform",
              "translate(" + marginsb.left + "," + marginsb.top + ")");
    
    legendsb.selectAll("sbsq")
    .data(allGroups)
    .enter()
    .append("circle")
      .attr("cx", 0)
      .attr("cy", function(d,i){ return 30 + i*25})
      .attr("r", 5)
      .style("fill", function(d){ return colorsb(d)})
    
    // Add one dot in the legend for each name.
    legendsb.selectAll("sblabels")
    .data(allGroups)
    .enter()
    .append("text")
      .attr("font-family", "sans-serif")
      .attr("x", 15)
      .attr("y", function(d,i){ return 30 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function(d){ return colorsb(d)})
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
























  function updateY() {

      
    var newlocation = apidata
    .filter(d=>d.Location===locationoption)
    var newdata = newlocation.filter(function(d) { return d.Disease_Group===groupoption})
    
    var newnested_max = d3.nest()
    .key(function(d) { return d.Disease_Group; })
    .rollup(function(leaves) { return {"total_infection": d3.max(leaves, function(d) {return d.Infection_Rate})} })
    .entries(newlocation.filter(d=>d.Year===+yearoption));

    var newyearfiltered = apidata.filter(function(d) { return d.Year===+yearoption})
    

    var newnestedyeargroup = d3.nest().key(d=>d.Location).key(d=>d.Disease_Group).rollup(function(leaves) {return d3.sum(leaves, d => d.Infection_Rate)}).entries(newyearfiltered)

var newflatten = [];
var newtotal = []
newnestedyeargroup.forEach(function(d) {
    var obj = { Location: d.key }
        d.values.forEach(function(f) {
            obj[f.key] = f.value;
            newtotal.push(f.value)
        });
    newflatten.push(obj);
  });

  var newstackedData = d3.stack()
  .keys(allGroups)
  (newflatten)

  ysb
  .domain([0, d3.max(newtotal)])
  .range([heightsb, 0 ]);

  svgsb.select(".ysbaxis")
  .transition()
  .duration(1000)
  .call(d3.axisLeft(ysb));



var locationkey = newflatten.map(function(d) {return d.Location})
 

svgsb.selectAll("g").filter(function() {
  return this.classList.contains('myRect')}).remove()






stackedbar = svgsb.append("g")
.selectAll("g")
.data(newstackedData)
.enter().append("g")
  .attr("fill", function(d) { return colorsb(d.key); })
  .attr("class", function(d){ return "myRect " + d.key }) // Add a class to each subgroup: their name
  .selectAll("rect")
  .data(function(d) { return d; })
  .enter().append("rect")
    .attr("x", function(d) { return xsb(d.data.Location); })
    .attr("y", function(d) {return ysb(Object.values(d)[1])})
    .attr("height", function(d,i) { return (ysb(Object.values(d)[0]) - ysb(Object.values(d)[1])); })
    .attr("width",xsb.bandwidth())
    .attr("stroke", "grey")
    .style("opacity",0.8)
  .on("mouseover", mouseoversb)
  .on("mouseleave", mouseleavesb)










    var newnestedbydisease = d3.nest() 
    .key(function(d) { return d.Disease;})
    .entries(newdata);


   

var maxline = d3.nest()
.key(d=>d.Disease)
.rollup(s =>{return {"max" : d3.max(s, d=> d.Infection_Rate)}})
.entries(newdata)

console.log(d3.max(maxline, function(d) { return d.value.max }))

  var newmaxgroupperstate = stateabbr.map(state => d3.max(apidata
  .filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location===state}).filter(d=>d.Year===+yearoption).map(d => d.Infection_Rate)))

    myColour = d3.scaleSequential().domain(d3.extent(newmaxgroupperstate)).interpolator(d3.interpolateReds);

    console.log(d3.max(maxline, function(d) { return d.value.max }))
    
    yline.domain([0, d3.max(newdata, function(d) { return +d.Infection_Rate })])
    .range([heightline,0])

    xline
    .domain(d3.extent(newdata, function(d) { return d.Year; }))
    .range([ 0, widthline ]);

    svgline.select(".xaxis")
    .transition()
    .duration(1000)
    .call(xlineAxis)
    

    svgline.select(".yaxis")
    .transition()
    .duration(1000)
    .call(ylineAxis)



    
    // var yline = d3.scaleLinear()
    // .domain([0, d3.max(ds, function(d) { return d.Infection_Rate})])
    // .range([heightline, 0]);
    
    
    // var ylineAxis = d3.axisLeft(yline);
  


    var  newres = newnestedbydisease.map(function(d){ return d.key }) // list of group names
    var newcolor = d3.scaleOrdinal()
    .domain(newres)
    .range(d3.schemeCategory10)


    
    
    
    var newplot = svgline.selectAll("path").filter(function() {
      return !this.classList.contains('domain')
    }).data(newnestedbydisease);

    newplot
    .enter()
    .append("path")
    .attr("class",".line")
    .merge(newplot)
    .transition()
    .duration(1000)
    .attr("fill", "none")
    .attr("stroke", function(d){ return newcolor(d.key) })
    .attr("stroke-width", 2)
    .attr("d", function(d){
        return d3.line()
                .x(function(d) { return xline(d.Year) })
                .y(function(d) { return yline(+d.Infection_Rate) })
                (d.values)});

        // svgline.exit().remove();

        newplot.exit().remove();


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





 
