
# Import depednancies
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, inspect
from datetime import timedelta

from flask import Flask, jsonify, render_template

# connect to db
engine = create_engine("sqlite:///diseases.sqlite")

# reflect db
Base = automap_base()
Base.prepare(engine, reflect=True)

# initialise app
app = Flask(__name__)

# home route
@app.route('/')
def index():
    return render_template('./index.html')

# graphs page
@app.route("/dash")
def default():
    return render_template('./dash.html')
    
 # about page
@app.route("/about")
def about():
    return render_template('./about.html')


# api
@app.route("/api/data")
def diseasegroups():

    # get entire table from database
    Disease = Base.classes.DiseaseSummary

    session = Session(engine)

    results = session.query(Disease)
    
    session.close()

   #create list of dics for required data
    disease_list = []

    for result in results:
        disease_dic = {}
        disease_dic["Year"] = result.Year
        disease_dic["Disease"] = result.Disease_Name
        disease_dic["Infection_Rate"] = result.Infection_Rate
        disease_dic["Location"] = result.Location
        disease_dic["Disease_Group"] = result.Disease_Group
        
        disease_list.append(disease_dic)
  
    # make json readable 
    return jsonify(disease_list)


if __name__ == '__main__':
    app.run(debug=True)
