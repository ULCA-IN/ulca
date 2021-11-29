const localization_EN_Data = {
  sourceLanguage: "Source Language",
  targetLanguage: "Target Language",
  datasetType: "Dataset Type",
  domain: "Domain",
  collectionMethod: "Collection Method",
  collectionSource: "Collection Source",
  license: "License",
  submitterName: "Submitter",
  alignmentTool: "Alignment Tool",
  minScore: "Min Score",
  maxScore: "Max Score",

  editingTool: "Editing Tool",
  translationModel: "Translation Model",
  datasetId: "Dataset Id",
  channel: "Channel",
  gender: "Gender",
  format: "Format",
  bitsPerSample: "Bits Per Sample",
  dialect: "Dialect",
  snrTool: "Snr Tool",
  collectionDescription: " Collection Description",
  ocrTool: "Ocr Tool",
  dpi: "Dpi",
  imageTextType: "Image Text Type",
  score: "Score",
  samplingRate: "Sampling Rate",
  countOfTranslations: "Count Of Translations",
  minNoOfSpeakers: "Min No Of Speakers",
  maxNoOfSpeakers: "Max No Of Speakers",
  noOfSpeakers: "No Of Speakers",
  minAge: "Min Age",
  maxAge: "Max Age",
  age: "Age",

  "label.sourceLanguage": "Source Language",
  "label.downloadAll": "Download All",
  "label.downloadSample": "Download sample",
  "button.openDialog": "Open dialog",
  "link.meity": "www.meity.gov.in",
  "link.contactUs": "contact@bhashini.gov.in",
  "label.addressInfo":
    "Electronics Niketan, 6, CGO Complex, Lodhi Road, New Delhi - 110003",
  "link.joinBhashaDaan": "Join Bhasha Daan",
  "link.ecosystem": "Ecosystem",
  "link.whitePaper": "Whitepaper",
  "label.copyright": "Copyright @2021 NLTM. All Rights Reserved.",
  "label.nltm": "NLTM: National Language Translation Mission",
  "label.jsNote":
    "JavaScript must be enabled to access this site. Supports : Firefox, Google Chrome, Internet Explorer 10.0+, Safari",
  "label.lastUpdated": "Last reviewed and updated on:16–Jun-2021",
  "label.technologyDevelopment":
    "Technology Development for Indian Languages Programme",
  "link.webInfo": "Web Information Manager",
  "link.privacyPolicy": "Privacy Policy",
  "link.termsAndConditions": "Terms of Use",
  "label.address": "Address",
  "label.mail": "Mail",
  "label.web": "Web",
  "label.ulca": "ULCA",
  "label.dataset": "Dataset",
  "label.model": "Model",
  "label.logOut": "Log out",
  "button.gotoMyContrib": "Go to My Contribution",
  "label.totalCount": "Total Count",
  "label.noRecordsFound": "No records found.",
  "button.refresh": "Refresh",
  "button.backToMySearch": "Back to My Searches",
  "label.searchQueryMsg": "Your search query has been submitted.",
  "label.serviceReqNo": "Your Service Request Number is",
  "label.searchResult": "The result will be displayed once it is ready.",
  "label.searchResultHere": "Your search result will appear here  ",
  "button.errorSummary": "Error Summary",
  "button.detailErrorLog": "Detailed Error Logs",
  "button.clearAll": "Clear All",
  "label.datasetType": "Dataset Type",
  "label.status": "Status",
  "button.apply": "Apply",
  "label.myContrib": "My Contribution",
  "button.filter": "Filter",
  "button.submit": "Submit",
  "button.submitDataset": "Submit Dataset",
  "label.howToSubmit": "How to submit dataset?",
  "label.zipFormatMsg": "Make sure the dataset is available in .zip format.",
  "link.googleDriveLink": "https://sites.google.com/site/gdocs2direct/home",
  "label.datasetStoredMsg": "Provide the URL where the dataset is stored at.",
  "label.urlDownload": "Make sure the URL is a direct download link.",
  "label.datasetName": "Provide a meaningful name to your dataset.",
  "label.modelLeaderboard": "Model Leaderboard",
  "button.close": "Close",
  "label.engHinCorpus": "English-Hindi Parallel Text Corpus",
  "label.congratulations": "Congratulations",
  "label.emailVerifiedMsg": "Your email address has been verified. ",
  "link.proceedToLogin": "Proceed to login.",
  "label.ulcaFullForm": "Universal Language Contribution API",
  "label.ulcaInfo":
    "ULCA is an open-sourced API and data platform to collect, curate and discover datasets in Indian languages.",
  "label.readymadeDataset": "Readymade Dataset",
  "button.convert": "Convert",
  "label.maxDuration": "Max duration: 1 min",
  "label.transcriptionNote":
    "Transcription is best if you directly speak into the microphone and the performance might not be the same if you use it over a conference call.",
  "label.disclaimer": "Disclaimer : ",
  "label.output": "Output",
  "label.notes": "Notes",
  "button.translate": "Translate",
  "label.description": "Description",
  "label.tryModel": "Try Model",
  "label.backToModelList": "Back to Model List",
  "label.backToMyContrib": "Back to My Contribution",
  "label.exploreModels": "Explore Models",
  "label.modalTask": "Select Model Task",
  "button.clear": "Clear",
  "label.errorLogs": "Error Logs",
  "label.benchmarkDataset": "Benchmark Dataset",
  "label.metric": "Metric",
  "label.score": "Score",
  "label.benchmarkRunDate": "Benchmark Run Date",
  "label.domain": "Domain",
  "label.submitModel": "Submit Model",
  "label.howToSubmitModel": "How to submit model?",
  "label.instructions1": "Provide a meaningful name to your model.",
  "label.instructions2":
    "Browse the file containing the parameters of the model.",
  "label.instructions3": "Make sure the file should be in JSON format.",
  "label.task": "Task",
  "label.hostedInferenceTranslation":
    "Once you enter some input in Source language, ULCA will hit the inference endpoint of the hosted model, to get the translation. This can cause a slight delay in receiving the response.",
  "label.hostedInferenceASR":
    "Please start speaking after the listening model is enabled. Once you start speaking, ULCA will hit the inference endpoint of the hosted model, to get the transcription.",
  "button.cancel": "Cancel",
};

export function translate(locale_text) {
  return localization_EN_Data[locale_text]
    ? localization_EN_Data[locale_text]
    : "";
}
