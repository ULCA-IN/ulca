import logging
from logging.config import dictConfig
from models.model_metric_eval import ModelMetricEval
import fastwer
import numpy as np

log = logging.getLogger('file')

class ASRCEREval(ModelMetricEval):
    """
    Implementation of metric evaluation of ASR type models
    using CER(Character Error Rate)
    """

    def asr_metric_eval(self, ground_truth, machine_translation):

        try:
            log.info("machine_translation :", machine_translation)
            log.info("ground_truth :", ground_truth)
            eval_score = fastwer.score(machine_translation, ground_truth, char_level=True)
            log.info("CER score :", eval_score)
            if np.isnan(eval_score):
                log.error("Unable to calculate CER score")
                return None
            else:
                log.info("CER score not NaN")
                return eval_score
        except Exception as e:
            log.exception(f"Exception in calculating CER: {str(e)}")
            return None

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