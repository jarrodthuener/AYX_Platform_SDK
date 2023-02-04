import React, { useContext, useEffect, useRef, useState, ChangeEvent, createContext, Dispatch} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { AyxAppWrapper, Autocomplete, Box, Container, Paper, Tab, Tabs, AppBar, Grid, FormControl, ButtonGroup, InputLabel, 
  Input,TextField, Accordion, AccordionDetails, Typography, InputAdornment, IconButton, NumericInput, FormControlLabel, 
  Button, Checkbox , Card, CardContent, Switch, CardActions, makeStyles } from '@alteryx/ui';
import { Alteryx, Folder, File, X, EyeOff, Eye } from '@alteryx/icons';
import { Context as UiSdkContext, DesignerApi, JsEvent } from '@alteryx/react-comms';
import { type } from 'os';
import { url } from 'inspector';
import { stringify } from 'querystring';
import {endpointMenu} from './server-api';
// import { alpha } from '@material-ui/core/styles'


const App = () => {
  const [model, handleUpdateModel] = useContext(UiSdkContext);

  const [values, setValues] = useState({
    showApiKey: false,
    showApiSecret: false
  });


  const useStyles = makeStyles({
    autoSize: {
      width: 300
    }
  });
  const classes = useStyles();

  const darkModeBoolean = model.Configuration.darkMode.toLowerCase() === 'true';
  const useAuthFromFieldBool = model.Configuration.useAuthFromField.toLowerCase() === 'true';
  const deleteCheckedBoolean = model.Configuration.deleteChecked.toLowerCase() === 'true';
  const fieldEntryParametersBool = model.Configuration.fieldEntryParameters.toLowerCase() === 'true';

  function TabContainer({ children }) {
    return (
      <Typography component="div" style={{ padding: 8 * 3 }}>
        {children}
      </Typography>
    );
  };
  
  TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
    dir: PropTypes.string.isRequired
  };

  const [value, setValue] = useState(0);

  function handleChange(event, newValue) {
    setValue(newValue);
  };

  const [tabValue, setTabValue] = useState(0);
  
  function handleTabChange(event, newValue) {
    setTabValue(newValue);
  };

  const generateData = (data) => {
    // If the data isn't filled in, then use these default properties.
    if (JSON.stringify(data)=="{}" || !data) {
      return ([]); //create a simple lookup table for "missing data" value
    } else { 
    // original Data without an if function Beginning - this is where the original generateDate function started
    // This maps all "items" in the fields section of the incoming model (See model example at the bottom)
    return data?.fields[0][0].fields.map((item) => {      
      item.primary = item.name;
      item.value = item.name;
      return item 
    });
  };
  };

  const methodList = [
    {title: "GET"},
    {title: "POST"},
    {title: "PUT"},
    {title: "DELETE"}
  ];

