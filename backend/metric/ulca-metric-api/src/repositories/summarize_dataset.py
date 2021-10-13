from src.models.db import FetchFilterParams
from src.models.db import AggregateDatasetModel, AggregateModelData, AggregateBenchmarkData, FetchFilterParams

class SummarizeDatasetRepo(object):
    def __init__(self):
        self.aggregateDatasetModel      =   AggregateDatasetModel()
        self.aggregateModel             =   AggregateModelData() 
        self.aggregateBenchmark         =   AggregateBenchmarkData()
        self.fetchFilterParams          =   FetchFilterParams()

    def search(self):
        corpus_stats = self.fetchFilterParams.search()
        return  corpus_stats

    def aggregate(self, search_data):
        corpus_stats = []
        count = 0
        if search_data["type"] == "model":
            corpus_stats,count = self.aggregateModel.data_aggregator(search_data)
            return corpus_stats, count
        if search_data["type"] == "benchmark":
            corpus_stats,count = self.aggregateBenchmark.data_aggregator(search_data)
            return corpus_stats, count
        else:
            corpus_stats,count = self.aggregateDatasetModel.data_aggregator(search_data)
            return corpus_stats, count

    def aggregate_models(self, search_data):
        corpus_stats,count = self.aggregateModel.data_aggregator(search_data)
        if not corpus_stats:
            return corpus_stats,0
        return corpus_stats