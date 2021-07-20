# Visualising Data from the National Notifiable Diseases Surveillance System for Strategic Improvements to Health Outcomes

![Data Health Banner](images/Health-Data-Research-UK-750x500.png)

## Introduction

The aim of this project was to investigate data from the National Notifiable Disease Surveillance System (NNDSS) and establish 
what trends could be observed 
For our project we looked at the NNDSS dataset and focused on all diseases by state and years 2015-2020. 
Using visualization we compared the states by disease category to identify any trends. 

## Structure
```
project 
|__ static/                 
|   |__ css/                
|   |   |__ d3Style.css             # style sheet 
|   |   |__ style.css               # style sheet 
|   |   
|   |__ data/                       # data folder
|   |__ js/
|       |__ app.js                  # javascript file
|       |__ icon.js                 # javascript file
|
|__ templates/   
|    |__ about.html                 # html file
|    |__ home.html                  # html file
|    |__ index.html                 # html file
|
|__ .gitignore
|
|__ app.py                          # flask-sqlachemy app to launch website an api
|
|__ diseases.sqlite                 # database
|
|__ Webscrape and database.ipynb    # webscraping notebook and creation of database

```

## Usage

```
The page was created using:
- HTML5
- Bootstrap 5.0.2
- Javascript ES6
- D3.js V4
- SQL Alchemy
- python 3.8.5
- pandas 1.2.4
- splinter 0.14.0
- webdriver_manger 3.4.2
- flask 1.1.2
- sqlite
- gnuicorn
- heroku
```

## Questions 

1. Which states are experiencing the highest infection rates by disease group?
2. Which disease groups are occurring most frequently?
3. Which disease groups are contributing the most to infection rates?
4. How are the rates progressing over time? 


## Datasets 

|No.|Source|Link|
| -|-|-|
|1|National Notifiable Diseases Surveillance System |http://www9.health.gov.au/cda/source/cda-index.cfm|
|1|National Notifiable Diseases Surveillance System |http://www9.health.gov.au/cda/source/cda-index.cfm|



## Analysis

### Question 1: Which states are experiencing the highest infection rates by disease group? 

![chart](images/pic1.png)

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Question 2: Which disease groups are occurring most frequently? 

![chart](images/pic2.png)

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Question 3: Which disease groups are contributing the most to infection rates?

![chart](images/pic3.png)

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Question 4: How are the rates progressing over time? 

![chart](images/pic4.png)

![chart](images/pic5.png)

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Contributors
:small_blue_diamond: Amin Sundrani [@AminSundrani](https://github.com/AminSundrani)
:small_blue_diamond: Fern Bradder [@FernB](https://github.com/FernB)
:small_blue_diamond: Hideaki Kaneko [@hide-890302](https://github.com/hide-890302)
:small_blue_diamond: Rebecca Gould [@Bec-Gould](https://github.com/Bec-Gould)