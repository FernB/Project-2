import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, inspect
import json

from flask import Flask, jsonify

engine = create_engine("sqlite:///diseases.sqlite")

Base = automap_base()
Base.prepare(engine, reflect=True)




app = Flask(__name__)

@app.route("/")
def default():
    # list of unquie disease groups for dropdown
    
    Diseasegroups = Base.classes.DiseaseGroups

    session = Session(engine)

    results = session.query(Diseasegroups.DiseaseGroup).group_by(Diseasegroups.DiseaseGroup).all()
    # all_names = Base.classes.keys()

    
    # inspector = inspect(engine)
    # all_names = inspector.get_table_names()

    # columns = inspector.get_columns('DiseaseGroups')
    
    # all_names = []

    # for c in columns:
    #     all_names.append(c['name'])


    session.close()

    all_names = list(np.ravel(results))

    return jsonify(all_names)






@app.route("/api/Othernotifiablediseases")
def diseasegroups():

    
    Disease = Base.classes.DiseaseSummary

    session = Session(engine)

    results = session.query(Disease).filter(Disease.Location == "WA").filter(Disease.Disease_Group == "Bloodborne diseases")
    listofdiseases = session.query(Disease.Disease_Name).filter(Disease.Location == "WA").filter(Disease.Disease_Group == "Bloodborne diseases").group_by(Disease.Disease_Name).all()
    all_names = list(np.ravel(listofdiseases))



       
    # inspector = inspect(engine)
    # all_names = inspector.get_table_names()


    # inspector = inspect(engine)
    # all_names = Base.classes.keys()

    # tn = inspector.get_table_names()

    # columns = inspector.get_columns("Othernotifiablediseases")
    # td = []
    # for column in columns:
    #     td.append(column["name"])

    # session.close()
    # datalist = []

    # datalist.append([result[1] for result in results])

    # all_names = list(np.ravel(results))
    # results = session.query(Disease.Location).group_by(Disease.Location).all()

    # session.close()

    # all_names = list(np.ravel(results))

#   "Legionellosis", 
#   "Leprosy", 
#   "Meningococcal disease (invasive)", 
#   "RSV", 
#   "Tuberculosis", 
#   "iGAS", 
#   "Location", 
#   "Year"


    
    disease_list = []


    disease_dic = {}
    for name in all_names:
        disease_dic[name] = [result.Infection_Rate for result in results if result.Disease_Name == name]
    disease_list.append(disease_dic)
  


    # disease_dic["Meningococcal disease (invasive)"] = [result.like("%Meningococcal%") for result in results]
    # for row in results:
    #     print(row.__dict__)
        # dd = {k: v for k,v in d.items() if not k.startswith('_')}


        # disease_list.append(d)

    # dies = []
    # for i in td:
    #     for j in results:
    #         ddi = {}
    #         ddi[i] = j
    #         dies.append(ddi)


 


    


    return jsonify(disease_list)


if __name__ == '__main__':
    app.run(debug=True)
