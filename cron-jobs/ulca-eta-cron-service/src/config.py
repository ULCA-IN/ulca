import os

DEBUG = False
API_URL_PREFIX = "/ulca/cron-manager"
HOST = '0.0.0.0'
PORT = 5001

ENABLE_CORS = False

ulca_db_cluster           =   os.environ.get('ULCA_MONGO_CLUSTER', 'mongodb://localhost:27017')
process_db                =   os.environ.get('ULCA_PROC_TRACKER_DB', 'ulca-process-tracker')
process_collection        =   os.environ.get('ULCA_PROC_TRACKER_PROC_COL', 'ulca-pt-processes')


