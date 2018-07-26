var data   = scores;
var radius = 10;
var middle = 250;
// brush1 and brush2 will store the extents of the brushes,
// if brushes exist respectively on scatterplot 1 and 2.
//
// if either brush does not exist, brush1 and brush2 will
// hold the null value.

var brush1 = null;
var brush2 = null;
function setInfo(d) {
    document.getElementById("table-SATM").innerHTML = " "+d.SATM;
    document.getElementById("table-SATV").innerHTML = " "+d.SATV;
    document.getElementById("table-ACT").innerHTML = " "+d.ACT;
    document.getElementById("table-GPA").innerHTML = " "+d.GPA;
    d3.select("body").selectAll("circle").attr("fill","black");
}

function makeScatterplot(sel, graph)
{
    document.getElementById("demo").innerHTML;
    var svg = sel
            .append("svg")
            .attr("width", 500).attr("height", 500);

    var xScale;
    var yScale;
    if (graph == "G1") {
            xScale = d3.scaleLinear().range([0,490]).domain([300,800]);
            yScale = d3.scaleLinear().range([0,490]).domain([300,800]);
    } else {
        xScale = d3.scaleLinear().range([0,490]).domain([1,36]);
        yScale = d3.scaleLinear().range([0,490]).domain([1,4]);
    }
    var brush = d3.brush();

    svg.append("g")
        .attr("class", "brush")
        .call(brush);
    
    // this *must* be done *after* adding the brush group. 
    var newSvg = svg.append("g")
        .selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx",function(d) { 
            if (graph == "G1")
                return xScale(d.SATM);
            else
                return xScale(d.ACT); })
        .attr("cy",function(d) { 
            if (graph == "G1")
                return yScale(d.SATV);
            else
                return yScale(d.GPA); })
        .attr("r",radius)
        .attr("fill","black")
        .on("click",function(d) { setInfo(d);  });

    var xAxis; // create an axis object for the x axis
    var yAxis; // create an axis object for the y axis

    return {
        svg: svg,
        brush: brush,
        xScale: xScale,
        yScale: yScale
    };
}

//////////////////////////////////////////////////////////////////////////////

plot1 = makeScatterplot(d3.select("#scatterplot_1"),"G1");
plot2 = makeScatterplot(d3.select("#scatterplot_2"),"G2");

//////////////////////////////////////////////////////////////////////////////

function onBrush() {
    var allCircles = d3.select("body").selectAll("circle");
    if (brush1 === null && brush2 === null) {
        allCircles.attr("fill","black");
        return;
    }
    
    var sum_SATV = 0, sum_SATM = 0, sum_ACT = 0, sum_GPA = 0;
    var numSelected_1 = 1, numSelected_2 = 1;
    function isSelected(d) {
        
            if ((brush1 != null) && (d.SATV > plot1.yScale.invert(brush1[0][1]) && d.SATV < plot1.yScale.invert(brush1[1][1]))
                &&  (d.SATM > plot1.xScale.invert(brush1[0][0]) && d.SATM < plot1.xScale.invert(brush1[1][0]))){
                sum_SATV += d.SATV;
                sum_SATM += d.SATM;
                sum_ACT += d.ACT;
                sum_GPA += d.GPA;
                numSelected_1 += 1;
                numSelected_2 += 1;
                return true;
            }
            if ((brush2 != null) && (d.ACT > plot2.xScale.invert(brush2[0][0]) && d.ACT < plot2.xScale.invert(brush2[1][0])) 
                && (d.GPA > plot2.yScale.invert(brush2[0][1]) && d.GPA < plot2.yScale.invert(brush2[1][1]))) {
                sum_ACT += d.ACT;
                sum_GPA += d.GPA;
                sum_SATM += d.SATM;
                sum_SATV += d.SATV;
                numSelected_2 += 1;
                numSelected_1 += 1;
                return true;
            }
            return false;
    
    }

    var selected = allCircles
            .filter(isSelected)
            .attr("fill", "red");
    var notSelected = allCircles
            .filter(function(d) { return !isSelected(d); })
            .attr("fill", "lightgray");


    document.getElementById("table-SATM").innerHTML = " "+ Math.round(sum_SATM/numSelected_1);
    document.getElementById("table-SATV").innerHTML = " "+ Math.round(sum_SATV/numSelected_1);
    document.getElementById("table-ACT").innerHTML = " "+ Math.round(sum_ACT/numSelected_2);
    document.getElementById("table-GPA").innerHTML = " "+ (sum_GPA/numSelected_2).toFixed(3);
    
}

//////////////////////////////////////////////////////////////////////////////
//
// d3 brush selection
//
// The "selection" of a brush is the range of values in either of the
// dimensions that an existing brush corresponds to. The brush selection
// is available in the d3.event.selection object.
// 
//   e = d3.event.selection
//   e[0][0] is the minimum value in the x axis of the brush
//   e[1][0] is the maximum value in the x axis of the brush
//   e[0][1] is the minimum value in the y axis of the brush
//   e[1][1] is the maximum value in the y axis of the brush
//
// The most important thing to know about the brush selection is that
// it stores values in *PIXEL UNITS*. Your logic for highlighting
// points, however, is not based on pixel units: it's based on data
// units.
//
// In order to convert between the two of them, remember that you have
// the d3 scales you created with the makeScatterplot function above.
// The final thing you need to know is that d3 scales have a function
// to *invert* a mapping: if you create a scale like this:
//
//  s = d3.scaleLinear().domain([5, 10]).range([0, 100])
//
// then s(7.5) === 50, and s.invert(50) === 7.5. In other words, the
// scale object has a method invert(), which converts a value in the
// range to a value in the domain. This is exactly what you will need
// to use in order to convert pixel units back to data units.

function updateBrush1() {
    brush1 = d3.event.selection;
    onBrush();
}

function updateBrush2() {
    brush2 = d3.event.selection;
    onBrush();
}

plot1.brush
    .on("brush", updateBrush1)
    .on("end", updateBrush1);

plot2.brush
    .on("brush", updateBrush2)
    .on("end", updateBrush2);
