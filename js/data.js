async function getData() {

    let data = await d3.csv('Processing/chart.csv').then(data => {
        data.forEach(d => {
            d.Population = Number(d.Population)
            d.GDPpc = Number(d.GDPpc)
            d.total_vaccinations_per_hundred = Number(d.total_vaccinations_per_hundred)
        })
        return data
    })

    const numberFormat  = d3.format(".3s")

    // Get totals for income brackets
    const getTotals =(location) => {
        const area = data.filter(d => {
            return d.location === location
        })
        return Number(area[0].total_vaccinations)
    }

    const incomes = ["Low income", "Lower middle income", "Upper middle income", "High income"]
    let nums = []
    for (let i = 0; i < incomes.length; i++) {
        nums.push(getTotals(incomes[i]))
    }

    let [low, lowMid, upMid, high] = nums

    console.log(low)

    document.querySelector("#low").textContent = numberFormat(low).replace(/M/, " million")


    // Get total world data
    const totalData = await d3.json('https://raw.githubusercontent.com/simprisms/global_vac_data/main/data/last_vac2.json')
   
    const totalsFiltered = totalData.filter(d => {
        return d.location !== "World" &&
            d.location !== 'Upper middle income' &&
            d.location !== 'Lower middle income' &&
            d.location !== 'Low income' &&
            d.location !== 'High income' &&
            d.location !== 'European Union' &&
            d.location !== 'North America' &&
            d.location !== 'South America' &&
            d.location !== 'Gibraltar' &&
            d.location !== 'British Virgin Islands' &&
            d.location !== 'Asia' &&
            d.location !== 'Europe' &&
            d.location !== 'Africa' &&
            d.location !== 'Oceania' &&
            d.location !== 'United Kingdom'

    })
   
    const totals = _.pluck(totalsFiltered, 'total_vaccinations')
    const tots = totals.reduce((first, next) => first + next)
    console.log(tots)

    const formatter = d3.format("0.3s")

    //Assign to DOM elements
    console.log(`Low: ${formatter(low).replace(/M/, " million")}`)
    console.log(`Low mid: ${formatter(lowMid).replace(/M/, " million")}`)
    console.log(`Up mid: ${formatter(upMid).replace(/G/, " billion")}`)
    console.log(`High: ${formatter(high).replace(/M/, " million")}`)



    document.querySelector("#total_world").textContent = formatter(tots).replace(/G/," billion")
}

getData()