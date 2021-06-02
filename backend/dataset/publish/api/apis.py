from flask import Flask, jsonify, request

from service.parallel import ParallelService
from service.datasetservice import DatasetService
from service.monolingual import MonolingualService
from service.asr import ASRService
from service.ocr import OCRService
from configs.configs import dataset_type_parallel, dataset_type_asr, dataset_type_ocr, dataset_type_monolingual

ulca_dataset_publish = Flask(__name__)


# REST endpoint to fetch configs
@ulca_dataset_publish.route('/ulca/dataset/v0/load', methods=["POST"])
def insert_dataset():
    req_criteria, data = request.get_json(), {}
    p_service, m_service, a_service, o_service = ParallelService(), MonolingualService(), ASRService(), OCRService()
    if req_criteria["datasetType"] == dataset_type_parallel:
        data = p_service.load_parallel_dataset(req_criteria)
    if req_criteria["datasetType"] == dataset_type_ocr:
        data = o_service.load_ocr_dataset(req_criteria)
    if req_criteria["datasetType"] == dataset_type_asr:
        data = a_service.load_asr_dataset(req_criteria)
    if req_criteria["datasetType"] == dataset_type_monolingual:
        data = m_service.load_monolingual_dataset(req_criteria)
    return jsonify(data), 200


# REST endpoint to fetch configs
@ulca_dataset_publish.route('/ulca/dataset/v0/cluster/set', methods=["POST"])
def set_cluster():
    service = DatasetService()
    req_criteria = request.get_json()
    service.set_dataset_db(req_criteria)
    response = {"message": "DONE"}
    return jsonify(response), 200
