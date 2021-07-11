async function getData() {

    let data = await d3.csv('Processing/chart2.csv').then(data => {
        data.forEach(d => {
            d.Population = Number(d.Population)
            d.GDPpc = Number(d.GDPpc)
            d.total_vaccinations_per_hundred = Number(d.total_vaccinations_per_hundred)
        })
        return data
    })

    const dateParse = d3.timeParse("%Y-%m-%d")
    const dateFormat = d3.timeFormat("%B %-d, %Y")


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

    

    // document.querySelector("#low").textContent = numberFormat(low).replace(/M/, " million")


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

    

    totalsFiltered.forEach(d => {
        d.date = dateParse(d.date)
        return d
    })

   let lastDate = d3.max(totalsFiltered, d => d.date)

    
   
    const totals = _.map(totalsFiltered, 'total_vaccinations')
    const tots = totals.reduce((first, next) => first + next)
    

    const formatter = d3.format("0.3s")

    //Assign to DOM elements
    
    document.querySelector("#total_world").textContent = formatter(tots).replace(/G/," billion")

    document.querySelector(".update").textContent = `Updated: ${dateFormat(lastDate)}`
}

getData()