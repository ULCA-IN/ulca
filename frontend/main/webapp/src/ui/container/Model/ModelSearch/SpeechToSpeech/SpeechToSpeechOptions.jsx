import {
  Grid,
  Card,
  Typography,
  CardContent,
  Button,
  TextField,
  Tabs,
  Tab,
  AppBar,
  MuiThemeProvider,
  createTheme,
} from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import { translate } from "../../../../../assets/localisation";
import DatasetStyle from "../../../../styles/Dataset";
import MyAccordion from "../../../../components/common/Accordion";
import TabPanel from "../../../../components/common/TabPanel";

const SpeechToSpeechOptions = (props) => {
  const {
    classes,
    audio,
    recordAudio,
    AudioReactRecorder,
    Stop,
    handleStartRecording,
    Start,
    handleStopRecording,
    data,
    handleCompute,
    onStopRecording,
    url,
    error,
    handleSubmit,
    setUrl,
    setError,
    output,
    handleTextAreaChange,
    textArea,
    makeTTSAPICall,
    makeTranslationAPICall,
    index,
    handleTabChange,
    clearAsr,
    clearTranslation,
  } = props;

  const renderVoiceRecorder = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          {recordAudio === "start" ? (
            <div className={classes.center}>
              <img
                src={Stop}
                alt=""
                onClick={() => handleStopRecording()}
                style={{ cursor: "pointer" }}
              />{" "}
            </div>
          ) : (
            <div className={classes.center}>
              <img
                src={Start}
                alt=""
                onClick={handleStartRecording}
                style={{ cursor: "pointer" }}
              />{" "}
            </div>
          )}
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <div className={classes.center}>
            <Typography style={{ height: "12px" }} variant="caption">
              {recordAudio === "start" ? "Recording..." : ""}
            </Typography>{" "}
          </div>
          <div style={{ display: "none" }}>
            <AudioReactRecorder
              state={recordAudio}
              onStop={onStopRecording}
              style={{ display: "none" }}
            />
          </div>
          <div className={classes.centerAudio}>
            {data ? (
              <audio
                src={data}
                style={{ minWidth: "100%" }}
                controls
                id="sample"
              ></audio>
            ) : (
              <audio
                src="sample"
                style={{ minWidth: "100%" }}
                controls
                id="sample"
              ></audio>
            )}
          </div>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={12} md={10} lg={10} xl={10}>
              <Typography variant={"caption"}>
                {translate("label.maxDuration")}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={2}
              lg={2}
              xl={2}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                color="primary"
                variant="contained"
                size={"small"}
                disabled={data ? false : true}
                onClick={() => handleCompute()}
              >
                Convert
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const renderURLInput = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <TextField
            fullWidth
            color="primary"
            label="Paste the public repository URL"
            value={url}
            error={error.url ? true : false}
            helperText={error.url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError({ ...error, url: false });
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <div
            style={{
              display: "flex",
              marginTop: "5.5vh",
              justifyContent: "center",
            }}
          >
            <audio style={{ minWidth: "100%" }} controls src={url}></audio>
          </div>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Grid container>
            <Grid item xs={12} sm={12} md={10} lg={10} xl={10}>
              <Typography variant={"caption"}>
                {translate("label.maxDuration")}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={2}
              lg={2}
              xl={2}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                color="primary"
                disabled={url ? false : true}
                variant="contained"
                size={"small"}
                onClick={handleSubmit}
              >
                {translate("button.convert")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const renderAccordionDetails = (
    placeholder,
    textAreaLabel,
    value,
    prop,
    input,
    handleSubmitClick,
    handleClearSubmit
  ) => {
    return (
      <Grid container>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <textarea
            disabled
            placeholder={placeholder}
            rows={3}
            value={value}
            className={classes.textArea}
            style={{ color: "grey", border: "1px solid grey" }}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <textarea
            placeholder={textAreaLabel}
            rows={3}
            className={classes.textArea}
            value={input}
            onChange={(e) => handleTextAreaChange(e, prop)}
            style={{ border: "1px solid grey" }}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Grid container spacing="2">
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                color="primary"
                onClick={handleClearSubmit}
              >
                Clear
              </Button>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <Button
                fullWidth
                variant="contained"
                size="small"
                color="primary"
                onClick={handleSubmitClick}
                disabled={input.trim() ? false : true}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const renderAccordion = () => {
    return (
      <div>
        <MyAccordion label={"ASR Output"} color="#D6EAF8">
          {renderAccordionDetails(
            "ASR Output",
            "Corrected ASR Output",
            output.asr,
            "asr",
            textArea.asr,
            makeTranslationAPICall,
            clearAsr
          )}
        </MyAccordion>
        <MyAccordion label={"Translation Output"} color="#E9F7EF">
          {renderAccordionDetails(
            "Translation Output",
            "Corrected Translation Output",
            output.translation,
            "translation",
            textArea.translation,
            makeTTSAPICall,
            clearTranslation
          )}
        </MyAccordion>
      </div>
    );
  };

  const renderOutput = () => {
    return (
      <Card className={classes.asrCard}>
        <Grid container className={classes.cardHeader}>
          <Typography variant="h6" className={classes.titleCard}>
            {`${translate("label.output")}`}
          </Typography>
        </Grid>
        <CardContent
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* <audio src={audio} controls></audio> */}
        </CardContent>
      </Card>
    );
  };

  const getTheme = () =>
    createTheme({
      overrides: {
        PrivateTabIndicator: {
          colorSecondary: {
            backgroundColor: "#2A61AD",
          },
        },
        MuiButton: {
          root: {
            minWidth: "25",
            borderRadius: "none",
          },
          label: {
            textTransform: "none",
            fontFamily: '"Roboto", "Segoe UI"',
            fontSize: "16px",
            //fontWeight: "500",
            //lineHeight: "1.14",
            letterSpacing: "0.16px",
            textAlign: "center",
            height: "19px",
            "@media (max-width:640px)": {
              fontSize: "10px",
            },
          },
          sizeLarge: {
            height: "40px",
            borderRadius: "20px",
          },
          sizeMedium: {
            height: "40px",
            borderRadius: "20px",
          },
          sizeSmall: {
            height: "30px",
            borderRadius: "20px",
          },
        },
        MuiTab: {
          textColorInherit: {
            fontFamily: "Rowdies",
            fontWeight: 300,
            fontSize: "1.125rem",
            textTransform: "none",
            "&.Mui-selected": {
              color: "#2A61AD",
            },
          },
        },
      },
    });

  const renderTabs = () => {
    return (
      <Card className={classes.asrCard}>
        <Grid container className={classes.cardHeader}>
          <MuiThemeProvider theme={getTheme}>
            <AppBar
              className={classes.appTab}
              position="static"
              style={{
                background: "transparent",
                border: "none",
                margin: 0,
                padding: "0% 1vw",
                color: "#3A3A3A",
              }}
            >
              <Tabs value={index} onChange={handleTabChange}>
                <Tab label={"Live Recording Inference"} />
                <Tab label={"Batch Inference"} />
              </Tabs>
            </AppBar>
            <TabPanel value={index} index={0}>
              {renderVoiceRecorder()}
            </TabPanel>
            <TabPanel value={index} index={1}>
              {renderURLInput()}
            </TabPanel>
          </MuiThemeProvider>
        </Grid>
      </Card>
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
        {renderTabs()}
      </Grid>
      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
        {renderOutput()}
      </Grid>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        <Typography variant="h5" style={{ marginBottom: "1%" }}>
          Intermediate Output
        </Typography>
        {renderAccordion()}
      </Grid>
    </Grid>
  );
};

export default withStyles(DatasetStyle)(SpeechToSpeechOptions);
