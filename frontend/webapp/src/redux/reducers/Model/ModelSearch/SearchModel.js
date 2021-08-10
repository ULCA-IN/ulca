import C from '../../../actions/constants';
import getDatasetName from '../../../../utils/getDataset';
import { getLanguageName, FilterByDomain, FilterByCollection } from '../../../../utils/getLabel';

const initialState = {
    responseData: [],
    filteredData: [],
    refreshStatus: false,
    filter: { status: [], modelType: [] },
    selectedFilter: { language: [], domainFilter: [], submitter:[] },
}

const dateConversion = (value) => {

    var myDate = new Date(value);
    let result = (myDate.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }))
    return result.toUpperCase();
}

const getFilterValue = (payload, data) => {
    debugger
    let { filterValues } = payload
    let languageFilter= []
    let  domainFilterValue = []
    let  filterResult = []
    debugger
    if (filterValues && filterValues.hasOwnProperty("language") && filterValues.language.length > 0) {
        languageFilter = data.responseData.filter(value => {
            if ((filterValues.language.includes(value.tLanguage))|| ((filterValues.language.includes(value.sLanguage)))){
                return value
            }
        })

    } else {
        languageFilter = data.responseData
    }
    debugger
    if (filterValues && filterValues.hasOwnProperty("domainFilter") && filterValues.domainFilter.length > 0) {
        domainFilterValue = languageFilter.filter(value => {
            if (filterValues.domainFilter.includes(value.domain)) {
                return value
            }
        })
    }
    else {
        domainFilterValue = languageFilter
    }
    if (filterValues && filterValues.hasOwnProperty("submitter") && filterValues.submitter.length > 0) {
        filterResult = domainFilterValue.filter(value => {
            if (filterValues.submitter.includes(value.domain)) {
                return value
            }
        })
    }
    else {
        filterResult = languageFilter
    }
    debugger
    data.filteredData = filterResult;
    data.selectedFilter = filterValues;
    return data;

}

const getDomainDetails = (data) => {
    if (data.length === 1) {
        return data[0]
    } else {
        let result = ""
        data.length > 1 && data.forEach((element, i) => {
            if (i !== data.length) {
                result = result + element + "|"
            } else {
                result = result + element
            }

        })
        return result;
    }
}

const getClearFilter = (data) => {
    data.filteredData = data.responseData;
    data.selectedFilter = { language: [], domainFilter: [], submitter:[]  }
    return data;
}

const getContributionList = (state, payload) => {
    let responseData = [];
    let languageFilter = [];
    let submitterFilter = [];
    let domainFilter = [];
    let filter = {language: [], domainFilter: [], submitter:[]  }
    let refreshStatus = false;
    payload.forEach(element => {

        let sLanguage = element.languages.length > 0 && element.languages[0].sourceLanguage && getLanguageName(element.languages[0].sourceLanguage)
        let tLanguage = element.languages && element.languages.length > 0 && element.languages[0].targetLanguage && getLanguageName(element.languages[0].targetLanguage)
        let lang = tLanguage ? (sLanguage + " - " + tLanguage) : sLanguage;
        let domain = getDomainDetails(element.domain)
        responseData.push(
            {
                description: element.description,
                submitRefNumber: element.modelId,
                modelName: element.name,
                // submittedOn: dateConversion(element.submittedOn),
                publishedOn: dateConversion(element.publishedOn),
                task: element.task.type,
                domain: domain,
                status: "Published",
                sLanguage,
                tLanguage,
                language: lang,
                refUrl: element.refUrl ? element.refUrl : "NA",
                inferenceEndPoint: element.inferenceEndPoint,
                source: element.languages.length > 0 && element.languages[0].sourceLanguage,
                target: element.languages && element.languages.length > 0 && element.languages[0].targetLanguage,
                licence: element.license,
                submitter: element.submitter.name,
                trainingDataset: element.trainingDataset,
                color: element.status === "Completed" ? "#139D60" : element.status === "In-Progress" ? "#139D60" : element.status === "Failed" ? "#139D60" : "green"
            }

        )
        !languageFilter.includes(sLanguage) && languageFilter.push(sLanguage)
        !languageFilter.includes(tLanguage) && languageFilter.push(tLanguage)
        !domainFilter.includes(domain) && domainFilter.push(domain)
        !submitterFilter.includes(element.submitter.name) && submitterFilter.push(element.submitter.name)
    });

    filter.language = [...(new Set(languageFilter))];
    filter.domainFilter = [...(new Set(domainFilter))];
    filter.submitter = [...(new Set(submitterFilter))];


    responseData = responseData.reverse()
    let filteredData = getFilterValue({ "filterValues": state.selectedFilter }, { "responseData": responseData })
    filteredData.filter = filter
    return filteredData
}

const getSearchedList = (state, searchValue) => {
    let results = [];
    let searchKey = ["domain", "modelName", "status", "submitter"];
    for (var i = 0; i < state.responseData.length; i++) {
        Object.keys(state.responseData[i]).forEach((key) => {
            if (searchKey.indexOf(key) > -1) {
                if (state.responseData[i][key].toLowerCase().includes(searchValue.toLowerCase())) {
                    results.push(state.responseData[i]);
                }
            }
        })
    }
    return {
        ...state,
        filteredData: !searchValue ? state.responseData : results
    }
}

const reducer = (state = initialState, action) => {
    switch (action.type) {

        case C.SUBMIT_MODEL_SEARCH:
            return getContributionList(state, action.payload);

        case C.GET_SEARCHED_LIST:
            return getSearchedList(state, action.payload)
        case C.SEARCH_FILTER:
            return getFilterValue(action.payload, state);
        case C.CLEAR_FILTER_MODEL:
            return getClearFilter(state);
        default:
            return {
                ...state
            }
    }
}

export default reducer;



