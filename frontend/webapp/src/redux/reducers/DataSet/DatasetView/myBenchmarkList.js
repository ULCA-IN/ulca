import C from "../../../actions/constants";
import getDatasetName from "../../../../utils/getDataset";
const initialState = {
  responseData: [],
  filteredData: [],
  refreshStatus: false,
  filter: { status: [], datasetType: [] },
  selectedFilter: { status: [], datasetType: [] },
};

const dateConversion = (value) => {
  var myDate = new Date(value);
  let result = myDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    // hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true
  });
  return result.toUpperCase();
};

const getFilterValue = (payload, data) => {
  let { filterValues } = payload;
  let statusFilter = [];
  let filterResult = [];
  if (
    filterValues &&
    filterValues.hasOwnProperty("status") &&
    filterValues.status.length > 0
  ) {
    statusFilter = data.responseData.filter((value) => {
      if (filterValues.status.includes(value.status)) {
        return value;
      }
    });
  } else {
    statusFilter = data.responseData;
  }
  if (
    filterValues &&
    filterValues.hasOwnProperty("datasetType") &&
    filterValues.datasetType.length > 0
  ) {
    filterResult = statusFilter.filter((value) => {
      if (filterValues.datasetType.includes(value.datasetType)) {
        return value;
      }
    });
  } else {
    filterResult = statusFilter;
  }
  data.filteredData = filterResult;
  data.selectedFilter = filterValues;
  return data;
};

const getClearFilter = (data) => {
  data.filteredData = data.responseData;
  data.selectedFilter = { status: [], datasetType: [] };
  return data;
};

const getContributionList = (state, payload) => {
  let responseData = [];
  let statusFilter = [];
  let datatypeFilter = [];

  let filter = { status: [], datasetType: [] };
  let refreshStatus = false;
  payload.forEach((element) => {
    responseData.push({
      submitRefNumber: element.serviceRequestNumber,
      datasetName: element.name,
      submittedOn: dateConversion(element.submittedOn),
      datasetType: element.task.type,
      status: element.status,
      color:
        element.status === "Completed"
          ? "#139D60"
          : element.status === "In-Progress"
          ? "#2C2799"
          : element.status === "Failed"
          ? "#F54336"
          : "#FEA52C",
    });
    !statusFilter.includes(element.status) && statusFilter.push(element.status);
    !datatypeFilter.includes(element.datasetName) &&
      datatypeFilter.push(element.task.type);
    if (element.status === "In-Progress" || element.status === "Pending") {
      refreshStatus = true;
    }
  });

  filter.status = [...new Set(statusFilter)];
  filter.datasetType = [...new Set(datatypeFilter)];

  responseData = responseData.reverse();
  let filteredData = getFilterValue(
    { filterValues: state.selectedFilter },
    { responseData: responseData }
  );
  filteredData.filter = filter;
  return filteredData;
};

const getFilteredData = (value, data) => {
  let newState = data.filter((val) => {
    return (
      (val["status"] &&
        val["status"].toLowerCase().includes(value.toLowerCase())) ||
      (val["datasetName"] &&
        val["datasetName"].toLowerCase().includes(value.toLowerCase())) ||
      (val["datasetType"] &&
        val["datasetType"].toLowerCase().includes(value.toLowerCase()))
    );
  });
  return newState;
};

const isFilterSelected = (selectedFilter) => {
  const values = Object.values(selectedFilter);
  for (let i = 0; i < values.length; i++) {
    if (values[i].length > 0) {
      return true;
    }
  }
  return false;
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case C.GET_BENCHMARK_CONTRIBUTION_LIST:
      return getContributionList(state, action.payload.benchmark);

    case C.CONTRIBUTION_BENCHMARK_TABLE:
      return getFilterValue(action.payload, state);

    case C.CLEAR_BENCHMARK_FILTER:
      return getClearFilter(state);

    case C.GET_BENCHMARK_SEARCH_VALUES:
      return {
        ...state,
        filteredData: getFilteredData(action.payload, state.responseData),
      };
    default:
      return {
        ...state,
      };
  }
};

export default reducer;
