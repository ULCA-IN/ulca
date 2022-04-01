import os

DEBUG = False
API_URL_PREFIX = "/ulca/apis/asr"
HOST = '0.0.0.0'
PORT = 5001

ENABLE_CORS = False

ulca_db_cluster = os.environ.get('ULCA_MONGO_CLUSTER', "mongodb://127.0.0.1:27017/")
mongo_db_name = os.environ.get('ULCA_PROC_TRACKER_DB', "asr-benchmark-data")
mongo_collection_name = os.environ.get('ULCA_BENCHMARK_PROCESS_COLLECTION', "asr-ground-truth")

vakyansh_audiouri_link          =       os.environ.get("VAKYANSH_AUDIO_URI","https://speech-recog-model-api-gateway-new-h3dqga4.ue.gateway.dev/v1/recognize/")
vakyansh_audicontent_link       =       os.environ.get("VAKYANSH_AUDIO_CONTENT_URI","https://speech-recog-model-api-gateway-new-h3dqga4.ue.gateway.dev/v1/recognize/")
shared_storage_path             =       os.environ.get("ULCA_SHARED_STORAGE_PATH","/opt/")
