# Missouri-COVID19
In this project I used the Javascript d3 library to create interactive visualizations of publicly available COVID-19 data from the state of Missouri (https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Public-Use-Data-with-Ge/n8mc-b4w4/data).

This project was completed individually for the DSC 106 course at UC San Diego during Winter 2022 quarter. 

The filter conditions for replication of the dataset are 
1) county_fips_code is not ‘NA’
2) res_state is ‘MO’
3) current_status is ‘Laboratory-confirmed case’


Description of Files
1) Original Data/APIdict.xlsx: this file was the provided documentation for the data directly from the cdc website
2) Original Data/covidMO.csv: the originally downloaded data straight from the cdc website
3) dataCleaning.ipynb: I performed data cleaning of the original data and created the file "covidMOclean.csv"
4) index.html: file for displaying visualizations. References "app.js" file where I create visualizations
5) app.js: used d3 library and conducted all aggregations and interactivities in this file
6) styles.css: set the styles of elements in this file
7) index.pdf: pdf file of the visualizations created (WITHOUT INTERACTIVITY)
