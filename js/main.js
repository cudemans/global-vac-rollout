async function drawMap() {

    // Read in data
    const geoData = await d3.json('data/country-shapes.json')
    let parsedData = topojson.feature(geoData, geoData.objects.countries).features

    const jsonData = await d3.json('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.json')

    const countryVac = await d3.json('https://raw.githubusercontent.com/simprisms/global_vac_data/main/data/last_vac2.json')

    // Combine datasets
    for (let i = 0; i < countryVac.length; i++) {
        let location = countryVac[i].location

        for (let j = 0; j < parsedData.length; j++) {
            let country = parsedData[j].properties.name

            if (location == country) {
                parsedData[j] = Object.assign({}, parsedData[j], countryVac[i])
                break;
            }
        }
    }
    // Create accessor function
    const vacAccessor = d => d.total_vaccinations_per_hundred

    // Remove Antartica from data
    const newData = parsedData.filter(d => {
        return d.id !== "010"
    })


    // Set dimensions
    const width = window.innerWidth
    const dimensions = {
        width,
        height: width * 0.65,
        margins: {
            top: 0,
            bottom: 0,
            left: 10,
            right: 10
        }
    }

    dimensions.boundedWidth = dimensions.width
        - dimensions.margins.left
        - dimensions.margins.right
    dimensions.boundedHeight = dimensions.height
        - dimensions.margins.top
        - dimensions.margins.bottom


    // Define wrapper
    const wrapper = d3.select("#map").append("svg")
        // .attr("width", dimensions.width)
        // .attr("height", dimensions.height)
        .attr("viewBox", `0 0 ${dimensions.boundedWidth} ${dimensions.boundedHeight}`)

    // Define bounds
    const bounds = wrapper.append("g")
        .style("transform", `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`)

    // Create color scale
    const colors = d3.scaleLinear()
        .domain(d3.extent(newData, vacAccessor))
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb("#ECF1F4"), d3.rgb('#3D6E90')])

    // Create projections and scale ------USE AGAIN IN OTHER PROJECTS
    let projection = d3.geoEqualEarth().scale(1).translate([0, 0]).precision(0);
    let path = d3.geoPath().projection(projection);
    let bound = path.bounds(topojson.feature(geoData, geoData.objects.countries));


    let scale = 1.1 / Math.max((bound[1][0] - bound[0][0]) / dimensions.boundedWidth,
        (bound[1][1] - bound[0][1]) / dimensions.boundedHeight);
    let transl = [(dimensions.boundedWidth - scale * (bound[1][0] + bound[0][0])) / 2 - 25,
    (dimensions.boundedHeight - scale * (bound[1][1] + bound[0][1])) / 2]

    // Update projection
    projection.scale(scale).translate(transl);

    // Create number formatter for tooltip
    let numberFormatter = d3.format(",.4r")

    // Tooltip
    const tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, -10])
        .html(d => {
            if (d.location == undefined) {
                return null
            } else {
                return `<p class="geo"><strong>${d.location}</strong></p><p class="figures">${d.location} has administered <strong>${numberFormatter(d.total_vaccinations)}</strong> doses. <br>The country has fully vaccinated <strong>${d.people_fully_vaccinated_per_hundred}%</strong> of its population.</strong></p>`
            }
        })
    bounds.call(tip)

    // Draw map
    const map = bounds.selectAll("path")
        .data(newData)

    map.exit().remove()

    map.enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "white")
        .attr("stroke-width", "1px")
        .on('mouseover', d => d.location == undefined ? tip.hide(d) : tip.show(d))
        .on("mouseleave", d => tip.hide(d))
        .merge(map)
        .attr("fill", d => d.total_vaccinations_per_hundred !== undefined ? colors(vacAccessor(d)) : "#cecfc8")


    // Create legend
    // const legend = d3.select('#map-legend').append("svg")
    const legend = bounds.append('g')
        .attr("height", 60)
        .attr("width", dimensions.boundedWidth)

    const legendInner = legend.append('g')
        .attr("class", 'legend')
        .style('transform', `translate(${dimensions.boundedWidth / 3}px, 15px`)

    // const legendText = legendInner.append('text')
    const legendText = legendInner.append('text')
        .attr("y", -2)
        .attr("x", 130)
        .text("Number of doses per 100 people")

    colors.ticks().forEach((color, i) => {
        const legendItem = legendInner.append('g')
            .attr("transform", `translate(${i * 70}, 5)`)

        legendItem.append('rect')
            .attr("height", 8)
            .attr("width", 70)
            .attr("fill", () => {
                while (i < colors.ticks().length) {
                    return colors(colors.ticks()[i])
                }
            })

        legendItem.append("text")
            .attr("class", "legend-ticks")
            .attr("x", i + 70)
            .attr("y", 25)
            .attr("text-anchor", 'middle')
            .text(() => {
                while (i < colors.ticks().length - 1) {
                    return colors.ticks()[i]
                }
            })
    })

    // Create labels
    const countries = ['China', 'Brazil', 'Russia', 'Australia',
        'Algeria', 'India', 'Angola', 'Iran', 'Sudan',
        'Greenland', 'Spain', 'Germany', 'Pakistan', 'Kenya', 'Niger', 'Japan', 'Thailand', 'Mexico']

    const labels = bounds.selectAll('text')
        .data(newData)
        .enter()
        .append('text')
        .attr("class", 'country-name')
        .attr("x", d => (d.location == 'Iran' | d.location == 'Greenland') ? path.centroid(d)[0] + 5 : path.centroid(d)[0])
        .attr("y", d => path.centroid(d)[1] + 5)
        .attr("text-anchor", "middle")
        .text(d => countries.includes(d.location) ? d.location : "")

        

}

drawMap()

// Experiments

// Create tooltip 
    // const showToolTip = (text, coords) => {
    //     d3.select('#tooltip').text(text)
    //         .style('top', projection(coords[1]))
    //         .style('left', projection(coords[0]))
    //         .style('display', 'block')
    // }

    // const hideToolTip = (text, coords) => {
    //     d3.select('#tooltip').text(text)
    //         .style('display', 'none')
    // }

    // .on("mouseover", d => showToolTip(d.location, [d3.event.clientX, d3.event.clientY]))
        // .on('mousemove', d => showToolTip(d.location, [d3.event.clientX, d3.event.clientY]))
        // .on("mouseover", hideToolTip)
