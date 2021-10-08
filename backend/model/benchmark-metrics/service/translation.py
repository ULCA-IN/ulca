import logging
from datetime import datetime
import numpy as np
from logging.config import dictConfig
from utils.mongo_utils import BenchMarkingProcessRepo

from models.metric_manager import MetricManager

log = logging.getLogger('file')

repo = BenchMarkingProcessRepo()

class TranslationMetricEvalHandler:
    def __init__(self):
        pass

    def execute_translation_metric_eval(self, request):
        try:
            log.info("Executing Translation Metric Evaluation....  {}".format(datetime.now()))
            metric_mgr = MetricManager.getInstance()
            if 'benchmarkDatasets' in request.keys():
                for benchmark in request["benchmarkDatasets"]:
                    metric_inst = metric_mgr.get_metric_execute(benchmark["metric"])
                    if not metric_inst:
                        log.info("Metric definition not found")
                        doc = {'benchmarkingProcessId':request['benchmarkingProcessId'],'benchmarkDatasetId': benchmark['datasetId'],'eval_score': None}
                        repo.insert(doc)
                        repo.insert_pt({'benchmarkingProcessId': request['benchmarkingProcessId'], 'status': 'Failed'})
                        return

                    ground_truth = [corpus_sentence["tgt"] for corpus_sentence in benchmark["corpus"]]
                    machine_translation = [corpus_sentence["mtgt"] for corpus_sentence in benchmark["corpus"]]
                    eval_score = metric_inst.machine_translation_metric_eval(ground_truth, machine_translation)
                    if eval_score:
                        doc = {'benchmarkingProcessId':request['benchmarkingProcessId'],'benchmarkDatasetId': benchmark['datasetId'],'eval_score': float(np.round(eval_score, 3))}
                        repo.insert(doc)
                        repo.insert_pt({'benchmarkingProcessId': request['benchmarkingProcessId'], 'status': 'Completed'})
                    else:
                        log.exception("Exception while metric evaluation of model")
                        doc = {'benchmarkingProcessId':request['benchmarkingProcessId'],'benchmarkDatasetId': benchmark['datasetId'],'eval_score': None}
                        repo.insert(doc)
                        repo.insert_pt({'benchmarkingProcessId': request['benchmarkingProcessId'], 'status': 'Failed'})
                               
            else:
                log.exception("Missing parameter: benchmark details")
                repo.insert_pt({'benchmarkingProcessId': request['benchmarkingProcessId'], 'status': 'Failed'})
                return
        except Exception as e:
            log.exception(f"Exception while metric evaluation of model: {str(e)}")
            repo.insert_pt({'benchmarkingProcessId': request['benchmarkingProcessId'], 'status': 'Failed'})
           
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