
// Call database data
d3.json("/api/data", function(apidata) {

  
  // default options for disease group, year and location
  var groupoption = "Gastrointestinal diseases";
  var locationoption = "NSW";
  var yearoption = 2015;

  // get list of all disease groups for dropdown list
  var allGroups = d3.map(apidata, function(d){return(d.Disease_Group)}).keys();

  // get list of all years for dropdown list
  var allYears = d3.map(apidata, function(d){return(d.Year)}).keys();

  // append options to menu
  d3.select("#selectButton")
    .selectAll('myOptions')
    .data(allGroups)
    .enter()
    .append('option')
    .text(d => d) 
    .attr("value", d => d);

  // append options to menu
  d3.select("#selectYear")
    .selectAll('yearOptions')
    .data(allYears)
    .enter()
    .append('option')
    .text(d => d) 
    .attr("value", d => d);

  // data filtered by disease group
  var f = apidata.filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location !="Aust" && d.Location !="Last 5yearsmean" });
    
  // data filtered by state 
  var statefiltered = f.filter(function(d) { return d.Location===locationoption});

  // data filtered by year
  var yearfiltered = apidata.filter(function(d) { return d.Year===yearoption}).filter(function(d) { return d.Location !="Aust" && d.Location !="Last 5yearsmean" });

  // data filtered by location and year
  var alllocation = apidata.filter(d=>d.Location===locationoption).filter(d=>d.Year===yearoption).filter(function(d) { return d.Location !="Aust" && d.Location !="Last 5yearsmean" });


  // get states geojson data
  d3.json("/static/data/australian-states.min.geojson", function(data){
  
  // array of state names from geojson
  var fullstatenames = ["New South Wales", "Victoria", "Queensland", "South Australia", "Western Australia", "Tasmania", "Northern Territory", "Australian Capital Territory"];
    
  // array of state abbreviations from database
  var stateabbr = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"];
    
  // map total rate of infection for each state per group and year
  var maxgroupperstate = stateabbr.map(state => d3.sum(apidata.filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location===state}).filter(d=>d.Year===yearoption).map(d => d.Infection_Rate)));

  /* MAP CHART */
  
    // set svg width and height
    var widthmap = 500;
    var heightmap = 500;
  
    // create map svg in map div
    var svgmap = d3.select("#map")
      .append("svg")
      .attr("height",heightmap)
      .attr("width",widthmap);


    // create colour scale
    var myColour = d3.scaleSequential().domain(d3.extent(maxgroupperstate)).interpolator(d3.interpolateReds);
  
    // map state, colour based on max infection rate of selected group
    var projection = d3.geoMercator()
      .center([132, -30.95])       
      .scale(600)                    
      .translate([ widthmap/2, heightmap/2 ]);

    // map state, colour based on max infection rate of selected group
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
            .on("click", function(d,i) {locationoption = stateabbr[i], maptoolTip.hide(d), updateCharts()} );

  
    //initialise map tool tip
    var maptoolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([0, 0])
        .html(d => { i = data.features.map(d => d.properties.STATE_NAME).indexOf(d.properties.STATE_NAME)
              return (`<h6>${d.properties.STATE_NAME}</h6><h6>${groupoption}</h6><h6>Total Infection Rate:  ${Math.round(maxgroupperstate[i])}</h6>`)});
    
    // add tooltip to map
    mapchart.call(maptoolTip);
    
    // on mouseover show tooltip
    mapchart.on("mouseover", function(d) {
              maptoolTip.show(d, this)
            })
    // on mouseout hide tooltip      
            .on("mouseout", function(d) {
              maptoolTip.hide(d)
            });   

    // sort range for legend
    var max = Math.floor(d3.max(maxgroupperstate.slice(0,8))/10)*10
    var min = Math.ceil(d3.min(maxgroupperstate.slice(0,8))/10)*10
    var steps = Math.floor((max-min)/4/10)*10
    var range = [max, max-steps,max-2*steps,max-3*steps,min]

    // legend for map chart
    var legendmap = d3.select("#map")
    .append("svg")
      .attr("width", 200)
      .attr("height", heightmap)
    .append("g")
      .attr("transform",
            "translate(" + 20 + "," + 20 + ")");

    // add square for each infection rate band
    legendmap.selectAll("legendsquares")
    .data(range)
    .enter()
    .append("rect")
      .attr("x", 0)
      .attr("y", function(d,i){ return 60 + i*20})
      .attr("width", 20)
      .attr("height",20)
      .attr("stroke","gray")
      .style("fill", function(d){ return myColour(d)});

    // add name range next to each square
    legendmap.selectAll("maplabels")
    .data(range)
    .enter()
    .append("text")
      .attr("class","maplabels")
      .attr("font-family", "sans-serif")
      .attr("x", 25)
      .attr("y", function(d,i){ return 70 + i*20}) 
      .text(function(d,i){ return (i >0 && i<4) ? Math.round(range[i+1]) + " - " + Math.round(range[i]) : (i <4 ) ? ">"+Math.round(range[i+1]) : "<"+Math.round(range[i]) })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");


