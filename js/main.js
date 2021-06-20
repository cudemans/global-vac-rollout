async function drawMap() {
    const geoData = await d3.json('data/country-shapes.json')
    let parsedData = topojson.feature(geoData, geoData.objects.countries).features

    const countryVac = await d3.json('https://raw.githubusercontent.com/simprisms/global_vac_data/main/data/last_vac2.json')
    
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
            bottom: 10,
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
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

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


      var scale = 1.1 / Math.max((bound[1][0] - bound[0][0]) / dimensions.boundedWidth,
        (bound[1][1] - bound[0][1]) / dimensions.boundedHeight);
      var transl = [(dimensions.boundedWidth - scale * (bound[1][0] + bound[0][0])) / 2 -25,
        (dimensions.boundedHeight - scale * (bound[1][1] + bound[0][1])) / 2
      ];
      projection.scale(scale).translate(transl);    

    
    // Create number formatter for tooltip
    let numberFormatter = d3.format(",.4r") 

    // Tooltips
    const tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, -10])
        .html(d => {
            if (d.location == undefined) {
                return `<p class="no-data"><strong>No Data</p></strong>`
            } else {
                return `<p id="geo-name"><strong>${d.location}</strong></p><p class="figures">${d.location} has administered <strong>${numberFormatter(d.people_vaccinated)}</strong> doses, <br>covering <strong>${d.total_vaccinations_per_hundred}%</strong> of the country's population.</strong></p>`
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
        .on('mouseover', function (d) {
            tip.show(d)
        })
        .on("mouseleave", function(d) {
            tip.hide(d)
        })
        .merge(map)
            .attr("fill", d => {
                if (d.total_vaccinations_per_hundred !== undefined) {
                    return  colors(vacAccessor(d))
                } else {
                    return "#cecfc8"
                }
                
            }) 

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
                i ++
                }
            })

        legendItem.append("text")
            .attr("class", "legend-ticks")
            .attr("x", i + 70)
            .attr("y", 25)
            .attr("text-anchor", 'middle')
            .text(() => {
                while (i < colors.ticks().length -1) {
                    return colors.ticks()[i]
                    i ++
                }
            } ) 
    })


    // Create labels
    const countries = ['United States', 'China', 'Brazil', 'Russia', 'Australia',
        'Algeria', 'India', 'Angola', 'Iran', 'Sudan', 'Greenland']
        
    const labels = bounds.selectAll('text')
        .data(newData)
        .enter()
            .append('text')
                .attr("class", 'country-name')
                .attr("x", function(d){
                    if (d.location == 'Iran') {
                        return path.centroid(d)[0] + 5
                    } else {
                        return path.centroid(d)[0] ; 
                    }
                })
                .attr("y", function(d){
                        return  path.centroid(d)[1] + 5;
                })
                .attr("text-anchor", "middle")
                .text(d => {
                    if (countries.includes(d.location)) {
                            return d.location
                        
                    } else {
                        return ""
                    }
                })
        
}

drawMap()