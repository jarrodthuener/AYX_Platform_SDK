"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _react = _interopRequireWildcard(require("react"));

var _deepmerge = _interopRequireDefault(require("deepmerge"));

var _DesignerMessageApi = _interopRequireDefault(require("../DesignerMessageApi"));

var _MicroAppMessageApi = _interopRequireDefault(require("../MicroAppMessageApi"));

var _constants = require("../Utils/constants");

var _Context = _interopRequireDefault(require("../Context"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/* eslint-disable react/require-default-props */

/* eslint-disable no-underscore-dangle */

/* eslint-disable no-console */

/* eslint-disable react/forbid-prop-types */
let messageBroker;

const valueToConfig = (arr) => {
  let config = {};
  arr.forEach(o => {
    config[o["@name"]] = o["#text"];
  });
  return {config};
};


const handleValueToConfig = (data) =>{
  if (data.Configuration === null || JSON.stringify(data.Configuration) ==='{}'){
    console.log("handleValueToConfig - True - data", {data});
    return data;
  } else {
    // console.log(data)
    // const newModel = data 
    const newModel = {...data};
    console.log("handleValueToConfig - False - nM.C.V", newModel.Configuration.Value);
    const newConfig = valueToConfig(newModel.Configuration.Value)
    newModel.Configuration = newConfig.config
    console.log("updatedmodel", newModel);
    return newModel;
}
};



const DesignerApi = props => {
  // console.log("DesignerAPI");
  const {
    messages = {},
    defaultConfig = {}
  } = props;

  if (!messageBroker) {
    messageBroker = window.Alteryx && window.Alteryx.AlteryxLanguageCode ? new _DesignerMessageApi.default(props.ctx || window.Alteryx) : new _MicroAppMessageApi.default();
  }

  const mergedState = (0, _deepmerge.default)(messageBroker.model, defaultConfig);
  const [model, updateModel] = (0, _react.useState)(mergedState);
  const [appContext, updateAppContext] = (0, _react.useState)(messageBroker.ayxAppContext);

  const handleUpdateModel = updatedData => {
    // console.log({updatedData});
    updateModel(updatedData);
    console.log({updatedData});
    // console.log({messageBroker});
    messageBroker.model = updatedData;
    messageBroker instanceof _MicroAppMessageApi.default ? messageBroker.sendMessage(_constants.SUBSCRIPTION_EVENTS.MODEL_UPDATED, updatedData) : window.Alteryx.model = updatedData;
  };

  (0, _react.useEffect)(() => {
    const receiveAppContext = data => {
      updateAppContext({ ...data
      });
    };

    const receiveModel = data => {
      console.log("DesignerAPI - Receive Model before update",{model, data});
      updateModel((0, _deepmerge.default)(model, handleValueToConfig(data))); //added this valueToConfig@ 3:36p 1/27
      console.log("DesignerAPI - Receive Model",{model, data});
    };

    messageBroker.subscribe(_constants.SUBSCRIPTION_EVENTS.MODEL_UPDATED, receiveModel);
    messageBroker.subscribe(_constants.SUBSCRIPTION_EVENTS.AYX_APP_CONTEXT_UPDATED, receiveAppContext);
    console.log("DesignerAPI - message broker model",messageBroker.model);
    
    return function cleanUp() {
      handleUpdateModel(messageBroker.model);
    };
  }, []);
  const getContextValue = (0, _react.useCallback)(() => [model, handleUpdateModel], [model, handleUpdateModel]);
  const contextProps = {
    id: 'sdk-provider',
    value: getContextValue()
  };
  const {
    darkMode,
    locale,
    productTheme
  } = appContext || {};
  const appPropsToSpread = {
    messages,
    paletteType: darkMode ? 'dark' : 'light',
    theme: productTheme,
    locale
  };
  console.log("DesignerAPI - end of script",props.children,appPropsToSpread,_Context.default.Provider);
  return /*#__PURE__*/_react.default.createElement(_Context.default.Provider, contextProps, /*#__PURE__*/_react.default.cloneElement(props.children, { ...appPropsToSpread
  }));
};

var _default = DesignerApi;
console.log("End of DesignerAPI: _default",{_default});
exports.default = _default;