/* LINE CHART */


    // line chart margins
    var marginline = {top: 10, right: 30, bottom: 30, left: 70},
        widthline = 480 - marginline.left - marginline.right,
        heightline = 400 - marginline.top - marginline.bottom;

    // line chart svg
    var svgline = d3.select("#scatter")
      .append("svg")
        .attr("width", widthline + marginline.left + marginline.right)
        .attr("height", heightline + marginline.top + marginline.bottom)
      .append("g")
        .attr("transform",
              "translate(" + marginline.left + "," + marginline.top + ")");

    // nest data filtered by location by disease
    var nestedbydisease = d3.nest() 
    .key(function(d) { return d.Disease;})
    .entries(statefiltered);

    // nest data filtered by location and year by disease group
    var nestedbygroup = d3.nest()
    .key(function(d){return d.Disease_Group})
    .entries(alllocation);

    // filter out aus and 5yearmean
    var finalfiltered = yearfiltered.filter(function(d) { return d.Location !="Aust" && d.Location !="Last 5yearsmean" });

    // nest data by filtered by year by location and disease group roll up to sum total infection rates for each group
    var nestedyeargroup = d3.nest().key(d=>d.Location).key(d=>d.Disease_Group).rollup(function(leaves) {return d3.sum(leaves, d => d.Infection_Rate)}).entries(finalfiltered);

    // nest data filtered by location and year by disease group and roll up to sum total infection rates
    var nested_max = d3.nest()
    .key(function(d) { return d.Disease_Group; })
    .rollup(function(leaves) { return {"total_infection": d3.sum(leaves, function(d) {return d.Infection_Rate})} })
    .entries(alllocation);

    // x scale 
    var xline = d3.scaleLinear()
    .domain(d3.extent(statefiltered, function(d) { return d.Year; }))
    .range([ 0, widthline ]);

    // y scale
    var yline = d3.scaleLinear()
    .domain([0, d3.max(statefiltered, function(d) { return d.Infection_Rate})])
    .range([heightline, 0]);

    // set x and y axis
    var ylineAxis = d3.axisLeft(yline);
    var xlineAxis = d3.axisBottom(xline).ticks(5).tickFormat(d3.format("d"));

    // attach both axis to line graph
    svgline.append("g")
    .attr("class", "yaxis")
    .call(ylineAxis);

    svgline.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + heightline + ")")
    .call(xlineAxis);

    // color scales for each disease
    var res = nestedbydisease.map(function(d){ return d.key });
    var color = d3.scaleOrdinal()
    .domain(res)
    .range(d3.schemeDark2);

    // bind data to line group and draw lines for each disease
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
        });

        // x axis label
        svgline.append("g")
          .attr("text-anchor", "middle")
          .attr("font-size",14)
          .attr("fill","black")
          .append("text")
          .attr("y", -40)
          .attr("x", -190)
          .attr("transform","rotate(-90)")
          .attr("id","xs")
          .text("Infection Rate per 100,000 Population")


    // legend for line chart
    var legend = d3.select("#scatter")
    .append("svg")
      .attr("width", 350)
      .attr("height", heightline + marginline.top + marginline.bottom)
    .append("g")
      .attr("transform",
            "translate(" + marginline.left + "," + marginline.top + ")");

    // add circle for each disease
    var legenddots = legend.selectAll("mydots")
    .data(res)
    .enter()
    .append("circle")
      .attr("cx", 0)
      .attr("cy", function(d,i){ return 30 + i*25})
      .attr("r", 5)
      .style("fill", function(d){ return color(d)});

    // add name of disease next to each circle
    var legendtext = legend.selectAll("mylabels")
    .data(res)
    .enter()
    .append("text")
      .attr("font-family", "sans-serif")
      .attr("x", 10)
      .attr("y", function(d,i){ return 30 + i*25}) 
      .style("fill", function(d){ return color(d)})
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");

    

    // initialize tooltip for line chart data
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-2, 0])
      .html(function(d) {
          return (`<h6>${d.key}</h6>`)});

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



