import React, { useContext, useEffect, ChangeEvent, useState} from 'react';
import ReactDOM from 'react-dom';
import { AyxAppWrapper, Box, Grid, Typography, makeStyles, Theme, FormGroup, Autocomplete, TextField, FormControl,Checkbox,FormControlLabel,NumericInput,InputLabel} from '@alteryx/ui';
import { Alteryx } from '@alteryx/icons';
import { Context as UiSdkContext, DesignerApi } from '@alteryx/react-comms';



const useStyles = makeStyles((theme: Theme) => ({
  alteryx: {
    color: theme.palette.brand.corporateBlue,
    height: '125px',
    width: '125px'
  }
}));

const App = () => {
  const classes = useStyles();
  const [model, handleUpdateModel] = useContext(UiSdkContext);

  const generateData = (data) => {
    // If the data isn't filled in, then use these default properties.
    console.log('Full Model', { model })
    console.log({data})
    if (JSON.stringify(data)=="{}" || !data) {
      return ([]); //create a simple lookup table for "missing data" value
    } else { 

    // original Data without an if function Beginning - this is where the original generateDate function started
    // This maps all "items" in the fields section of the incoming model (See model example at the bottom)
    return data?.fields[0][0].fields.map((item) => {      
      item.primary = item.name;
      item.value = item.name;
      // console.log('generateDataItems',item)
      return item 
    });
    //original data without an if function END
  };
  };

  // the handleConfigMetaData function takes the values from the front end and inserts them into the configuration model
  function getFields(input, field) {
    var output = [];
    for (var i=0; i < input.length ; ++i)
        output.push(input[i][field]);
    return output;
  } 
  // This version of the multiselect handler strips the data down to the raw value.
  // const handleConfigMetaData_MultiSelect = (key) => (_, newValue) => {
  //   // copy model to newModel
  //   const newModel = { ...model };
  //   // destructuring assignment for the configuration
  //   const { Configuration } = newModel;
  //   console.log('handleConfigMetaData', { newModel, fieldToEdit: Configuration[key], key, newValue })
  //   Configuration[key] = getFields(newValue,'value');
  //   handleUpdateModel(newModel);
  // };

    // save this version as the working model
    // const handleConfigMetaData_MultiSelect = (key) => (_, newValue) => {
    //   // copy model to newModel
    //   const newModel = { ...model };
    //   // destructuring assignment for the configuration
    //   const { Configuration } = newModel;
    //   console.log('handleConfigMetaData', { newModel, fieldToEdit: Configuration[key], key, newValue })
    //   Configuration[key] = newValue;
    //   handleUpdateModel(newModel);
    // };

  const mapAutoCompleteFields = (data) => {
    data.reduce((acc, v) => {
      const thing = data.find((item) => item.primary === v);
      acc.push(thing);
      return acc;
    }, [])
  };

  // save this version as the working model
  const handleConfigMetaData_MultiSelect = (key) => (_, newValue) => {
    // copy model to newModel
    const newModel = { ...model };
    // destructuring assignment for the configuration
    const { Configuration } = newModel;
    console.log('handleConfigMetaData', { newModel, fieldToEdit: Configuration[key], key, newValue })
    Configuration[key] = newValue;
    // Configuration[key] = mapAutoCompleteFields(newValue);
    handleUpdateModel(newModel);
  };

  // handle the other elements here - THis is working code below
  const handleConfigMetaData = (key) => (_, newValue) => {
    // copy model to newModel
    const newModel = { ...model };
    console.log('pre-configuration', newModel.Configuration);
    // destructuring assignment for the configuration
    const { Configuration } = newModel;
    console.log('post-configuration', newModel.Configuration);
    console.log('handleConfigMetaData', { newValue, fieldToEdit: Configuration[key], key })
    Configuration[key] = newValue;
    handleUpdateModel(newModel);
  };

  // this is scott's code
  // const handleConfigMetaData = (key) => (_, newValue) => {
  //   let newModel = model;
  //   console.log('pre-configuration', newModel.Configuration);

  //   newModel.Configuration[key] = newValue;
    
  //   console.log('post-configuration', newModel.Configuration);
    
  //   handleUpdateModel(newModel);
  // };

  const handleChange_WithKey = (key) => event =>{
    const newModel = { ...model };
    console.log('HandleData',{event,key});
    newModel.Configuration = { ...newModel.Configuration, [key]: event.target.value };
    handleUpdateModel(newModel);
  };

  const handleTextChange = event =>{
    const newModel = { ...model };
    console.log('HandleText',{event});
    newModel.Configuration = { ...newModel.Configuration, suffix: event.target.value };
    handleUpdateModel(newModel);
  };


  // const handleChange_universal = e => {
  //   const {name , value} = e.target
  //   setState( prevState => ({
  //     ...prevState,
  //     [name] : value
  //   }))
  // };

  const handleNumber = (key) => value =>{
    const newModel = { ...model };
    console.log('handleNumber',{value});
    newModel.Configuration = { ...newModel.Configuration, [key]: value };
    handleUpdateModel(newModel);
  };


  const handleRowsChange = value => {
    const newModel = { ...model };
    newModel.Configuration = { ...newModel.Configuration, rows: value };
    handleUpdateModel(newModel);
  };

  const handleChooseNumber = value =>{
    const newModel = { ...model };
    console.log('chooseNumber',{value});
    newModel.Configuration = { ...newModel.Configuration, chooseNumber: value };
    handleUpdateModel(newModel);
  };

  //const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // do the rest here
  //}

  const getValue = () => {
    const value = model.Configuration.autocomplete.map((item) => item.primary)
    console.log('getValue',{value})
    return value
  }

  const reduceMeta = (dataObj) => dataObj.reduce((acc, curr) => {
    console.log('dataObj in reduceMeta',dataObj)
    const index = acc.findIndex(item => item.primary === curr.primary)
    index > -1 ? acc[index].value += curr.value : acc.push({
      primary: curr.primary,
      value: curr.value
    })
    console.log('acc from reduceMeta',{acc})
    return acc
  }, [])


  // Dev Harness Specific Code ---------- Start
  // The following code is specifically a dev harness functionality.
  // If you're developing a tool for Designer, you'll want to remove this
  // and check out our docs for guidance 
  useEffect(() => {
    
    // console.log('->in custom useEffect for Jarrod<--');
    // console.log('=> model:', model);
    // console.log('=> config:', model);
    
    handleUpdateModel(model)
  }, []);
  // Dev Harness Specific Code ---------- End

  return (
    <Box p={4}>
     <Grid container spacing={4} direction="column" alignItems="center">
        <Grid item>
          <Alteryx className={classes.alteryx} />
        </Grid>
          <Grid item md={3} sm={6} xs={12}>
              <Box p={2}> 
                <Autocomplete
                  getOptionLabel={option => option.primary} // tells the tool what value to show for selection
                  multiple 
                  value={reduceMeta(model.Configuration.autocomplete)}
                  options={generateData(model.Meta)} // we are using the model.Meta section to generate a list of options to choose from.                 
                  id="Autocomplete"
                  disableCloseOnSelect
                  getOptionSelected={(option, value) => option.primary === value.primary} 
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      id="ac-meta"
                      label="Select Date Field"
                      margin="normal"
                    />
                  )}
                  onChange={handleConfigMetaData_MultiSelect('autocomplete')} // this is how we update the model (metadata that we pass through to python)
                />
              </Box>
              <Box p={2}> 
                <Autocomplete
                  getOptionLabel={option => option.primary} // tells the tool what value to show for selection
                  options={generateData(model.Meta)} // we are using the model.Meta section to generate a list of options to choose from.                 
                  id="Autocomplete-SingleSelect"
                  // multiple
                  getOptionSelected={(option, value) => option.primary === value.primary} 
                  value={model.Configuration.singleselect}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      id="ac-meta"
                      label="Select Date Field"
                      margin="normal"
                    />
                  )}
                  // onChange={handleChange_WithKey('singleselect')} // this is how we update the model (metadata that we pass through to python)
                  onChange={handleConfigMetaData('singleselect')} // this is how we update the model (metadata that we pass through to python)
                />
              </Box>
              <Grid container justify="center">
                <FormControl component="fieldset">
                  <FormGroup aria-label="position" name="position"  >
                    <FormControlLabel control={<Checkbox />} label="End" labelPlacement="end" checked={model.Configuration.checkbox1} onChange={handleConfigMetaData('checkbox1')} />
                    <FormControlLabel control={<Checkbox />} label="Checkbox2" labelPlacement="end" checked={model.Configuration.checkbox2} onChange={handleConfigMetaData('checkbox2')} />
                  </FormGroup>
                </FormControl>
              </Grid>
              <Grid item md={3} sm={6} xs={12}>
                <TextField id="suffix" label="With Placeholder" placeholder="Enter Suffix for new fields" value={model.Configuration.suffix} onChange={handleTextChange} />
                {/* onChange={handleTextChange} */}
              </Grid>
              <Grid>
                <FormControl>
                  <InputLabel htmlFor="simple-numeric-input">Choose a number</InputLabel>
                  <NumericInput id="simple-numeric-input" 
                  type='number'
                  value={model.Configuration.chooseNumber} 
                  onChange={handleNumber('chooseNumber')}
                  // onChange={handleChooseNumber} 
                  />
                </FormControl>
              </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

const Tool = () => {
  return (
    <DesignerApi messages={{}}defaultConfig={
      { 
        Configuration: { autocomplete: [], singleselect: [], suffix:"" ,checkbox1: true, checkbox2:false, chooseNumber:"100"}, //need a sample value for our fieldSelect above so when we first open the tool it doesn't error.
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