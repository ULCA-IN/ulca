import C from "../../../actions/constants";
import {
  getLanguageLabel,
  FilterByDomain,
  FilterByCollection,
  getLanguageName,
} from "../../../../utils/getLabel";
import getDatasetName from "../../../../utils/getDataset";
import { translate } from "../../../../assets/localisation";
const initialState = {
  responseData: [],
  filteredData: [],
};

const dateConversion = (value) => {
  var myDate = new Date(value);
  let result = myDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
  return result.toUpperCase();
};

const getLanguages = (arr) => {
  return arr.map((val) => getLanguageName(val)).join(", ");
};

const getSearchInfo = (searchCriteria) => {
  let result = [];
  const keys = Object.keys(searchCriteria);
  const keysToIgnore = [
    "groupBy",
    "multipleContributors",
    "originalSourceSentence",
    "serviceRequestNumber",
    "userId",
    "minScore",
    "maxScore",
  ];
  keys.forEach((key, i) => {
    if (keysToIgnore.indexOf(key) < 0 && searchCriteria[key] !== undefined) {
      if (key === "datasetType") {
        result.push({
          title: translate(key),
          para: getDatasetName(searchCriteria[key]),
          key,
        });
      } else if (key === "sourceLanguage" || key === "targetLanguage") {
        result.push({
          title: translate(key),
          para: getLanguages(searchCriteria[key]),
          key,
        });
      } else if (key === "license") {
        result.push({
          title: translate(key),
          para: Array.isArray(searchCriteria[key])
            ? searchCriteria[key].join(",").toUpperCase()
            : searchCriteria[key],
          key,
        });
      } else if (key === "collectionMethod") {
        result.push({
          title: translate(key),
          para: Array.isArray(searchCriteria[key])
            ? searchCriteria[key].join(",").replace("-", " ")
            : searchCriteria[key],
          key,
        });
      } else {
        result.push({
          title: translate(key),
          para: Array.isArray(searchCriteria[key])
            ? searchCriteria[key].join(",")
            : searchCriteria[key],
          key,
        });
      }
    }
  });
  return result;
};

const getMySearches = (payload) => {
  let newArr = [];
  payload.forEach((element) => {
    if (element.searchCriteria) {
      let dataSet = getDatasetName(element.searchCriteria.datasetType);
      let langauge =
        element.searchCriteria.sourceLanguage &&
        getLanguageLabel(element.searchCriteria.sourceLanguage).map(
          (val) => val.label
        )[0];
      let tLanguage =
        element.searchCriteria.targetLanguage &&
        getLanguageLabel(element.searchCriteria.targetLanguage)
          .map((val) => val.label)
          .join(", ");
      let searchDetails = JSON.parse(
        element.status.length > 0 && element.status[0].details
      );
      let domain =
        element.searchCriteria.domain &&
        FilterByDomain(element.searchCriteria.domain)
          .map((val) => val.label)
          .join(", ");
      let collection =
        element.searchCriteria.collectionMethod &&
        FilterByCollection(element.searchCriteria.collectionMethod)
          .map((val) => val.label)
          .join(", ");
      newArr.push({
        sr_no: element.serviceRequestNumber,
        search_criteria: `${dataSet} | ${langauge} ${
          tLanguage ? " | " + tLanguage : ""
        } ${domain ? " | " + domain : ""} ${
          collection ? " | " + collection : ""
        }`,
        searched_on: dateConversion(element.timestamp),
        status: element.status.length > 0 && element.status[0].status,

        count: searchDetails && searchDetails.count,
        sampleUrl: searchDetails && searchDetails.datasetSample,
        downloadUrl: searchDetails && searchDetails.dataset,
        // sourceLanguage: element.searchCriteria.sourceLanguage,
        // targetLanguage: element.searchCriteria.targetLanguage,
        // datasetType: element.searchCriteria.datasetType,
        // domain: element.searchCriteria.domain,
        // collection: element.searchCriteria.collectionMethod,
        searchValues: element.searchCriteria,
        searchInfo: getSearchInfo(element.searchCriteria),
      });
    }
  });
  newArr = newArr.reverse();

  return newArr;
};
const getFilteredData = (value, data) => {
  const newState = data.filter((val) => {
    return (
      (val["search_criteria"] &&
        val["search_criteria"].toLowerCase().includes(value.toLowerCase())) ||
      (val["count"] !== undefined && val["count"].toString().includes(value)) ||
      (val["status"] &&
        val["status"].toLowerCase().includes(value.toLowerCase()))
    );
  });

  return newState;
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case C.GET_MY_REPORT:
      const data = getMySearches(action.payload);
      return {
        responseData: data,
        filteredData: data,
      };
    case C.GET_SEARCHED_VALUES:
      return {
        ...state,
        filteredData: getFilteredData(action.payload, state.responseData),
      };
    case C.CLEAR_USER_EVENT:
      return {
        ...initialState,
      };
    default:
      return {
        ...state,
      };
  }
};

export default reducer;
