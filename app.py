import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, inspect

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






@app.route("/api/d")
def diseasegroups():

    Disease = Base.classes.Bloodbornediseases

    session = Session(engine)

    # results = session.query(Disease).filter(Disease.Location == "WA").all()

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
    results = session.query(Disease.Location).group_by(Disease.Location).all()

    # session.close()

    all_names = list(np.ravel(results))

    return jsonify(all_names)


if __name__ == '__main__':
    app.run(debug=True)