//   const endpointMenu = {
//     GET: [
//       { title: 'All Collections', endpoint: "/v3/collections", resource:"collections", desc:"Retrieve all accessible collections", urlParams:[""], schema:[]},
//       { title: 'Collection by ID', endpoint: "/v3/collections/{collectionId}", resource:"collections", desc:"Retrieve a collection record", urlParams:["collectionId"], schema:[]},
//       { title: 'All Credentials', endpoint: "/v3/credentials", resource:"credentials", desc:"Retrieve all accessible credentials", urlParams:[], schema:[]},
//       { title: 'Credential by ID', endpoint: "/v3/credentials/{credentialId}", resource:"credentials", desc:"Retrieve a credential record", urlParams:["credentialId"], schema:[]},
//       { title: 'DCME Connection by ID', endpoint: "/v3/DCMEConnections/{connectionId}", resource:"DCMEConnections", desc:"Retrieve a DCM.E Connection", urlParams:["connectionId"], schema:[]},
//       { title: "Job by ID", endpoint: "/v3/jobs/{jobId}", resource:"jobs", desc:"Retrieve a job and its current state", urlParams:["jobId"], schema:[]},
//       { title: 'All Schedules', endpoint: "/v3/schedules", resource:"schedules", desc:"Retrieve all assessible schedules", urlParams:[], schema:[]},
//       { title: 'Schedules by ID', endpoint: "/v3/schedules/{scheduleId}", resource:"schedules", desc:"Retrieve a schedule record", urlParams:["scheduleId","userId"], schema:[]}],
//     POST: [
//       { title: 'All Collections', endpoint: "/v3/collections", resource:"collections", desc:"Retrieve a schedule record", urlParams:["scheduleId","userId"], schema:`{
//   "name": "string"
// }` },
//       { title: 'Collection by ID', endpoint: "/v3/collections/{collectionId}", resource:"collections", desc:"Retrieve a schedule record", urlParams:["scheduleId","userId"], schema:[] },
//       { title: 'All Credentials', endpoint: "/v3/credentials", resource:"credentials", desc:"Retrieve a schedule record", urlParams:["scheduleId","userId"], schema:[] },
//       { title: 'Credential by ID', endpoint: "/v3/credentials/{credentialId}", resource:"credentials", desc:"Retrieve a schedule record", urlParams:["scheduleId","userId"], schema:[] },
//       { title: 'DCME Connection by ID', endpoint: "/v3/DCMEConnections/{connectionId}", resource:"DCMEConnections", desc:"Retrieve a schedule record", urlParams:["scheduleId","userId"], schema:[] },
//       { title: "Job by ID", endpoint: "/v3/jobs/{jobId}", resource:"jobs", desc:"Retrieve a schedule record", urlParams:["scheduleId","userId"], schema:[] },
//       { title: 'All Schedules', endpoint: "/v3/schedules", resource:"schedules", desc:"Retrieve a schedule record", urlParams:["scheduleId","userId"], schema:[] },
//       { title: 'Schedules by ID', endpoint: "/v3/schedules/{scheduleId}", resource:"schedules", desc:"Retrieve a schedule record", urlParams:["scheduleId","userId"], schema:[] }],
//     PUT: [
//       { title: 'All Collections', endpoint: "/v3/collections" },
//       { title: 'Collection by ID', endpoint: "/v3/collections/{collectionId}" },
//       { title: 'All Credentials', endpoint: "/v3/credentials" },
//       { title: 'Credential by ID', endpoint: "/v3/credentials/{credentialId}" },
//       { title: 'DCME Connection by ID', endpoint: "/v3/DCMEConnections/{connectionId}" },
//       { title: "Job by ID", endpoint: "/v3/jobs/{jobId}" },
//       { title: 'All Schedules', endpoint: "/v3/schedules" },
//       { title: 'Schedules by ID', endpoint: "/v3/schedules/{scheduleId}" }],
//     DELETE: [
//       { title: 'All Collections', endpoint: "/v3/collections" },
//       { title: 'Collection by ID', endpoint: "/v3/collections/{collectionId}" },
//       { title: 'All Credentials', endpoint: "/v3/credentials" },
//       { title: 'Credential by ID', endpoint: "/v3/credentials/{credentialId}" },
//       { title: 'DCME Connection by ID', endpoint: "/v3/DCMEConnections/{connectionId}" },
//       { title: "Job by ID", endpoint: "/v3/jobs/{jobId}" },
//       { title: 'All Schedules', endpoint: "/v3/schedules" },
//       { title: 'Schedules by ID', endpoint: "/v3/schedules/{scheduleId}" }]};

