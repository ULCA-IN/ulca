import React from 'react'
import { useState } from 'react'
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, NativeSelect, Input, Button,CardContent,Card } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import Content from "./Content";
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';


const useStyles = makeStyles((theme) => ({
 
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  formControlmain:{
    marginLeft:"500px" ,
    marginTop:"50px",
   

  }
}));


function Youtube() {
  const classes = useStyles();
  const [gender, setGender] = useState('');
  const [audioUrl, setaudioUrl] = useState("")
  const [domian, setdomian] = useState("");
  const [language, setlanguage] = useState("");
  const[url,seturl] = useState();
  const history =useHistory();
  const [open, setOpen] = React.useState(false);
 
  // const handleToggle = () => {
  //   setOpen(!open);
  // };

   function handleSubmit(e) {
    e.preventDefault();
    let temp=matchYoutubeUrl(audioUrl)
    if (gender !== "" &&
    domian !== "" &&
    language !== ""&&temp) {
      // history.push('/Content')
      console.log('domian', gender )
      setOpen(!open);

      const toSenddata ={ 
        audioUrl,
        domian,
        language,
        gender,
   
       };
      //  console.log('aaaa', url )
      //  let variable = {"data": toSenddata}
      
       fetch('https://dev-auth.ulcacontrib.org/ulca/apis/asr/v1/audio/breakdown', {
        method: 'post',
        body: JSON.stringify( toSenddata),
         headers: {
          "Content-Type": "application/json"
        }
        
      })
      .then(async response => {
       let rsp_data = await response.json();
       console.log(rsp_data)
       setOpen(false);
       seturl(rsp_data)
      })
      console.log( JSON.stringify( toSenddata))
      
    //   fetch('https://dev-auth.ulcacontrib.org/ulca/apis/asr/v1/audio/breakdown',toSenddata,{
    //   method: 'POST',
    //   mode: 'cors',
    //   headers: {
    //     "Content-type": "application/json",
    //     // "Accept": "*/*",
    //     // "Access-Control-Allow-Headers": "*",
    //     // "Access-Control-Allow-Methods": "*",
    //     // "Access-Control-Allow-Origin": "*",
    //     //"Authorization": token
    //   },
    //  body:JSON.stringify(toSenddata)
    // })
    // .then(response => { console.log( response)
    //   return response.json()})
    // .then(json => console.log(json))
    }
   }
   console.log('aaaa', url )

  function matchYoutubeUrl() {
    let regexQuery = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    let res = new RegExp(regexQuery, "i");
    return res.test(audioUrl);

  }

  return (
    <div className={classes.root} >
      
   { url ?  ( <Content url ={url} />): ( <FormControl className={classes.formControlmain}>
      
    
        <Input type="text" placeholder="type youtube url" onChange={(e) => setaudioUrl(e.target.value)} required />

        {/* <Button type="button" onClick={matchYoutubeUrl} > Validate Url</Button> <br></br> */}

        <FormControl className={classes.formControl}>
          <NativeSelect className={classes.selectEmpty}

            value={language}
            name="language"
            onChange={(e) => { setlanguage(e.target.value) }}
            inputProps={{ 'aria-label': 'language' }}
          >
            <option value="" disabled>
              Language
            </option>
            <option value={"englis"}>English</option>
            <option value={"kannad"}>kannada</option>
            <option value={"hindi"}>hindi</option>
            <option value={"tamil"}>tamil</option>
            <option value={"telugu"}>telugu</option>
            <option value={"malayalam"}>malayalam</option>
          </NativeSelect>
        </FormControl>

        <FormControl className={classes.formControl}>
          <NativeSelect className={classes.selectEmpty}

            value={domian}
            name="age"
            onChange={(e) => { setdomian(e.target.value) }}
            inputProps={{ 'aria-label': 'age' }}
          >
            <option value="" disabled>
              Domain
            </option>
            <option value={"general"}>general</option>
            <option value={"news"}>news</option>
            <option value={"education"}>education</option>
            <option value={"healthcare"}>healthcare</option>
            <option value={"agriculture"}>agriculture</option>
            <option value={"automobile"}>automobile</option>
          </NativeSelect>
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel component="legend">Gender</FormLabel>
          <RadioGroup row aria-label="gender" name="gender1" value={gender} onChange={(e) => { setGender(e.target.value) }}>
            <FormControlLabel value="female" control={<Radio />} label="Female" />
            <FormControlLabel value="male" control={<Radio />} label="Male" />
            <FormControlLabel value="other" control={<Radio />} label="Other" />

          </RadioGroup>
        </FormControl>
        <Button variant="contained" size="medium" onClick={handleSubmit}>submit</Button>
       
      </FormControl>)
  }
{console.log(url)}

<Backdrop className={classes.backdrop} open={open} onClick={ handleSubmit}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>

  )
}

export default Youtube;