/* HORIZONTAL BAR CHART  */

    // bar svg height and width
    var svgbHeight = 500;
    var svgbWidth = 700;

    // bar chart margins
    var chartMargin = {
      top: 50,
      right: 50,
      bottom: 50,
      left: 180
    };

    // bar chart height and width
    var chartWidth = svgbWidth - chartMargin.left - chartMargin.right;
    var chartHeight = svgbHeight - chartMargin.top - chartMargin.bottom;

    // add bar chart svg to bar div
    var svgbar = d3.select("#bar")
      .append("svg")
      .attr("align","right")
        .attr("height", svgbHeight)
        .attr("width", svgbWidth)
        .append("g")
        .attr("transform", `translate(${chartMargin.left}, 0)`);

    // set y scale
    var yBandScale = d3.scaleBand()
      .domain(nested_max.map(d => d.key))
      .range([chartHeight, 30])
      .padding(0.1);

    // set x scale
    var xLinearScale = d3.scaleLinear()
      .domain([0, d3.max(nested_max, d => d.value.total_infection)])
      .range([0,chartWidth]);

    // set x and y axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yBandScale).tickFormat((d,i) => nested_max.map(d => `${d.key.substring(0,Array.from(d.key).lastIndexOf(" "))} ${d.key.substring(1+Array.from(d.key).lastIndexOf(" "))}`)[i]);

    // function to make longer tick labels wrapped
    function shorten(text){
      text.each(function(){
        var t = d3.select(this).html();
        var first = (t === " Zoonoses") ? "Zoonoses" : t.substring(0,Array.from(t).lastIndexOf(" "));
        var second = (t === " Zoonoses") ? "": t.substring(1+Array.from(t).lastIndexOf(" "));
        var y = (t === " Zoonoses") ? 0: -9;
        d3.select(this).text(null).append('tspan').attr("x",-10).attr("y",y).text(first)
        d3.select(this).append('tspan').attr("x",-10).attr("y",9).text(second)      
      })
    };

    // append both axis to chart
    svgbar.append("g")
    .attr("class", "labels")
    .call(leftAxis)
    .selectAll(".tick text")
    .call(shorten);
    
    svgbar.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .attr("class", "scale")
    .call(bottomAxis);

    // plot each bar from total infection rates
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

      // y axis label
      svgbar.attr("text-anchor", "middle")
      .attr("font-size",14)
      .attr("fill","black")
      .append("text")
      .attr("y", 450)
      .attr("x", 250)
      .attr("id","xs")
      .text("Infection Rate per 100,000 Population")

    // initialise bar tooltip
    var bartoolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0,50])
    .html(function(d) {
        return (`<h6>${d.key}</h6><h6>Total Infection Rate:   ${Math.round(d.value.total_infection)}</h6>`)});

    // add tooltip to barchart
    bargroup.call(bartoolTip);

    // on mouseover show tip
    bargroup.on("mouseover", function(d) {
              bartoolTip.show(d, this)
            })

            // on mouseout hide tip
            .on("mouseout", function(d) {
              bartoolTip.hide(d)
            });


