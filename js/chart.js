async function plotChart() {
    let data =  await d3.csv('Processing/chart.csv').then(data => {
        data.forEach(d => {
            d.Population = Number(d.Population)
            d.GDPpc = Number(d.GDPpc)
            d.total_vaccinations_per_hundred = Number(d.total_vaccinations_per_hundred)
        })

        return data
    })

    const filteredData = data.filter(d => {
        return d.location !== 'World'
    }).filter(d => {
        return d.location !== 'Upper middle income'
    }).filter(d => {
        return d.location !== 'Lower middle income'
    }).filter(d => {
        return d.location !== 'Low income'
    }).filter(d => {
        return d.location !== 'High income'
    }).filter(d => {
        return d.location !== 'European Union'
    }).filter(d => {
        return d.location !== 'North America'
    }).filter(d => {
        return d.location !== 'South America'
    }).filter(d => {
        return d.location !== 'Gibraltar'
    }).filter(d => {
        return d.location !== 'British Virgin Islands'
    })

    console.log(filteredData[0])

    // Create accessor function 
    const xAccessor = d => d.total_vaccinations_per_hundred
    const yAccessor = d => d.GDPpc
    const sizeAccessor = d => d.Population

    // Set dimensions
    const width = 750 //d3.min([window.innerWidth * 0.8, window.innerHeight * 0.8])
    const dimensions = {
        width, 
        height: width ,
        margins: {
            top: 60, 
            right: 30, 
            left: 40,
            bottom: 40
        }
    }

    dimensions.boundedWidth = dimensions.width 
        - dimensions.margins.left
        - dimensions.margins.right
    dimensions.boundedHeight = dimensions.height
        - dimensions.margins.top
        - dimensions.margins.bottom


    // Create wrapper 
    const wrapper = d3.select("#chart").append('svg')
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    // Create bounds
    const bounds  = wrapper.append('g')
        .style("transform", `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`)

    // Create scales
    const xScale = d3.scaleLog()
        .domain(d3.extent(filteredData, xAccessor))
        .range([0, dimensions.boundedWidth])
        .base(10)
        

    const yScale = d3.scaleLog()
        .domain([100, d3.max(filteredData, yAccessor)])
        .range([dimensions.boundedHeight, 0])
        .base(10)
        
    
    const area = d3.scaleLinear()
        .domain(d3.extent(data, sizeAccessor))
        .range([15 * Math.PI, 1000 * Math.PI])
    // #ffa97e, '#9eb7c8'

    const contcolor = d3.scaleOrdinal()
        .domain(filteredData.map( d => d.IncomeGroup))
        .range(['#315873','#b1b2b7', '#c29174', '#648C6C'])

    const chartTip = d3.tip()   
        .attr("class", "d3-tip")
        .html(d => {
            return `<p id="geo">${d.location}</p><p id="income">${d.IncomeGroup}</p><p class="figures">Vaccinations per 100 people:&nbsp;&nbsp;&nbsp;<strong>${d.total_vaccinations_per_hundred}</strong></p><p class="figures">GDP per capita:&nbsp;&nbsp;&nbsp;<strong>$${Math.trunc(d.GDPpc)}</strong></p>`})
    bounds.call(chartTip)

    // Draw data
    const circles = bounds.selectAll('circle')
        .data(filteredData)

    circles.exit().remove()

    circles.enter()
        .append("circle")
        .attr("class", "circles")
        .attr("cx",d => xScale(xAccessor(d)))
        .attr("cy", d => yScale(yAccessor(d)))
        .attr("r", d => Math.sqrt(2 * area(sizeAccessor(d)) / Math.PI))
        .attr("opacity", "0.7")
        .attr("fill", d => contcolor(d.IncomeGroup))
        .on("mouseover", chartTip.show)
        .on("mouseleave", chartTip.hide)

    
    
    const countries = ['United States', 'China', "Burkina Faso", 'India', 
        'Nigeria', "Malawi", "Zambia", "Togo", "Monaco", "Somalia", "Australia",  "Lesotho", "Japan", "United Kingdom", "Gabon", "Thailand"]

    const labels = bounds.selectAll('text')
            .data(filteredData)

    labels.enter().append("text")
            .attr("class", "labels")
            .attr("x", d => {
                if (d.location == "United States") {
                    return xScale(xAccessor(d)) + 30
                } else if (d.location == "China") {
                    return xScale(xAccessor(d)) + 42
                }else if (d.location == "United Kingdom") {
                    return xScale(xAccessor(d)) + 20
                } else {
                    return xScale(xAccessor(d))
                }
            })
            .attr("y", d => {
                if (d.location == "India") {
                    return yScale(yAccessor(d)) - 24
                } else if (d.location == "Togo") {
                    return yScale(yAccessor(d)) + 18
                } else if (d.location == "Japan") {
                    return yScale(yAccessor(d)) + 19
                } else if (d.location == "United Kingdom") {
                    return yScale(yAccessor(d)) + 19
                }else if (d.location == "Malawi") {
                    return yScale(yAccessor(d)) + 20
                } else if (d.location == "Nigeria") {
                    return yScale(yAccessor(d)) - 14
                }else if (d.location == "United States") {
                    return yScale(yAccessor(d)) + 4
                } else if (d.location == "Lesotho") {
                    return yScale(yAccessor(d)) - 10
                }else if (d.location == "China") {
                    return yScale(yAccessor(d)) +  20
                } else {
                    return yScale(yAccessor(d)) - 12
                }
            })
            .attr("text-anchor", 'middle')
            .attr("opacity", "1")
            .attr("fill", d3.rgb(80, 80, 80))
            .attr("font-weight", "400")
            .text(d => {
                if (d.location == "United Kingdom") {
                    return "UK"
                } else if (d.location == "United States"){
                    return "US"
                } else {
                    return countries.includes(d.location) ? d.location : ""
                }
            })


    const lines = bounds.selectAll("line")
            .data(filteredData)
    
    lines.enter().append("line")
        .attr("opacity", "0.5")
        .attr("stroke", d3.rgb(80, 80, 80))
        .attr("x1", d => {
            if (d.location === "China") {
                return xScale(xAccessor(d))
            } else if (d.location == 'United States') {
                return xScale(xAccessor(d)) -3
            } else if (d.location == 'United Kingdom') {
                return xScale(xAccessor(d))
            }
        })
        .attr("y1", d => {
            if (d.location === "China") {
                return yScale(d.GDPpc)
            } else if (d.location == 'United States') {
                return yScale(d.GDPpc)
            } else if (d.location == 'United Kingdom') {
                return yScale(yAccessor(d))
            }
        })
        .attr("x2", d => {
            if (d.location === "China") {
                return xScale(xAccessor(d)) + 25
            } else if (d.location == 'United States') {
                return xScale(xAccessor(d)) + 20
            } else if (d.location == 'United Kingdom') {
                return xScale(xAccessor(d)) + 10
            }
        })
        .attr("y2",d => {
            if (d.location === "China") {
                return yScale(yAccessor(d)) +  15
            } else if (d.location == 'United States') {
                return yScale(yAccessor(d)) 
            } else if (d.location == 'United Kingdom') {
                return yScale(yAccessor(d)) + 15
            }
        })
        .attr("stroke", "black")

    

    
    // Create axes
    const xAxisGenerator = d3.axisBottom(xScale)
        // .tickSize(-dimensions.boundedHeight + yScale(100000))
        .tickValues([0.1, 1, 10, 100])
        // .tickFormat(d3.format(".3"))
        .tickArguments([5,".3"])
        .tickSizeOuter(0)
        
    const xAxis = bounds.append('g')
        .attr("class", "axis")
        .style("transform", `translateY(${dimensions.boundedHeight}px)`)
        .call(xAxisGenerator)

    // x axis labels
    const xLabel = xAxis.append("text")
        .attr("x", dimensions.boundedWidth)
        .attr("y", 30)
        .attr("fill", "black")
        .attr("font-size", "12px")
        .attr("text-anchor", "end")
        .text("Vaccinations per 100 people")

    

    const yAxisGenerator = d3.axisLeft(yScale)
        // .tickSize(-dimensions.boundedWidth)
        .tickArguments([5,".1s"])
        .tickValues([1000, 10000, 100000])
        .tickSizeOuter(0)

    const yAxis = bounds.append('g')
        .attr("class", "axis")
        .call(yAxisGenerator)

        // y axis label
    const yLabel = yAxis.append("text")
        .attr("x", -40)
        .attr("y", -10)
        .attr("fill", "black")
        .attr("font-size", "12px")
        .attr("text-anchor", "start")
        .text("GDP per capita ($)")


    // Create legend
    console.log(_.uniq(filteredData.map(d => d.IncomeGroup)))

    const income = ["Low", "Lower middle", "Upper middle", "High"]

    
            
}

plotChart()