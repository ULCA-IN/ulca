import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  CardContent,
  Card,
  Popper,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import DatasetStyle from "../../../../styles/Dataset";
import { Autocomplete } from "@material-ui/lab";
import GetTransliterationText from "../../../../../redux/actions/api/Model/ModelSearch/GetTransliterationText";
import { useDispatch, useSelector } from "react-redux";
import APITransport from "../../../../../redux/actions/apitransport/apitransport";
import {
  setTransliterationText,
  setCurrentText,
  clearTransliterationResult,
} from "../../../../../redux/actions/api/Model/ModelSearch/SetTransliterationText";
import LightTooltip from "../../../../components/common/LightTooltip";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import { translate } from "../../../../../assets/localisation";
import { getLanguageName } from "../../../../../utils/getLabel";

function HostedInferTransliteration(props) {
  const { classes, target } = props;
  const dispatch = useDispatch();
  const { result, currentText, transliterationText } = useSelector(
    (state) => state.getTransliterationText
  );

  const [sourceLanguage, setSourceLanguage] = useState({
    value: "en",
    label: "English",
  });
  const srcLang = getLanguageName(props.source);
  const tgtLang = getLanguageName(props.target);

  const inputRef = useRef(null);

  const [transliteration, setTransliteration] = useState("");
  const [shouldFetchData, setShouldFetchData] = useState(true);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [startPositionOfCurrentWord, setStartPositionOfCurrentWord] = useState(0);
  const [curserIndexPosition, setCurserIndexPosition] = useState(0);
  const [isInsertingInMiddle, setIsInsertingInMiddle] = useState(false);
  const [currentCaretPosition, setCurrentCaretPosition] = useState(0);


  const setTransliterateValues = (e) => {
    console.log("called after translation");
    let inputValue = e.target.value;
    let currentCurserPosition = e.target.selectionStart;

    if (e.target.selectionStart < e.target.value.length) {
      setIsInsertingInMiddle(true);
      console.log(e.target.selectionStart, e.target.value.length );
      currentCurserPosition = e.target.selectionStart
    } else {
      setIsInsertingInMiddle(false);
    }

    let startingPositionOfWord;
    setTransliteration(inputValue);
    setCurserIndexPosition(currentCurserPosition);

    if(isInsertingInMiddle){
      startingPositionOfWord = inputValue.lastIndexOf(" ", currentCurserPosition-1);
      console.log("reachable..... 72", startingPositionOfWord);
    } else {
      startingPositionOfWord = inputValue.lastIndexOf(" ", currentCurserPosition - 1);
    }

    setStartPositionOfCurrentWord(startingPositionOfWord);
    setCurrentCaretPosition(inputRef.current.selectionStart);
    let setValuesOnTimeOut = setTimeout(() => {
      console.log("reachable..... 80");
      let activeWord = inputValue.slice(startingPositionOfWord, currentCurserPosition);
      // inputRef.current.selectionStart = currentCurserPosition;
      // setTimeout(() => {
        if (shouldFetchData) {
          dispatch(setCurrentText(startingPositionOfWord < 0 ? inputValue : ` ${activeWord}`));
          console.log("86 ----> inputValue " + inputValue + ", activeWord" + activeWord );
          console.log("87 ----> startingPositionOfWord " + startingPositionOfWord + ", currentCurserPosition" + currentCurserPosition );
          console.log("current Text ..... ", "`" + currentText + "`");
        } else {
          dispatch(clearTransliterationResult());
          return false;
        }
    }, 200);
    
      setTimeout(() => {
        console.log("current caret position is ---- ", currentCaretPosition);
      }, 300);
    return () => clearInterval(setValuesOnTimeOut);
  };

  const handleKeyDown = (e) => {
    // setShouldFetchData(e.key === "Backspace" ? false : true);
    
    if (e.key === " " && currentText && result.length > 0) {
      e.preventDefault();
      let currentWordLength = result[0].length;
      dispatch(
        setTransliterationText(transliteration, isInsertingInMiddle ? ` ${result[0]} ` : ` ${result[0]} `, startPositionOfCurrentWord < 0 ? startPositionOfCurrentWord + 1 : startPositionOfCurrentWord, curserIndexPosition)
      );
      dispatch(setCurrentText(""));
      dispatch(clearTransliterationResult());
      setTimeout(() => {
        if(isInsertingInMiddle){
          inputRef.current.setSelectionRange(startPositionOfCurrentWord + currentWordLength + 2, startPositionOfCurrentWord + currentWordLength + 2);
        }  
      }, 0);
    } else if (e.key === "Enter" && currentText && result.length > 0) {
      e.preventDefault();
      let currentWordLength = result[0].length;
      dispatch(
        setTransliterationText(transliteration, isInsertingInMiddle ? ` ${result[0]} ` : ` ${result[0]} `, startPositionOfCurrentWord < 0 ? startPositionOfCurrentWord + 1 : startPositionOfCurrentWord, curserIndexPosition)
      );
      dispatch(setCurrentText(""));
      dispatch(clearTransliterationResult());
      console.log(curserIndexPosition + "  curserIndexPosition" );
      setTimeout(() => {
        if(isInsertingInMiddle){
          inputRef.current.setSelectionRange(startPositionOfCurrentWord + currentWordLength + 2, startPositionOfCurrentWord + currentWordLength + 2);
        }  
      }, 0);
    }
    // setTimeout(() => {
    //   inputRef.current.setSelectionRange(currentCaretPosition, currentCaretPosition);
    //   }, 1000);
  }

  useEffect(() => {
    if (isFirstRender) {
      setTransliteration(" ");
      dispatch(setCurrentText(" "));
      setTimeout(() => {
        getTransliterationText();
        setIsFirstRender(false);
      }, 0);
    }
    // Update the document title using the browser API
  });


  const getTransliterationText = () => {
    const apiObj = new GetTransliterationText(target, currentText);
    console.log(apiObj, "apiObj")
    dispatch(APITransport(apiObj));
  };

  useEffect(() => {
    setTransliteration(transliterationText);
    dispatch(clearTransliterationResult());
  }, [transliterationText]);

  useEffect(() => {
    if (!!currentText) getTransliterationText();
  }, [currentText]);

  useEffect(() => {
    let timeOutCall =  setTimeout(() => {
      if (transliteration[transliteration.length - 1] === " " && result.length) {
        // const transliterationArr = transliteration.split(" ");
        // transliterationArr.pop();
        let currentWordLength = result ? result[0].length : 0;
        dispatch(
          setTransliterationText(transliteration, isInsertingInMiddle ? ` ${result[0]}` : ` ${result[0]} `, startPositionOfCurrentWord < 0 ? startPositionOfCurrentWord + 1 : startPositionOfCurrentWord, curserIndexPosition)
        );
        dispatch(clearTransliterationResult());
        if(isInsertingInMiddle){
          inputRef.current.setSelectionRange(currentCaretPosition + 1, currentCaretPosition + 1);        
        }
        setTimeout(() => {
          if(isInsertingInMiddle){
            inputRef.current.setSelectionRange(startPositionOfCurrentWord + currentWordLength + 2, startPositionOfCurrentWord + currentWordLength + 2);
          }  
        }, 0);
      }
    }, 3000);
    return () => clearTimeout(timeOutCall);
  }, [transliteration]);
  console.log(transliteration, "transliteration")


  return (
    <Grid
      className={classes.gridCompute}
      item
      xl={12}
      lg={12}
      md={12}
      sm={12}
      xs={12}
    >
      <Card className={classes.hostedCard}>
        <CardContent className={classes.translateCard}>
          <Grid container className={classes.cardHeader}>
            <Grid
              item
              xs={4}
              sm={4}
              md={4}
              lg={4}
              xl={4}
              className={classes.headerContent}
            >
              <Typography variant="h6" className={classes.hosted}>
                Hosted inference API{" "}
                {
                  <LightTooltip
                    arrow
                    placement="right"
                    title={translate("label.hostedInferenceTranslation")}>
                    <InfoOutlinedIcon
                      className={classes.buttonStyle}
                      fontSize="small"
                      color="disabled"
                    />
                  </LightTooltip>
                }
              </Typography>

            </Grid>
            <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
              <Typography variant="h6" className={classes.hosted}>
                {tgtLang}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
        <CardContent>
          <Autocomplete
            freeSolo
            clearOnBlur={false}
            disableClearable={true}
            options={!currentText ? [] : result.map((elem) => elem)}
            onKeyDown={handleKeyDown}
            PopperComponent={(params) => (
              <Popper
                {...params}
                placement='bottom-start'
                style={{ width: window.innerWidth > 776 ? window.innerWidth * 0.15 : window.innerWidth < 450 ? window.innerWidth * 0.5 : window.innerWidth * 0.3 }}
                onClick={(e) => {
                  let currentWordLength = e.target.outerText.length;
                  dispatch(
                    setTransliterationText(
                      transliteration,
                      isInsertingInMiddle ? ` ${e.target.outerText}` : ` ${e.target.outerText} `, startPositionOfCurrentWord < 0 ? startPositionOfCurrentWord + 1 : startPositionOfCurrentWord, curserIndexPosition
                    )
                  )
                  setTimeout(() => {
          if(isInsertingInMiddle){
            inputRef.current.setSelectionRange(startPositionOfCurrentWord + currentWordLength + 2, startPositionOfCurrentWord + currentWordLength + 2);
          }  
        }, 0);
                }
                }
              />
            )}
            sx={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                variant="outlined"
                {...params}
                inputRef={inputRef}
                onKeyDown={handleKeyDown}
                onChange={setTransliterateValues}
              />
            )}
            value={transliteration}
          />
        </CardContent>
      </Card>
    </Grid>
  );
}
export default withStyles(DatasetStyle)(HostedInferTransliteration);