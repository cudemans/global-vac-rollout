async function drawDumbell() {
    const data = await d3.csv("./Processing/chart.csv")

    const groups = ["Low income", "Lower middle income", "Upper middle income", "High income"]
    
    // Get total vaccinations for income groups
    const getTotalVacs = (group) => {
        const area = data.filter(d => {
            return d.location == group
        })
        return Number(area[0].total_vaccinations)
    }

    const totalVac =[]
    for (let i = 0; i < groups.length; i++) {
        totalVac.push(getTotalVacs(groups[i]))
    }

   // Get total populations for income groups 
    const totalPop = []
    const getTotalPop = (group) => {
        const area = data.filter(d => {
            return d.location == group
        })
        return Number(area[0].Population)
    }
    for (let i = 0; i < groups.length; i++) {
        totalPop.push(getTotalPop(groups[i]))
    }
   
    // Get world info
    // Population
    const world = data.filter(d => {
        return d.location == "World"
    })

    const worldPop = Number(world[0].Population)
    const worldVac = Number(world[0].total_vaccinations)

    // Proportions
    const vacProp = totalVac.map(d => {
        return d / worldVac * 100
    })

    const popProp = totalPop.map(d => {
        return Math.trunc(d / worldPop * 100)
    })
    // Low income
    document.querySelector("#low-pop").textContent = `${popProp[0]}%`
    document.querySelector("#low-vac").textContent = `${vacProp[0].toFixed(2)}%`

    // High income
    document.querySelector("#high-pop").textContent = `${popProp[3]}%`
    document.querySelector("#high-vac").textContent = `${vacProp[3].toFixed(2)}%`
    console.log(`Proportion of vaccines: ${vacProp}`)
    console.log(` Proportion of world's pop: ${popProp}`)
}

drawDumbell()