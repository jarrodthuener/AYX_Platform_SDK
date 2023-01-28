"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsEvent = void 0;

var _uuid = require("uuid");

const configToValue = (obj) =>{
  return Object.keys(obj).map((o) => {
    if (o ==="Value" || JSON.stringify(obj[o]) === '{}' || obj[o] === null){
    } else {
      return {"@name":o,"#text":obj[o]} 
    }
  })
};

const handleConfigToValue = (data) =>{
  const newModel = {...data};
  const newConfig = configToValue(newModel.Configuration.Configuration).filter(item => item);
  newModel.Configuration.Configuration = {}
  newModel.Configuration.Configuration.Value = newConfig
  return newModel
};

const JsEvent = (Event, item = {}, context = window.Alteryx) => {
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
  context.JsEvent(JSON.stringify(handleConfigToValue(actualObjectToSend)));
  return callbackPromise;
};

exports.JsEvent = JsEvent;