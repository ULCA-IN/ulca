from src.models.db import AggregateTabularDataModel

class GetTabularData(object):
    def __init__(self):
        self.aggregateTabularDataModel      =   AggregateTabularDataModel()


    def aggregate(self, search_data):

        tabular_data = self.aggregateTabularDataModel.data_aggregator()
        return tabular_data
