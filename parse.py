# The purpose of this script is to select the last day of data from Our Word in Data's 
# vaccination dataset to cut down on data loading times

import pandas as pd
import json

# Get data
data = pd.read_csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv')

# Fill latest NaN values 
new = data.fillna(method='ffill')

# Get last day of data for each country
def getData(dataset):
    countries = []
    for country in dataset['location'].unique():
        dataInner = dataset[dataset.location == country]
        last_vac = dataInner.iloc[-1, :]
        countries.append(last_vac)
    return countries

parsedData = getData(new)

# Convert to dataframe 
exportData = pd.DataFrame(parsedData)

# Export as JSON
dataDict = exportData.to_dict('records')

# Save as a json file
with open('data/last_vac2.json', 'w') as f:
    json.dump(dataDict, f)


