import os
import time

DEBUG           = False
API_URL_PREFIX  = "/ulca/data-metric"
HOST            = '0.0.0.0'
PORT            = 5001
ENABLE_CORS     = False

# mongodb configs
MONGO_DB_SCHEMA         = os.environ.get('MONGO_DB_SCHEMA', 'test')
MONGO_CONNECTION_URL    = os.environ.get('MONGO_CLUSTER_URL', 'mongodb://localhost:27017')
#druid store configs
DRUID_DB_SCHEMA         = os.environ.get('MATRIC_DRUID_DB_SCHEMA', 'dataset-training-v5')
DRUID_CONNECTION_URL    = os.environ.get('DRUID_CLUSTER_URL', 'druid://localhost:8082/druid/v2/sql/')#druid://localhost:8082/druid/v2/sql/

TIME_CONVERSION_VAL     = os.environ.get('ASR_DATA_CONERSION_VAL',3600)
if isinstance(TIME_CONVERSION_VAL, str):
    TIME_CONVERSION_VAL  =  eval(TIME_CONVERSION_VAL)