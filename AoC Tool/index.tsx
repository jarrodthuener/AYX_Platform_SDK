import React, { useContext, useEffect, useRef, useState, ChangeEvent} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { AyxAppWrapper, Box, Grid, FormControl, InputLabel, Input,TextField, Accordion, AccordionDetails, InputAdornment, IconButton, NumericInput, FormControlLabel, Button, Checkbox , Card, CardContent, Switch, CardActions, Typography, makeStyles } from '@alteryx/ui';
import { Alteryx, Folder, File, X } from '@alteryx/icons';
import { Context as UiSdkContext, DesignerApi, JsEvent } from '@alteryx/react-comms';
import { type } from 'os';
import { alpha } from '@material-ui/core/styles'


const App = () => {
  const [model, handleUpdateModel] = useContext(UiSdkContext);

  // // Dev Harness Specific Code ---------- Start
  // // The following code is specifically a dev harness functionality.
  // // If you're developing a tool for Designer, you'll want to remove this
  // // and check out our docs for guidance 
  // useEffect(() => {
  //   handleUpdateModel(model)
  // }, []);
  // // Dev Harness Specific Code ---------- End

  // const handleUpdateFolder = event =>{
  //   const newModel = { ...model };
  //   console.log('folder input:',event.target);
  //   newModel.Configuration = { ...newModel.Configuration, filePath: event.target.value };
  //   console.log('new model:', newModel)
  //   handleUpdateModel(newModel);
  // };

  const handleNumber = (key) => value =>{
    const newModel = { ...model };
    console.log('handleNumber',{value});
    newModel.Configuration = { ...newModel.Configuration, [key]: value };
    handleUpdateModel(newModel);
    // Check if the year is set to current level and if the day is above today's day - reset to today if so.
    if (key == "year" && value == String(currentYear) && model.Configuration.day > currentDay){
      console.log("the day is set to a number greater than today, so reset to max day")
      const newModel = { ...model };
      newModel.Configuration = { ...newModel.Configuration, day: currentDay };
      handleUpdateModel(newModel);
    }
  };

  const handleSessionId = event =>{
    const newModel = { ...model };
    console.log('HandleText',{event});
    newModel.Configuration = { ...newModel.Configuration, sessionID: event.target.value };
    handleUpdateModel(newModel);
  };

  const handleFolderPath = event =>{
    const newModel = { ...model };
    console.log('HandleText',{event});
    newModel.Configuration = { ...newModel.Configuration, folderPath: event.target.value };
    handleUpdateModel(newModel);
  };

  // const handleCheckbox = event =>{
  //   const newModel = { ...model };
  //   console.log('HandleText',event.target.value);
  //   newModel.Configuration = { ...newModel.Configuration, customDate: String(event.target.value) };
  //   handleUpdateModel(newModel);
  // }

  // const handleCheckedChange = () => {
  //   const newModel = { ...model };
  //   newModel.Configuration = { 
  //     ...newModel.Configuration, 
  //     customDate: !newModel.Configuration.customDate 
  //   };
  //   handleUpdateModel(newModel);
  // };

  // const handleConfigMetaData = (key) => (_, newValue) => {
  //   // console.log('Checkbox at beg of handlConfigMetaData:',model.Configuration.customDate);
  //   // copy model to newModel
    
  //   const newModel = { ...model };
  //   newModel.Configuration = { ...newModel.Configuration, [key]: newValue };
  //   handleUpdateModel(newModel);



  //   // console.log('pre-configuration', newModel.Configuration);
  //   // // destructuring assignment for the configuration
  //   // const { Configuration } = newModel;
  //   // console.log('post-configuration', key);
  //   // console.log('post-configuration', newValue);
  //   // console.log('handleConfigMetaData', { _, newValue, prevValue: Configuration[key], key })
  //   // Configuration[key] = newValue;
  //   // handleUpdateModel(newModel);
  //   // console.log('Checkbox at end of handleConfigMetaData:',String(model.Configuration.customDate));
  // };


  const useStyles = makeStyles({
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)'
    }
  });


  // const [darkMode, setDarkMode] = useState(model.Configuration.darkMode.toLowerCase === 'true');
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;

  console.log('Checkbox at end of Script:',model.Configuration.customDate);
  

  const booleanValue = model.Configuration.customDate.toLowerCase() === 'true';
  const darkModeBoolean = model.Configuration.darkMode.toLowerCase() === 'true';

  const setChecked = (val) => {
    const newModel = { ...model };
    newModel.Configuration.customDate = val;
    handleUpdateModel(newModel);
  }

  const handleDarkModeUpdate = (val) =>{
    const newModel = { ...model };
    newModel.Configuration.darkMode = val;
    handleUpdateModel(newModel);
  }


  const currentYear = new Date().getFullYear()
  const currentDay = new Date().getDate()

  function getMaxDay() {
    if (model.Configuration.year == currentYear ) {
      // console.log("currentDay: ",currentDay)
      return currentDay;
    } else {
      return 25
    }
  }

  return (
    <AyxAppWrapper locale="en" paletteType={darkModeBoolean ?   'dark' : 'light'}> 
      <Box p={4}>
        <Grid container spacing={4} direction="column" >
          <Grid item>
            <InputLabel htmlFor="simple-numeric-input">Type folder path where you want to save the data</InputLabel>
            <TextField fullWidth id="standard-uncontrolled" label="Folder Path" value={model.Configuration.folderPath} onChange={handleFolderPath}/>
          </Grid>
          <Grid item>
            <TextField fullWidth id="standard-uncontrolled" label="Session ID" value={model.Configuration.sessionID} onChange={handleSessionId}/>
          </Grid>
        </Grid>
        <Grid container spacing ={8} direction = "column">
          <Grid item>
            <FormControlLabel control={<Checkbox />} checked={booleanValue}  onChange={() => setChecked(String(!booleanValue))} label="Download Previous Day" labelPlacement="end"  />
            {/* <FormControlLabel control={<Checkbox />} checked={booleanValue}  onChange={() => setChecked(String(!booleanValue))} label="Download Previous Day" labelPlacement="end"  /> */}
          </Grid>
          <Grid item>
            <Grid container spacing={8} direction="row" >
              {booleanValue &&
              <FormControl  >
                <Grid item xs>
                    <InputLabel htmlFor="simple-numeric-input">Choose Year</InputLabel>
                    <NumericInput id="simple-numeric-input" min={2015} max={currentYear} type='number' value={model.Configuration.year} onChange={handleNumber('year')}/>
                </Grid>
              </FormControl>}
              {booleanValue &&
              <FormControl /*</Grid>disabled={!Boolean(booleanValue)}*/ >
                <Grid item xs>
                      <InputLabel htmlFor="simple-numeric-input">Choose Day</InputLabel>
                      <NumericInput id="simple-numeric-input" min={1} max={getMaxDay()} type='number' value={model.Configuration.day} onChange={handleNumber('day')}/>
                </Grid>
              </FormControl>}
            </Grid>
          </Grid>
          <Grid item>
            <FormControlLabel control={<Switch />} checked={darkModeBoolean} onChange={() => handleDarkModeUpdate(String(!darkModeBoolean))}  label="Dark Mode" />
          </Grid>

        </Grid>
      </Box>
    </AyxAppWrapper>
  )
}

const Tool = () => {
  return (
    <DesignerApi messages={{}}defaultConfig={
      { 
        Configuration: { folderPath:"", year:"2022" , day:"1", customDate:"true", sessionID:"", darkMode:"true"}, //need a sample value for our fieldSelect above so when we first open the tool it doesn't error.
        Meta: { }
      }
    }>
      <AyxAppWrapper> 
        <App />
      </AyxAppWrapper>
    </DesignerApi>
  )
}

ReactDOM.render(
  <Tool />,
  document.getElementById('app')
);