console.log({endpointMenu})
  

  // // Dev Harness Specific Code ---------- Start
  // // The following code is specifically a dev harness functionality.
  // // If you're developing a tool for Designer, you'll want to remove this
  // // and check out our docs for guidance 
  // useEffect(() => {
  //   handleUpdateModel(model)
  // }, []);
  // // Dev Harness Specific Code ---------- End


  // EVERY TEXT INPUT NEEDS IT'S OWN HANDLER FUNCTION OTHERWISE, THE BODY WILL RE-RENDER AFTER EVERY KEYSTROKE
  // EVERY TEXT INPUT NEEDS IT'S OWN HANDLER FUNCTION OTHERWISE, THE BODY WILL RE-RENDER AFTER EVERY KEYSTROKE
  // EVERY TEXT INPUT NEEDS IT'S OWN HANDLER FUNCTION OTHERWISE, THE BODY WILL RE-RENDER AFTER EVERY KEYSTROKE
  // EVERY TEXT INPUT NEEDS IT'S OWN HANDLER FUNCTION OTHERWISE, THE BODY WILL RE-RENDER AFTER EVERY KEYSTROKE
  // EVERY TEXT INPUT NEEDS IT'S OWN HANDLER FUNCTION OTHERWISE, THE BODY WILL RE-RENDER AFTER EVERY KEYSTROKE
  // EVERY TEXT INPUT NEEDS IT'S OWN HANDLER FUNCTION OTHERWISE, THE BODY WILL RE-RENDER AFTER EVERY KEYSTROKE
  // EVERY TEXT INPUT NEEDS IT'S OWN HANDLER FUNCTION OTHERWISE, THE BODY WILL RE-RENDER AFTER EVERY KEYSTROKE
  // EVERY TEXT INPUT NEEDS IT'S OWN HANDLER FUNCTION OTHERWISE, THE BODY WILL RE-RENDER AFTER EVERY KEYSTROKE

//  // to handle class objects you have to break down the data into a newValue which equals the json object.
//  const handleResourceEvent = React.useCallback((key) => (_, newValue) =>{
//   console.log({_, newValue})

//   const newModel = { ...model };
//   newModel.Configuration = {...newModel.Configuration, [key]:newValue};
//   handleUpdateModel(newModel);
// }, [model.Configuration]);


  // to handle class objects you have to break down the data into a newValue which equals the json object.
  const handleResourceEvent = (key) => (_, newValue) =>{
    console.log({_, newValue})

    const newModel = { ...model };
    newModel.Configuration = {...newModel.Configuration, [key]:newValue};
    handleUpdateModel(newModel);
  };

  //Handle any event based change
  const handleEvent = (key) => event =>{
    const newModel = { ...model };
    newModel.Configuration = { ...newModel.Configuration, [key]: event.target.value };
    handleUpdateModel(newModel);
  };

  //Handle any event based change
  const handleSecretEvent = (key) => event =>{
    const newModel = { ...model };
    newModel.Secrets = { ...newModel.Secrets, [key]: { text: event.target.value, encryptionMode:'obfuscation'} };
    handleUpdateModel(newModel);
  };

  // //Handle any event based change
  // const handleScheduleIdEvent = React.useCallback((event) =>{
  //   event.preventDefault();
  //   const newModel = { ...model };
  //   newModel.Configuration = { ...newModel.Configuration, 'scheduleId': event.target.value };
  //   handleUpdateModel(newModel);
  // }, [model.Configuration]);

  //Handle any event based change
  const handleScheduleIdEvent = (event) =>{
    const newModel = { ...model };
    newModel.Configuration = { ...newModel.Configuration, 'scheduleId': event.target.value };
    handleUpdateModel(newModel);
  };

  // const handleSubmit = useCallback((orderDetails) => {
  //   post('/product/' + productId + '/buy', {
  //     referrer,
  //     orderDetails,
  //   });
  // }, [productId, referrer]);

  
  // //Handle any event based change
  // const handlePayloadEvent = React.useCallback((event) => {
  //   console.log("payload",event.target)
  //   const newModel = { ...model };
  //   newModel.Configuration = { ...newModel.Configuration, 
  //     'payload': event.target.value };
  //   handleUpdateModel(newModel);
  // }, [model.Configuration]);

  //Handle any event based change
  const handlePayloadEvent = (event) => {
    console.log("payload",event.target)
    const newModel = { ...model };
    newModel.Configuration = { ...newModel.Configuration, 
      'payload': event.target.value };
    handleUpdateModel(newModel);
  };

   //Handle any event based change
   const handleFieldEvent = (key) => event =>{
    const newModel = { ...model };
    newModel.Configuration = { ...newModel.Configuration, [key]: event.target.value };
    handleUpdateModel(newModel);
  };

  const handleSchemaEvent = (key) => event =>{
    const newModel = { ...model };
    newModel.Configuration = {...newModel.Configuration, [key]:event.target.value}
    handleUpdateModel(newModel);
  };

  //Handle any numeric data change
  const handleNumericUpdate = (key) => value =>{
    const newModel = { ...model };
    newModel.Configuration = {...newModel.Configuration, [key]:value};
    handleUpdateModel(newModel);
  };

  // handles any boolean data when passed a string
  const handleBoolUpdate = (key, val) =>{
    const newModel = { ...model };
    newModel.Configuration = {...newModel.Configuration, [key]:val};
    handleUpdateModel(newModel);
  };

