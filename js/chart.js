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
            top: 10, 
            right: 10, 
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
            return `<p class="geo-name">${d.location}</p><p>${d.GDPpc}</p><p>${d.total_vaccinations_per_hundred}</p><p>${d.IncomeGroup}</p>`})
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

    // const countries = ['United States', 'China', "Burkina Faso", 'India']

    // const labels = bounds.selectAll('text')
    //         .data(filteredData)

    // labels.enter().append("text")
    //         .attr("x", d => xScale(xAccessor(d)))
    //         .attr("y", d => yScale(yAccessor(d)) -18)
    //         .attr("text-anchor", 'middle')
    //         .text(d => countries.includes(d.location) ? d.location : "")
    
    // const lines = bounds.selectAll('rect')
    //         .data(filteredData)

    // lines.enter().append('rect')
    //         .attr("x", d => xScale(xAccessor(d)))
    //         .attr("y", d => yScale(yAccessor(d)) -30)
    //         .attr("height", d => {
    //             if (countries.includes(d.location)) {
    //                 if (d.Population > 1000000000) {
    //                     return "30px"
    //                 } else {
    //                     return "15px"
    //                 }
                
    //         } else {
    //             return "0px"
    //         }})
    //         .attr("width", "1px")
    //         .attr("stoke", "black")



    const xAxisGenerator = d3.axisBottom(xScale)
        // .tickSize(0)
        .tickValues([0.1, 1, 10, 100])
        // .tickFormat(d3.format(".3"))
        .tickArguments([5,".3"])
        .tickSizeOuter(0)
        
        
    const xAxis = bounds.append('g')
        .style("transform", `translateY(${dimensions.boundedHeight}px)`)
        .call(xAxisGenerator)
           

    const yAxisGenerator = d3.axisLeft(yScale)
        // .tickSize(0)
        .tickArguments([5,".1s"])
        .tickValues([1000, 10000, 100000])
        .tickSizeOuter(0)
    const yAxis = bounds.append('g')
        .call(yAxisGenerator)
            
}

plotChart()