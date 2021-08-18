import logging
from collections import OrderedDict
from logging.config import dictConfig
from configs.configs import db_cluster, db, monolingual_collection

import pymongo
log = logging.getLogger('file')


mongo_instance_mono = None

class MonolingualRepo:
    def __init__(self):
        pass

    # Method to set Monolingual Mongo DB collection
    def set_monolingual_collection(self):
        if "localhost" not in db_cluster:
            log.info(f'Setting the Mongo Monolingual DS Shard Cluster up.....')
            client = pymongo.MongoClient(db_cluster)
            ulca_db = client[db]
            ulca_db.drop_collection(monolingual_collection)
            ulca_col = ulca_db[monolingual_collection]
            ulca_col.create_index([("tags", -1)])
            db_cli = client.admin
            key = OrderedDict([("_id", "hashed")])
            db_cli.command({'shardCollection': f'{db}.{monolingual_collection}', 'key': key})
            log.info(f'Done!')
        else:
            log.info(f'Setting the Mongo DB Local for Monolingual DS....')
            client = pymongo.MongoClient(db_cluster)
            ulca_db = client[db]
            ulca_db.drop_collection(monolingual_collection)
            ulca_col = ulca_db[monolingual_collection]
            ulca_col.create_index([("tags", -1)])
            log.info(f'Done!')

    # Initialises and fetches mongo db client
    def instantiate(self):
        global mongo_instance_mono
        client = pymongo.MongoClient(db_cluster)
        mongo_instance_mono = client[db][monolingual_collection]
        return mongo_instance_mono

    def get_mongo_instance(self):
        global mongo_instance_mono
        if not mongo_instance_mono:
            return self.instantiate()
        else:
            return mongo_instance_mono

    def insert(self, data):
        col = self.get_mongo_instance()
        col.insert_many(data)
        return len(data)

    # Updates the object in the mongo collection
    def delete(self, rec_id):
        col = self.get_mongo_instance()
        col.delete_one({"id": rec_id})

    # Updates the object in the mongo collection
    def update(self, object_in):
        col = self.get_mongo_instance()
        col.replace_one({"id": object_in["id"]}, object_in)

    # Searches the object into mongo collection
    def search(self, query, exclude, offset, res_limit):
        try:
            col = self.get_mongo_instance()
            if offset is None and res_limit is None:
                res = col.find(query, exclude).sort([('_id', 1)])
            else:
                res = col.find(query, exclude).sort([('_id', -1)]).skip(offset).limit(res_limit)
            result = []
            for record in res:
                result.append(record)
            return result
        except Exception as e:
            log.exception(e)
            return []


# Log config
dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] {%(filename)s:%(lineno)d} %(threadName)s %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {
        'info': {
            'class': 'logging.FileHandler',
            'level': 'DEBUG',
            'formatter': 'default',
            'filename': 'info.log'
        },
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'DEBUG',
            'formatter': 'default',
            'stream': 'ext://sys.stdout',
        }
    },
    'loggers': {
        'file': {
            'level': 'DEBUG',
            'handlers': ['info', 'console'],
            'propagate': ''
        }
    },
    'root': {
        'level': 'DEBUG',
        'handlers': ['info', 'console']
    }
})