//   let params = model.Configuration.endpoint.urlParams
//   const parameterRender = ({params}) => (
    
//       {params.map(param => (
//         <FormControl> 
//           <Grid item xs>
//             <TextField fullWidth id="standard-uncontrolled" label={param} name={param} placeholder="Enter {{param}}" value={model.Configuration.param} onChange={self.handleEvent}/>
//           </Grid>
//         </FormControl>
//     )}
//     );

// // https://stackoverflow.com/questions/32157286/rendering-react-components-from-array-of-objects






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


  const handleMethodGroup = (value) => event => {
    const newModel = { ...model };
    newModel.Configuration = {...newModel.Configuration, "method":value}
    handleUpdateModel(newModel);
  };

  const methodButtonColor = (value) =>{
    if (model.Configuration.method === value) {
      return "primary"
    } else {
      return "default"
    }    
  };

  const handleSchemaCopy = () =>{
    const newModel = { ...model };
    newModel.Configuration = { ...newModel.Configuration, "payload":model.Configuration.endpoint.schema};
    handleUpdateModel(newModel);
  };

  const getPayloadText = () =>{
    return JSON.stringify(model.Configuration.payload,null,2)
  };

  const handleSchemaClick = (value) =>{
    handleSchemaCopy();
  };


  const autoCompleteProps = {
    getOptionLabel: option => option.endpoint,
    disableClearable: true
  };

  

  const handleClickShowApiKey = () => {
    console.log({values});
    setValues({ ...values, showApiKey: !values.showApiKey });
  };

  const handleClickShowApiSecret = () => {
    console.log({values});
    setValues({ ...values, showApiSecret: !values.showApiSecret });
  };


  return (
    <AyxAppWrapper locale="en" paletteType={darkModeBoolean ?   'dark' : 'light'}> 
      <Box p={4}>
      <Container>
        <Paper>
          <AppBar color="default" elevation={0} position="static">
            <Tabs centered indicatorColor="secondary" onChange={handleTabChange} textColor="secondary" value={tabValue}>
              <Tab label="Authentication" />
              <Tab label="API Config" />
            </Tabs>
          </AppBar>
            {/* this is the first tab for the Authentication and base URL */}
            {tabValue === 0 && 
            <Container>Enter base API url, API key, and API Secret to get started.
              <TextField fullWidth id="standard-uncontrolled" name='baseUrl' label="base URL" value={model.Configuration.baseUrl} onChange={handleEvent('baseUrl')}/>
              <Grid item>
                <FormControlLabel control={<Switch />} checked={useAuthFromFieldBool} onChange={() => handleBoolUpdate('useAuthFromField',String(!useAuthFromFieldBool))}  label="Use Auth From field" />
              </Grid>
              {useAuthFromFieldBool && 
                <Autocomplete
                  getOptionLabel={option => option.primary} // tells the tool what value to show for selection
                  options={generateData(model.Meta)} // we are using the model.Meta section to generate a list of options to choose from.                 
                  id="Autocomplete-SingleSelect"
                  getOptionSelected={(option, value) => option.primary === value.primary} 
                  value={model.Configuration.authField}
                  renderInput={(params) => (<TextField {...params} id="ac-meta" label="Select Authorization field" margin="normal"/>)}
                  onChange={handleResourceEvent("authField")} // this is how we update the model (metadata that we pass through to python)
                />
              }
              {!useAuthFromFieldBool && 
                <Grid>
                  <FormControl>
                    <InputLabel htmlFor="adornment-apiKey">API key</InputLabel>
                    <Input endAdornment={
                      <InputAdornment position="end">
                        <IconButton aria-label="Toggle password visibility" edge="end" onClick={handleClickShowApiKey}>
                        {values.showApiKey ? <EyeOff size="small" /> : <Eye size="small" />}
                        </IconButton>
                      </InputAdornment>
                      }
                      id="adornment-apiKey"
                      onChange={handleEvent('apiKey')}
                      type={values.showApiKey ? 'text' : 'password'}
                      value={model.Configuration.apiKey}
                    />
                  </FormControl>
                  <FormControl>
                    <InputLabel htmlFor="adornment-apiSecret">API Secret</InputLabel>
                    <Input endAdornment={
                      <InputAdornment position="end">
                        <IconButton aria-label="Toggle password visibility" edge="end" onClick={handleClickShowApiSecret}>
                        {values.showApiSecret ? <EyeOff size="small" /> : <Eye size="small" />}
                        </IconButton>
                      </InputAdornment>
                      }
                      id="adornment-apiSecret"
                      onChange={handleEvent('apiSecret')}
                      type={values.showApiSecret ? 'text' : 'password'}
                      value={model.Configuration.apiSecret}
                    />
                  </FormControl>
                  
                  {/* the secrets don't work yet, so we need to research how to handle those on the backend. below is the implementation of the secrets object */}
                  {/* <FormControl>
                    <InputLabel htmlFor="adornment-password">API key</InputLabel>
                    <Input endAdornment={
                      <InputAdornment position="end">
                        <IconButton aria-label="Toggle password visibility" edge="end" onClick={handleClickShowApiKey}>
                        {values.showApiKey ? <EyeOff size="small" /> : <Eye size="small" />}
                        </IconButton>
                      </InputAdornment>
                      }
                      id="adornment-password"
                      onChange={handleSecretEvent('apiKey')}
                      type={values.showApiKey ? 'text' : 'password'}
                      value={model.Secrets.apiKey.text}
                    />
                  </FormControl>
                  <FormControl>
                    <InputLabel htmlFor="adornment-password">API Secret</InputLabel>
                    <Input endAdornment={
                      <InputAdornment position="end">
                        <IconButton aria-label="Toggle password visibility" edge="end" onClick={handleClickShowApiSecret}>
                        {values.showApiSecret ? <EyeOff size="small" /> : <Eye size="small" />}
                        </IconButton>
                      </InputAdornment>
                      }
                      id="adornment-password"
                      onChange={handleSecretEvent('apiSecret')}
                      type={values.showApiSecret ? 'text' : 'password'}
                      value={model.Secrets.apiSecret.text}
                    />
                  </FormControl> */}
                </Grid>
              }
            </Container>
            }

            {/* this begins the second tab for the API configuration */}
            {tabValue === 1 && 
            <Container>Choose a single method to run:
              <Grid container spacing={4} direction="column">
                <Grid item lg>
                  <Grid container spacing={8} direction="column" >
                    <Grid item>
                      <Autocomplete
                        className={classes.autoSize}
                        getOptionLabel={option => option.title}
                        renderOption={(option) => (<div>
                              <Typography gutterBottom variant="h3">{option.title}</Typography>
                            </div>)
                          }
                        options={methodList}
                        renderInput={params => <TextField {...params}/>}
                        onChange={handleResourceEvent('method')}
                        value = {model.Configuration.method}
                        getOptionSelected={(option, value) => option.title === value.title}
                      />
                      <Grid item>
                      {model.Configuration.method.title === 'DELETE'  &&
                        <FormControlLabel control={<Switch />} checked={deleteCheckedBoolean} onChange={() => handleBoolUpdate('deleteChecked',String(!deleteCheckedBoolean))}  label="Confirm DELETE Method" />
                      }
                      </Grid>
                    </Grid>


                    {/* provide option to manually enter parameters or gather from input */}
                    <Grid item>
                      <FormControl>
                        <Grid>
                          <InputLabel>Choose {model.Configuration.method.title} Endpoint</InputLabel>
                          <Grid item>
                            <Autocomplete
                            {...autoCompleteProps}
                              className={classes.autoSize}
                              // getOptionLabel={option => option.endpoint}
                              renderOption={(option) => (<div>
                                <Typography gutterBottom variant="h4">{option.endpoint}</Typography>
                                <Typography gutterBottom display='initial' variant="subtitle2">{option.description}</Typography>
                                {/* <Typography gutterBottom variant="subtitle2">{option.desc}</Typography> */}
                                </div>)
                              }
                              groupBy={option => option.resource}
                              options={endpointMenu[model.Configuration.method.title]}
                              renderInput={params => <TextField {...params}/>}
                              onChange={handleResourceEvent('endpoint')}
                              value = {model.Configuration.endpoint}
                              getOptionSelected={(option, value) => option.endpoint === value.endpoint}
                            />
                          </Grid>
                        </Grid>
                      </FormControl>
                    </Grid>

                    <Grid item>
                      <FormControlLabel control={<Switch />} checked={fieldEntryParametersBool} onChange={() => handleBoolUpdate('fieldEntryParameters',String(!fieldEntryParametersBool))}  label="Click to use Fields for Parameters" />
                    </Grid>
                  
                    {fieldEntryParametersBool  &&
                    <Grid>
                      <Grid item>
                        {(model.Configuration.endpoint.urlParams.indexOf('userId') > -1)  &&
                        <FormControl>
                          <Grid item xs>
                            <TextField fullWidth id="standard-uncontrolled" label="userId" name='userId' placeholder="Enter Suffix for new fields" value={model.Configuration.userId} onChange={handleEvent('userId')}/>
                          </Grid>
                        </FormControl>}
                        {/* </Grid>
                        <Grid item> */}
                        {(model.Configuration.endpoint.urlParams.indexOf('scheduleId') > -1)  &&
                        <FormControl>
                          <Grid item xs>
                            <TextField fullWidth id="standard-uncontrolled" label="scheduleId" name='scheduleId' value={model.Configuration.scheduleId} onChange={handleEvent('scheduleId')}/>
                          </Grid>
                        </FormControl>}
                        {(model.Configuration.endpoint.urlParams.indexOf('collectionId') > -1)  &&
                        <FormControl>
                          <Grid item xs>
                            <TextField fullWidth id="standard-uncontrolled" label="collectionId" name='collectionId' value={model.Configuration.collectionId} onChange={handleEvent('collectionId')}/>
                            <Autocomplete
                              getOptionLabel={option => option.primary} // tells the tool what value to show for selection
                              options={generateData(model.Meta)} // we are using the model.Meta section to generate a list of options to choose from.                 
                              id="Autocomplete-SingleSelect"
                              getOptionSelected={(option, value) => option.primary === value.primary} 
                              value={model.Configuration.field}
                              renderInput={(params) => (<TextField {...params} id="ac-meta" label="Select collectionId field to override body" margin="normal"/>)}
                              onChange={handleResourceEvent("collectionIdfield")} // this is how we update the model (metadata that we pass through to python)
                            />
                          </Grid>
                        </FormControl>}
                        {(model.Configuration.endpoint.urlParams.indexOf('connectionId') > -1)  &&
                        <FormControl>
                          <Grid item xs>
                                <TextField fullWidth id="standard-uncontrolled" label="connectionId" name='connectionId' value={model.Configuration.connectionId} onChange={handleEvent('connectionId')}/>
                          </Grid>
                        </FormControl>}
                        {/* </Grid> */}
                        {(model.Configuration.endpoint.urlParams.indexOf('credentialId') > -1)  &&
                        <FormControl>
                          <Grid item xs>
                                <TextField fullWidth id="standard-uncontrolled" label="credentialId" name='credentialId' value={model.Configuration.credentialId} onChange={handleEvent('credentialId')}/>
                          </Grid>
                        </FormControl>}
                      </Grid>

                      <Grid item>
                        <Container>
                          <Paper>
                            <AppBar color="default" elevation={0} position="static">
                              <Tabs centered indicatorColor="primary" onChange={handleChange} textColor="primary" value={value}>
                                <Tab label="Payload" />
                                <Tab label="Schema Example" />
                              </Tabs>
                            </AppBar>
                            {value === 0 && 
                            <Container dir={''}>This is where the payload text inbox will go
                              <TextField fullWidth multiline maxRows="10" id="standard-uncontrolled" name='payload' 
                              
                              value={model.Configuration.payload} onChange={handleSchemaEvent('payload')}
                              // value={JSON.stringify(model.Configuration.payload,null,2)} onChange={handlePayloadEvent}
                              // value={getPayloadText()} onChange={handlePayloadEvent}
                              
                              />
                            </Container>}
                            {value === 1 && 
                            <Container dir={''}>This will be a static schema. Possibly add a button to copy example into Payload text input on first tab. This updates with the selected resource.
                              <Button color="secondary" variant="contained" onClick={handleSchemaClick}>Use schema in Payload</Button>
                              <TextField fullWidth multiline maxRows="10" id="standard-uncontrolled" name='schema' value={model.Configuration.endpoint.schema} />
                              {/* <TextField fullWidth multiline maxRows="10" id="standard-uncontrolled" name='schema' value={JSON.stringify(model.Configuration.endpoint.schema,null, 2)} /> */}
                            </Container>}
                          </Paper>
                        </Container>
                      </Grid>
                      </Grid>
                    }

              </Grid>
          </Grid>
              <Grid>
                <Autocomplete
                  getOptionLabel={option => option.primary} // tells the tool what value to show for selection
                  options={generateData(model.Meta)} // we are using the model.Meta section to generate a list of options to choose from.                 
                  id="Autocomplete-SingleSelect"
                  getOptionSelected={(option, value) => option.primary === value.primary} 
                  value={model.Configuration.field}
                  renderInput={(params) => (<TextField {...params} id="ac-meta" label="Select field" margin="normal"/>)}
                  onChange={handleResourceEvent("field")} // this is how we update the model (metadata that we pass through to python)
                />
              </Grid>
              <Grid>
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

              </Grid>
        </Grid>
        </Container>}


        </Paper>
      </Container>
      <Grid item>
        <FormControlLabel control={<Switch />} checked={darkModeBoolean} onChange={() => handleBoolUpdate('darkMode',String(!darkModeBoolean))}  label="Dark Mode" />
      </Grid>
      </Box>
    </AyxAppWrapper>
  )
}

const Tool = () => {
  return (
    <DesignerApi messages={{}}
    defaultConfig={
      { 
        Configuration: {
          darkMode: "true", 
          method: {title:"GET"}, 
          payload:`{}`,
          endpoint:
            { 
            description: "Schedules by ID", 
            endpoint: "/v3/schedules/{scheduleId}", 
            resource:"schedules", 
            desc:"Retrieve a schedule record", 
            urlParams:[""], 
            schema:{}
            },
          field: "", 
          text1: "",
          booleanValue: "true", 
          folderPath: "fdsa", 
          useAuthFromField:"false", 
          authField:"", 
          credentialId:"",
          apiSecret: "",
          deleteChecked: "false",
          fieldEntryParameters: "false"
      }, //need a sample value for our fieldSelect above so when we first open the tool it doesn't error.
        Meta: { },
        Secrets:{apiKey: {text: '', encryptionMode: 'obfuscation'},apiSecret: {text: '', encryptionMode: 'obfuscation'}}
      }
    }
    >

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