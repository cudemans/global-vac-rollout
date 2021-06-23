async function plotLine() {

    const data = await d3.csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv')

    console.log(data)

    // Define time parser
    const dateParser = d3.timeParse("%Y-%m-%d")

    // Define accessor functions
    const xAccessor = d => dateParser(d.date)
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

    // Create nested data
    const nest = d3.nest()
        .key(d => d.location)
        .entries(data)

    const lineGenerator = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yAccessor(yAccessor(d)))

    const paths = bounded.selectAll("path")
        .data(nest)

    paths.exit().remove()

    // paths.enter().append("path")
    //     .attr("d", d => lineGenerator(d.values))



   

    console.log(nest)
}

plotLine()