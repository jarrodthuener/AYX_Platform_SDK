"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsEvent = void 0;

var _uuid = require("uuid");

const configToValue = (obj) =>{
  console.log("configToValue obj item",obj);
  return Object.keys(obj).map((o) => {
    //remove "Value" element when modifying the tool config in designer.
    // console.log("configToValue o item within obj",obj[o]);
    if (o ==="Value" || JSON.stringify(obj[o]) === '{}'){
      console.log("value skipped");
    } else if (obj[o] === null){
      console.log("null skipped");
      // return {"@name":o,"#text":'{}'}
    } else {
      console.log("value created in configToValue");
      return {"@name":o,"#text":obj[o]} 
    }
  })
};



// This goes at the end of the scripts right before Designer grabs the value.
const handleConfigToValue = (data) =>{
  const newModel = {...data};
  const newConfig = configToValue(newModel.Configuration.Configuration).filter(item => item);
  newModel.Configuration.Configuration = {}
  newModel.Configuration.Configuration.Value = newConfig
  console.log("outgoing model", newModel);
  return newModel
};


const JsEvent = (Event, item = {}, context = window.Alteryx) => {
  console.log("callback");
  const callbackRegistrationId = (0, _uuid.v4)();
  const callbackPromise = new Promise(res => {
    context.Gui.Callbacks[callbackRegistrationId] = (...theArgs) => {
      res.apply({}, theArgs);
    };
  });
  const actualObjectToSend = {
    Event,
    callback: "window.Alteryx.Gui.Callbacks['".concat(callbackRegistrationId, "']"),
    Callback: "window.Alteryx.Gui.Callbacks['".concat(callbackRegistrationId, "']"),
    ...item
  };

  console.log("end of JsEvent",JSON.stringify(actualObjectToSend),callbackPromise);
  context.JsEvent(JSON.stringify(handleConfigToValue(actualObjectToSend)));
  //context.JsEvent(JSON.stringify(actualObjectToSend));
  return callbackPromise;
};

exports.JsEvent = JsEvent;