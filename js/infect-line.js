async function drawInfectline() {
    const countryCases = await d3.csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv')

    // Create date parser
    const dateParse = d3.timeParse("%Y-%m-%d")

    // Convert data types
    countryCases.forEach(data => {
        data.total_cases = +data.total_cases
        data.new_cases = +data.new_cases
        data.date = dateParse(data.date)
    });

    // Subset South Africa
    const southAfrica = countryCases.filter(d => {
        return d.location == "South Africa"
    })

    // var simpleMovingAVG = function(dataObjArray, timePeriods){
    //     var sum = 0;
    //     var result = false;
    
    //     try{
    //         for(var i=timePeriods-1;i>-1;i--){
    //             sum += dataObjArray[i].new_cases;
    //         }
    
    //         result = (parseFloat(sum) / parseFloat(timePeriods));
    //         //console.log('SMA Result : ' + result);
    //     } catch(err) {
    //         result = false;
    //         console.log("SMA Error : " + err);
    //     }
    
    //     return result;
    // };
    // let dog = simpleMovingAVG(southAfrica, 7)
    // console.log(dog)

    // Create accessor functions
    const xAccessor = d => d.date
    const yAccessor = d => d.new_cases

    // Set dimensions
    const width = 800
    const dimensions = {
        width, 
        height: 600,
        margins: {
            top: 10,
            right: 10,
            left: 30,
            bottom: 30
        }
    }
    dimensions.boundedWidth = dimensions.width 
        - dimensions.margins.right
        - dimensions.margins.left
    dimensions.boundedHeight = dimensions.height
        - dimensions.margins.top
        - dimensions.margins.bottom

    // Create wrapper
    const wrapper = d3.select("#infect-line").append("svg")
        .attr("height", dimensions.height)
        .attr("width", dimensions.width)

    // Create bounds
    const bounds = wrapper.append("g")
        .style("transform", `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`)

    // Create scales
    const yScale = d3.scaleLinear()
        .domain(d3.extent(southAfrica, yAccessor))
        .range([dimensions.boundedHeight, 0])

    const xScale = d3.scaleTime()
        .domain(d3.extent(southAfrica, xAccessor))
        .range([0, dimensions.boundedWidth])

    // Create line generator
    const lineGenerator = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor(d)))

    // Draw line
    const path = bounds.append("path")
        .attr("d", lineGenerator(southAfrica))
        .attr("fill", "none")
        .attr("stroke", "black")

    const xAxisGenerator = d3.axisBottom(xScale)
    
    const xAxis = bounds.append('g')
        .style("transform", `translateY(${dimensions.boundedHeight}px)`)
        .call(xAxisGenerator)

        

}



drawInfectline()