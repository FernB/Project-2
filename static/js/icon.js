
// <svg width="12cm" height="4cm">

//   <rect x="1" y="1" width="1198" height="398"
//         fill="none" stroke="blue" stroke-width="2"/>

//   <rect x="100" y="100" width="400" height="200" rx="50"
//         fill="green" />

//   <g transform="translate(700 210) rotate(-30)">
//     <rect x="0" y="0" width="400" height="200" rx="50"
//           fill="none" stroke="purple" stroke-width="30" />
//   </g>
// </svg>


var iconshape = d3.selectAll("#icon")
.append("svg")
  .attr("width", 150)
  .attr("height", 150)
.append("g")
.attr("transform","translate(10 100) rotate(-45)")
.append("rect")
.attr("x",20)
.attr('y',-20)
.attr("width",70)
.attr("height",70)
.attr("fill","#fa9fb5")







