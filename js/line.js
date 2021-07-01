async function plotLine() {

    const dateParser = d3.timeParse("%Y-%m-%d")

    let data = await d3.csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv').then(data => {
        data.forEach(d => {
            d.total_vaccinations_per_hundred = Number(d.total_vaccinations_per_hundred)
            d.people_vaccinated_per_hundred = Number(d.people_vaccinated_per_hundred)
            d.date = dateParser(d.date)

        })
        return data
    })

   
    const jsonData = await d3.json('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.json')
   
    
    // Define accessor functions
    const xAccessor = d => d.date
    const yAccessor = d => d.people_vaccinated_per_hundred

    const width = 800
    const dimensions = {
        width,
        height: width * 0.7,
        margins: {
            top: 10,
            right: 30,
            left: 10,
            bottom: 30
        }
    }

    dimensions.boundedWidth = dimensions.width 
        - dimensions.margins.left
        - dimensions.margins.right
    dimensions.boundedHeight = dimensions.height
        - dimensions.margins.bottom
        - dimensions.margins.top

    // Create wrapper and bounds
    const wrapper = d3.select("#line").append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    const bounded= wrapper.append("g")
        .style("translate", `transform(${dimensions.margins.left}px, ${dimensions.margins.top}px)`)

    // Create scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, xAccessor))
        .range([0, dimensions.boundedWidth])

        

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, yAccessor)])
        .range([dimensions.boundedHeight, 0])
    
    console.log(jsonData)

    // Create nested data
    const nest = d3.nest()
        .key(d => d.country)
        .entries(jsonData)

    console.log(nest)

    const lineGenerator = d3.line()
        .defined(d => d.people_vaccinated_per_hundred > 0)
        .x(d => xScale(d =>d.date))
        .y(d => yScale(d => d.people_vaccinated_per_hundred))

    const paths = bounded.selectAll("path")
        .data(nest)

    paths.exit().remove()

    paths.enter().append("path")
        .attr("d", d => lineGenerator(d.values))

   

   

  
}

plotLine()