/*  STACKED BAR CHART  */

    // set margins and widths of stacked bar svg
    var marginsb = {top: 10, right: 30, bottom: 30, left: 80},
        widthsb = 480 - marginsb.left - marginsb.right,
        heightsb = 400 - marginsb.top - marginsb.bottom;

    // append the svg to stacked bar div
    var svgsb = d3.select("#stackedbar")
      .append("svg")
        .attr("width", widthsb + marginsb.left + marginsb.right)
        .attr("height", heightsb + marginsb.top + marginsb.bottom)
      .append("g")
        .attr("transform",
              "translate(" + marginsb.left + "," + marginsb.top + ")");

    // flatten the nested data 
    var flatten = [];
    nestedyeargroup.forEach(function(d) {
        var obj = { Location: d.key }
            d.values.forEach(function(f) {
                obj[f.key] = f.value;
            });
        flatten.push(obj);
      });

    // Add scale axis
    var xsb = d3.scaleBand()
        .domain(flatten.map(function(d) {return d.Location}))
        .range([0, widthsb])
        .padding([0.2]);

    // add x axis to chart area
    svgsb.append("g")
    .attr("transform", "translate(0," + heightsb + ")")
    .attr("class","xsbaxis")
    .call(d3.axisBottom(xsb).tickSizeOuter(0));
    
    // stack the flattened data on disease groupings
    var stackedData = d3.stack()
      .keys(allGroups)
      (flatten);

    // get max total infection rate for domain of y axid
    var total = d3.max(stackedData[7].map(d => d[1]));

    // add y scale
    var ysb = d3.scaleLinear()
      .domain([0, total])
      .range([heightsb, 0 ]);
    
    // add y axis to chart area
    svgsb.append("g")
    .attr("class","ysbaxis")
    .call(d3.axisLeft(ysb));

    // create colour scale based on groups
    var colorsb = d3.scaleOrdinal()
      .domain(allGroups)
      .range(d3.schemeDark2);

    // mouseover function to highlight all bars within group
    var mouseoversb = function(d) {
    
      // change opacity of all rectangles to dim
      svgsb.selectAll("rect").style("opacity",0.2);

      // change opacity of selected group rectangles to hightlight
      d3.select(this.parentNode).selectAll("rect").style("opacity", 1);

    };

    // return to original opacitiy on mousout
    var mouseleavesb = function(d) {
      d3.selectAll("rect")
        .style("opacity",0.8);
      };

    // nested loop to append group for each disease group then bars for each location
    var stackedbar = svgsb.append("g")
      .selectAll("g")
      .data(stackedData)
      .enter().append("g")
        .attr("fill", function(d) { return colorsb(d.key); })
        .attr("class", function(d){ return "myRect " + d.key }) 
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
        .on("mouseleave", mouseleavesb);

      // y axis label
        svgsb.attr("text-anchor", "middle")
        .attr("font-size",14)
        .attr("fill","black")
        .append("text")
        .attr("y", -50)
        .attr("x", -190)
        .attr("transform","rotate(-90)")
        .attr("id","xs")
        .text("Infection Rate per 100,000 Population")

      // append legend svg to stacked bar div
      var legendsb = d3.select("#stackedbar")
      .append("svg")
        .attr("width", 350)
        .attr("height", heightsb + marginsb.top + marginsb.bottom)
      .append("g")
        .attr("transform",
              "translate(" + marginsb.left + "," + marginsb.top + ")");
    
      // add circle for each group      
      legendsb.selectAll("sbsq")
      .data(allGroups)
      .enter()
      .append("circle")
        .attr("cx", 0)
        .attr("cy", function(d,i){ return 30 + i*25})
        .attr("r", 5)
        .style("fill", function(d){ return colorsb(d)});
    
      // add group name against each circle
      legendsb.selectAll("sblabels")
      .data(allGroups)
      .enter()
      .append("text")
        .attr("font-family", "sans-serif")
        .attr("x", 15)
        .attr("y", function(d,i){ return 30 + i*25}) 
        .style("fill", function(d){ return colorsb(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");


/*  EVENT LISTENER TO CHANGE CHART FILTER OPTIONS  */

            
    // on group option selected change option value and run update
    d3.select("#selectButton").on("change", function(d) {   
      groupoption = d3.select(this).property("value")
      updateCharts()
      });

    // on year option selected change option value and run update
    d3.select("#selectYear").on("change", function(d) {
      yearoption = d3.select(this).property("value")
      updateCharts()
      });


/*  UPDATE CHART FUNCTION   */

    function updateCharts() {

      // data filtered by location  
      var newlocation = apidata.filter(d=>d.Location===locationoption).filter(function(d) { return d.Location !="Aust" && d.Location !="Last 5yearsmean" });

      // data filtered by disease group and location
      var newdata = newlocation.filter(function(d) { return d.Disease_Group===groupoption});
      
      // year and location filtered data nested by disease group and rolled up to sum total infection rate
      var newnested_max = d3.nest()
      .key(function(d) { return d.Disease_Group; })
      .rollup(function(leaves) { return {"total_infection": d3.sum(leaves, function(d) {return d.Infection_Rate})} })
      .entries(newlocation.filter(d=>d.Year===+yearoption));

      // data filtered by year only
      var newyearfiltered = apidata.filter(function(d) { return d.Year===+yearoption}).filter(function(d) { return d.Location !="Aust" && d.Location !="Last 5yearsmean" });
      
      // year filtered data nested by location and disease group rolled up to sum total infection rate
      var newnestedyeargroup = d3.nest().key(d=>d.Location).key(d=>d.Disease_Group).rollup(function(leaves) {return d3.sum(leaves, d => d.Infection_Rate)}).entries(newyearfiltered);


  /*   UPDATE STACKED BAR CHART    */
  
      // flatten data
      var newflatten = [];
      newnestedyeargroup.forEach(function(d) {
        var obj = { Location: d.key }
        d.values.forEach(function(f) {
            obj[f.key] = f.value;  
        });
        newflatten.push(obj);
      });


      // stack flattened data by disease groups
      var newstackedData = d3.stack()
        .keys(allGroups)
        (newflatten);

      // get max of total for domain
      var newtotal = d3.max(newstackedData[7].map(d => d[1]));

      // change y scale
      ysb
      .domain([0, newtotal])
      .range([heightsb, 0 ]);

      // change y axis
      svgsb.select(".ysbaxis")
      .transition()
      .duration(1000)
      .call(d3.axisLeft(ysb));

      // remove grouped bars from chart
      svgsb.selectAll("g").filter(function() {
        return this.classList.contains('myRect')}).remove();

      // create new groups and bars with new data
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
        .on("mouseleave", mouseleavesb);


    /*     UPDATE LINE CHART    */

      // nest data filtred by disease group on disease name
      var newnestedbydisease = d3.nest() 
        .key(function(d) { return d.Disease;})
        .entries(newdata);

      // filter by location, group and year for each state 
      var newmaxgroupperstate = stateabbr.map(state => d3.sum(apidata
      .filter(function(d) { return d.Disease_Group===groupoption}).filter(function(d) { return d.Location===state}).filter(d=>d.Year===+yearoption).filter(function(d) { return d.Location !="Aust" && d.Location !="Last 5yearsmean" }).map(d => d.Infection_Rate)));

      // change colour scale for each state
      myColour = d3.scaleSequential().domain(d3.extent(newmaxgroupperstate)).interpolator(d3.interpolateReds);

      // change y scale
      yline.domain([0, d3.max(newdata, function(d) { return +d.Infection_Rate })])
      .range([heightline,0]);

      // change x scale
      xline
      .domain(d3.extent(newdata, function(d) { return d.Year; }))
      .range([ 0, widthline ]);

      // update x axis
      svgline.select(".xaxis")
      .transition()
      .duration(1000)
      .call(xlineAxis);
    
      // update y axis
      svgline.select(".yaxis")
      .transition()
      .duration(1000)
      .call(ylineAxis);

      // update list of diseases
      var newres = newnestedbydisease.map(function(d){ return d.key });

      // update colour scale based on new list
      var newcolor = d3.scaleOrdinal()
        .domain(newres)
        .range(d3.schemeDark2);

      // bind new data to path, filter domain so only chart lines are changed
      var newplot = svgline.selectAll("path").filter(function() {
        return !this.classList.contains('domain')
      }).data(newnestedbydisease);

      // merge plot and update lines
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

      // remove excess points
      newplot.exit().remove();


  /*     UPDATE MAP CHART       */

      // update colours
      myColour = d3.scaleSequential().domain(d3.extent(newmaxgroupperstate)).interpolator(d3.interpolateReds);

      // update colours on chart
      mapchart.data(data.features)
        .attr("fill", function(d,i) {return myColour(newmaxgroupperstate[i])});


      // sort range for legend
      var newmax = (d3.max(newmaxgroupperstate) > 100) ? Math.floor(d3.max(newmaxgroupperstate)/10)*10 : d3.max(newmaxgroupperstate);
      var newmin = (d3.min(newmaxgroupperstate) > 100) ? Math.ceil(d3.min(newmaxgroupperstate)/10)*10 : d3.min(newmaxgroupperstate);
      var newsteps = (newmax === 0)? 0 : ((newmax-newmin)>20) ? Math.floor((newmax-newmin)/4/10)*10: 1;
      var newrange = ((newmax-3*newsteps)>newmin) ? [newmax, newmax-newsteps,newmax-2*newsteps,newmax-3*newsteps,newmin] : [newmax, newmax-newsteps,newmax-2*newsteps,newmax-3*newsteps,newsteps] ;
      
      var newlegendmap = legendmap.selectAll("rect").data(newrange);

      // add square for each infection rate band
      newlegendmap
      .enter()
      .append("rect")
      .merge(newlegendmap)
        .attr("x", 0)
        .attr("y", function(d,i){ return 60 + i*20})
        .attr("width", 20)
        .attr("height",20)
        .attr("stroke","gray")
        .style("fill", function(d){return myColour(d)});

      var newtext = legendmap.selectAll("text").data(newrange)

      // add name range next to each square
      newtext
      .enter()
      .append("text")
      .merge(newtext)
        .attr("class","maplabels")
        .attr("font-family", "sans-serif")
        .attr("x", 25)
        .attr("y", function(d,i){ return 70 + i*20}) 
        .text(function(d,i){ return (i >0 && i<4) ? Math.round(newrange[i]) + " - " + Math.round(newrange[i+1]) : (i <4 ) ? ">"+Math.round(newrange[i+1]) : "<"+Math.round(newrange[i]) })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

        // update tooltip data
        maptoolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([0, 0])
        .html(d => { i = data.features.map(d => d.properties.STATE_NAME).indexOf(d.properties.STATE_NAME)
              return (`<h6>${d.properties.STATE_NAME}</h6><h6>${groupoption}</h6><h6>Total Infection Rate:  ${Math.round(newmaxgroupperstate[i])}</h6>`)});
    
        // add tooltip to map
        mapchart.call(maptoolTip);


  /*     UPDATE BAR CHART      */

      // update x scale
      xLinearScale.domain([0, d3.max(newnested_max, function(d) { return d.value.total_infection; })])
        .range([0,chartWidth]);

      // update x axis
      svgbar.select(".scale")
        .transition()
        .duration(1000)
        .call(bottomAxis);


      // update bars
      bargroup.data(newnested_max)
          .transition()
          .duration(1000)
          .attr("width", d => xLinearScale(d.value.total_infection))
          .attr("y", d => yBandScale(d.key))
          .attr("height", yBandScale.bandwidth());

      // bind new text data to legend
      var newlegend = legend.selectAll('text').data(newres);

      // update legend text with new data
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

      // bind legend circles with new data
      var newdots = legend.selectAll('circle').data(newres)

      // update circles
      newdots
      .enter()
      .append("circle")
        .merge(newdots)
        .transition()
        .duration(1000)
        .attr("cx", 0)
        .attr("cy", function(d,i){ return i*25})
        .attr("r", 5)
        .style("fill", function(d){ return newcolor(d)});
    
    
      // remove excess items
      newlegend
        .exit()
        .remove();
      newdots
        .exit()
        .remove();

      //update summarys
      d3.select("#mapsummary").html(`Total Infection Rates per 100,000 population for ${groupoption} in ${yearoption}`)
      d3.select("#barsummary").html(`Disease Group Infection Ratesper 100,000 population for ${locationoption} in ${yearoption}`)
      d3.select("#linesummary").html(`Infection Rates per 100,000 population for ${groupoption} in ${locationoption} between 2015 and 2020`)
      d3.select("#sbsummary").html(`Disease Group Infection Rates per 100,000 population in all States in ${yearoption}`)
      


// end of update chart function
}

// end of geojson data
})

// end of api data
})





 
