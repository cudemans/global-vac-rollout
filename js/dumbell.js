async function drawDumbell() {
    const data = await d3.csv("./Processing/chart.csv")

    console.log(data)

    const groups = ["Low income", "Lower middle income", "Upper middle income", "High income"]
    
    // Get total vaccinations for income groups
    const getTotalVacs = (group) => {
        const area = data.filter(d => {
            return d.location == group
        })
        return Number(area[0].total_vaccinations)
    }

    const totalVac =[]
    for (let i = 0; i < groups.length; i++) {
        totalVac.push(getTotalVacs(groups[i]))
    }

   // Get total populations for income groups 
    const totalPop = []
    const getTotalPop = (group) => {
        const area = data.filter(d => {
            return d.location == group
        })
        return Number(area[0].Population)
    }
    for (let i = 0; i < groups.length; i++) {
        totalPop.push(getTotalPop(groups[i]))
    }
   
    // Get world info
    // Population
    const world = data.filter(d => {
        return d.location == "World"
    })

    const worldPop = Number(world[0].Population)
    const worldVac = Number(world[0].total_vaccinations)

    // Proportions
    const vacProp = totalVac.map(d => {
        return d / worldVac * 100
    })

    const popProp = totalPop.map(d => {
        return Math.trunc(d / worldPop * 100)
    })

    const highIncome  = data.filter(d => {
        return d.IncomeGroup == 'High'
    })

    const highFiltered = highIncome.filter(d => {
        return d.location == "United Arab Emirates" || 
        d.location == "Canada" ||
        d.location == "Germany" ||
        d.location == "United States" ||
        d.location == "United Kingdom" ||
        d.location == "Singapore" ||
        d.location == "Italy" ||
        d.location == "Netherlands" ||
        d.location == "Spain" ||
        d.location == "France" ||
        d.location == "Israel"
 
    })

    const lowIncome = data.filter(d => d.IncomeGroup == 'Low')
    console.log(lowIncome)
    
    
    const lowFiltered = lowIncome.filter(d => {
        return d.location !== "Tajikistan" && 
        d.location !== "Togo" &&
        d.location !== "South Sudan" &&
        d.location !== "South Sudan" &&
        d.location !== "Guinea-Bissau" &&
        d.location !== "Guinea" &&
        d.location !== "Ethiopia" &&
        d.location !== "Malawi" &&
        d.location !== "Rwanda" &&
        d.location !== "Niger" &&
        d.location !== "Liberia"
    })
   const lowHigh = _.concat(lowFiltered, highFiltered)

   lowHigh.forEach(d => {
       d.GDPpc = +d.GDPpc
       d.Population = +d.Population
       d.total_vaccinations = +d.total_vaccinations
       return d
   })
   console.log(lowHigh)

   // --------------------------------

   // Define dimensions
   const width = 800
   const dimensions ={
       width,
       height: 600,
       margins: {
           top: 30,
           right: 10,
           left: 130,
           bottom: 40
       }
   }
    dimensions.boundedWidth = dimensions.width
        - dimensions.margins.left
        - dimensions.margins.right
    dimensions.boundedHeight = dimensions.height
        - dimensions.margins.top
        - dimensions.margins.bottom


    const wrapper = d3.select("#dumbbell").append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    const bounds = wrapper.append("g")
        .style("transform", `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`)

    const shadedBlock = bounds.append('rect')
        .attr("x", 0)
        .attr("y", dimensions.boundedHeight - 255)
        .attr("width", dimensions.boundedWidth)
        .attr("height", 255)
        .attr("fill", "grey")
        .attr("opacity", 0.03)

    const xScale = d3.scaleLog()
        .domain([0.0001, 15])
        .range([0, dimensions.boundedWidth])
        // .base(10)
        .nice()

    const yScale = d3.scalePoint()
        .domain(lowHigh.map(d => d.location))
        .range([dimensions.boundedHeight, 0])
        .padding(1)

    const vacTip = d3.tip()
        .attr("class", "d3-tip")
        .html(d => d.total_vaccinations)    
    
    const dumbbellGroup = bounds.append("g")
        .attr("id", "dumbbellGroup");

   const dumbbell = dumbbellGroup.selectAll(".dumbbell")
        .data(lowHigh)
        .enter().append("g")
        .attr("class", "dumbbell")
        .attr("transform", function(d) { return "translate(0," + yScale(d.location) + ")"; });

    // lines between dots
    dumbbell.append("line")
        .attr("class", "line-between")
        .attr("x1", d => xScale(d.total_vaccinations / worldVac * 100))
        .attr("x2", d =>  xScale(d.Population / worldPop * 100))
        .attr("y1", 0)
        .attr("y2", 0)
        // .attr("stroke", "black")
        .attr("stroke", d => {
            if (xScale(d.total_vaccinations / worldVac * 100) > xScale(d.Population / worldPop * 100)) {
                return "#3d6e90"
            } else {
                return "#c29174"
            }
        })

    // lines: before dots
    dumbbell.append("line")
        .attr("class", "line-before")
        .attr("x1", 0)
        .attr("x2", d => xScale(d.total_vaccinations / worldVac * 100))
        .attr("y1", 0)
        .attr("y2", 0);

    // lines after dots
    dumbbell.append("line")
        .attr("class", "line-before")
        .attr("x1", d =>  xScale(d.Population / worldPop * 100))
        .attr("x2", dimensions.boundedWidth)
        .attr("y1", 0)
        .attr("y2", 0);
    
        
    // lines between dots
    dumbbell.append("line")
        .attr("class", "line-between")
        .attr("x1", d => xScale(d.total_vaccinations / worldVac * 100))
        .attr("x2", d =>  xScale(d.Population / worldPop * 100))
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", "black")
        // .attr("stroke", d => {
        //     if (xScale(d.total_vaccinations / worldVac * 100) > xScale(d.Population / worldPop * 100)) {
        //         return "#3d6e90"
        //     } else {
        //         return "#c29174"
        //     }
        // })

    // total vacs
    dumbbell.append("circle")
        .attr("class", "circle current")
        .attr("cx", d => xScale(d.total_vaccinations / worldVac * 100))
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", "#3d6e90")
        .on("mouseover", vacTip.show)
        

    // total population
    dumbbell.append("circle")
        .attr("class", "circle current")
        .attr("cx",  d =>  xScale(d.Population / worldPop * 100))
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", "#c29174")

    
    // Annotations
    const annotationsRight = [
        {
          note: {
            label: "Share of the world's vaccinations",
            // title: "Annotation title"
            
          },
          connector: {
            end: "arrow",        // none, or arrow or dot
            type: "curve",       // Line or curve
            points: 1,           // Number of break in the curve
            lineType : "none"
          },
          color: ["#3d6e90"],
          x: 500,
          y: 135,
          dy: 30,
          dx: 60
        }
      ]
      
      // Add annotation to the chart
      const makeAnnotationsRight = d3.annotation()
        .type(d3.annotationLabel)
        .annotations(annotationsRight)
        
      bounds
        .append("g")
        .attr("font-size", "12px")
        .call(makeAnnotationsRight)

        const annotationsLeft = [
            {
              note: {
                label: "Share of the world's population",
                // title: "Annotation title"
              },
              connector: {
                end: "arrow",        // none, or arrow or dot
                type: "curve",       // Line or curve
                points: 1,           // Number of break in the curve
                lineType : "none"
              },
              color: ["#c29174"],
              x: 305,
              y: 45,
              dy: 10,
              dx: -100
            }
          ]
          
          // Add annotation to the chart
          const makeAnnotationsLeft = d3.annotation()
            .annotations(annotationsLeft)
            .type(d3.annotationLabel)
          bounds
            .append("g")
            .attr("font-size", "12px")
            .call(makeAnnotationsLeft)
      
    // x Axis
    const xAxisGenerator = d3.axisBottom(xScale)
        .tickValues([0.001, 0.01, 0.1, 1, 10])
        .tickArguments([5, ".3"])
        .tickSizeOuter(0)
        
    const xAxis = bounds.append('g')
    .attr("class", "axis")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
        .call(xAxisGenerator)

    // x axis labels
    xAxis.append("text")
        .attr("x", dimensions.boundedWidth)
        .attr("y", 35)
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .text("Percentage of world")


    // y Axis
    const yAxisGenerator = d3.axisLeft(yScale)
        .tickSize(0)
        .tickPadding(10)

    const yAxis = bounds.append('g')
        .attr("class", "axis")
        .style("font-size", "11px")
        .call(yAxisGenerator)
        .call(g => g.select(".domain")
        .remove())

    // const divideLine = bounds.append("line")
    //       .attr("x1", 0)
    //       .attr("y1", 265)
    //       .attr("x2", dimensions.boundedWidth)
    //       .attr("y2", 265)
    //       .attr("stroke", "black")
    //       .style("stroke-width", "0.5px")
    //       .attr("stroke-dasharray", "5")
    
        

   // --------------------------------

    // Low income
    document.querySelector("#low-pop").textContent = `${popProp[0]}%`
    document.querySelector("#low-vac").textContent = `${vacProp[0].toFixed(2)}%`

    // High income
    document.querySelector("#high-pop").textContent = `${popProp[3]}%`
    document.querySelector("#high-vac").textContent = `${vacProp[3].toFixed(2)}%`
    console.log(`Proportion of vaccines: ${vacProp}`)
    console.log(` Proportion of world's pop: ${popProp}`)

   
}



drawDumbell()