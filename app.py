import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, inspect
import json
from datetime import timedelta

from flask import Flask, jsonify, render_template

engine = create_engine("sqlite:///diseases.sqlite")

Base = automap_base()
Base.prepare(engine, reflect=True)




app = Flask(__name__)


@app.route('/')
def index():
    return render_template('./index.html')



@app.route("/home")
def default():
    # list of unquie disease groups for dropdown
    return render_template('./home.html')
    
    # Diseasegroups = Base.classes.DiseaseGroups

    # session = Session(engine)

    # results = session.query(Diseasegroups.DiseaseGroup).group_by(Diseasegroups.DiseaseGroup).all()
    # all_names = Base.classes.keys()

    
    # inspector = inspect(engine)
    # all_names = inspector.get_table_names()

    # columns = inspector.get_columns('DiseaseGroups')
    
    # all_names = []

    # for c in columns:
    #     all_names.append(c['name'])


    # session.close()

    # all_names = list(np.ravel(results))

    # return jsonify(all_names)






@app.route("/api/data")
def diseasegroups():

    
    Disease = Base.classes.DiseaseSummary

    session = Session(engine)

    results = session.query(Disease)
    
    # .filter(Disease.Location == state)
    
    #.filter(Disease.Disease_Group == group)

    # listofdiseases = session.query(Disease.Disease_Group).filter(Disease.Location == state).group_by(Disease.Disease_Group).all()
    # all_names = list(np.ravel(listofdiseases))

    # listofyears = session.query(Disease.Year).filter(Disease.Location == state).filter(Disease.Disease_Group == group).group_by(Disease.Year).all()
    # all_years = list(np.ravel(listofyears))

    # inspector = inspect(engine)
    # all_names = inspector.get_table_names()

    # columns = inspector.get_columns('DiseaseSummary')
    
    # all_names = []

    # for c in columns:
    #     all_names.append(c['name'])


       


    session.close()

   

    
    disease_list = []


    
    for result in results:
        disease_dic = {}
        disease_dic["Year"] = result.Year
        disease_dic["Disease"] = result.Disease_Name
        disease_dic["Infection_Rate"] = result.Infection_Rate
        disease_dic["Location"] = result.Location
        disease_dic["Disease_Group"] = result.Disease_Group
        
        disease_list.append(disease_dic)
  




 
        # disease_dic[name] = [result.Infection_Rate for result in results if result.Disease_Name == name]


    


    return jsonify(disease_list)


if __name__ == '__main__':
    app.run(debug=True)
