from flask import Flask
from flask.blueprints import Blueprint
from flask_cors import CORS
from src import routes
import logging
from logging.config import dictConfig
import config


log = logging.getLogger('file')

flask_app = Flask(__name__)

if config.ENABLE_CORS:
    cors    = CORS(flask_app, resources={r"/api/*": {"origins": "*"}})

for blueprint in vars(routes).values():
    if isinstance(blueprint, Blueprint):
        flask_app.register_blueprint(blueprint, url_prefix=config.API_URL_PREFIX)

@flask_app.route(config.API_URL_PREFIX)
def info():
    return "Welcome to Dataset APIs"

if __name__ == "__main__":
    log.info("starting module")
    flask_app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)

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