async function plotLine() {

    const data = await d3.csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv')

    console.log(data)

}

plotLine()