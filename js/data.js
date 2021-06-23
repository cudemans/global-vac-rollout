

// Get total global 
const totals = _.pluck(totalsFiltered, 'total_vaccinations')
const tots = totals.reduce((first, next) => first + next)
    console.log(tots)

    const formatter = d3.format("0.3s")

    document.querySelector("#total_world").textContent = formatter(tots).replace(/G/," billion")

const filtered = _.groupBy(filteredData, 'IncomeGroup')
    console.log(filtered)
    
    const incomeGroupTotals = (incomeGroup) => {
        const plucked =  _.pluck(filtered[incomeGroup], "total_vaccinations")
        return plucked.map(d => Number(d)).reduce((first, next) => first + next)
        }

    console.log(incomeGroupTotals('High'))