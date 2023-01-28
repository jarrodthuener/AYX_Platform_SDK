"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
const { stringify } = require("querystring");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _MessageApiBase2 = _interopRequireDefault(require("../MessageApiBase"));

var callback = _interopRequireWildcard(require("../Utils/callback"));

var _constants = require("../Utils/constants");

var _FieldListArray = _interopRequireDefault(require("../MetaInfoHelpers/FieldListArray"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2.default)(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2.default)(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2.default)(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

const valueToConfig = (arr) => {
  console.log({arr})
  let config = {};
  arr.forEach(o => {
    if (o === null){
    }else{
    config[o["@name"]] = o["#text"];
    }
  });
  return {config};
};

// this goes at the beginning of the interaction with the script
const handleValueToConfig = (data) =>{
  if (data.Configuration.Configuration === null){
    console.log("data is null, so it is being skipped")
    return data
  } else {
    console.log("handleValueToConfig - newConfigModel",data)
    // const newModel = data 

    const newModel = {...data};
    console.log(newModel.Configuration.Configuration)
    const newConfig = valueToConfig(newModel.Configuration.Configuration.Value)
    // newModel.Configuration = 
    newModel.Configuration.Configuration = newConfig.config
    console.log("updatedmodel", newModel)
    return newModel
}};


let DesignerMessageApi = /*#__PURE__*/function (_MessageApiBase) {
  (0, _inherits2.default)(DesignerMessageApi, _MessageApiBase);
  console.log("DesignerMessageAPI - MessageAPIBase",_MessageApiBase);

  var _super = _createSuper(DesignerMessageApi);

  function DesignerMessageApi(ctx) {
    var _this;
    console.log("DesignerMessageAPI - ctx",ctx);

    (0, _classCallCheck2.default)(this, DesignerMessageApi);
    _this = _super.call(this, ctx);

    _this.sendMessage = (type, payload) => {
      console.log("DesignerMessageAPI - sendMessage",{type, payload},_this.context);
      return callback.JsEvent(type, payload, _this.context);
    };

    _this.encryptSecrets = key => {
      if (!_this.model.Secrets[key].text.length) {
        // only send an encrypt call if a string is present
        // protects against empty default config values
        return {
          text: '',
          encryptionMode: ''
        };
      }

      if (_this.model.Secrets[key].encrypted) {
        return;
      }

      return Promise.resolve(_this.sendMessage('Encrypt', {
        text: _this.model.Secrets[key].text,
        encryptionMode: _this.model.Secrets[key].encryptionMode || 'obfuscation'
      })).then(res => {
        _this.model.Secrets[key] = {
          text: res,
          encryptionMode: _this.model.Secrets[key].encryptionMode,
          encrypted: true
        };
      });
    };

    _this.decryptSecrets = secret => {
      if (!secret.text.length) {
        return {
          text: '',
          encryptionMode: '' || 'obfuscation'
        };
      }

      return Promise.resolve(_this.sendMessage('Decrypt', {
        text: secret.text
      })).then(res => {
        return {
          text: res,
          encryptionMode: secret.encryptionMode
        };
      });
    };

    _this.generateConfigShape = async currentToolConfiguration => {
      const {
        Annotation
      } = currentToolConfiguration.Configuration.Configuration || _this.model;
      const [decryptedSecrets, cleanToolConfiguration] = await _this.cleanConfigAndDecryptSecrets(currentToolConfiguration);
      console.log("DesignerMessageAPI - generageConfigShape",{currentToolConfiguration},_this.model.Configuration);

      return {
        Configuration: cleanToolConfiguration.Configuration.Configuration || _this.model.Configuration,
        Secrets: decryptedSecrets || _this.model.Secrets,
        Annotation,
        Meta: new _FieldListArray.default(currentToolConfiguration.MetaInfo),
        ToolName: currentToolConfiguration.ToolName,
        ToolId: currentToolConfiguration.ToolId,
        srcData: currentToolConfiguration
      };
    };

    _this.cleanConfigAndDecryptSecrets = async currentToolConfiguration => {
      const decryptedSecrets = {};

      if (currentToolConfiguration.Configuration.Configuration && currentToolConfiguration.Configuration.Configuration.Annotation) {
        delete currentToolConfiguration.Configuration.Configuration.Annotation;
      }

      if (currentToolConfiguration.Configuration.Configuration && currentToolConfiguration.Configuration.Configuration.Secrets) {
        const encryptedValueKeys = Object.keys(currentToolConfiguration.Configuration.Configuration.Secrets);
        const valuesToDecrypt = encryptedValueKeys.map(key => currentToolConfiguration.Configuration.Configuration.Secrets[key]);
        const decryptedValues = await Promise.all(valuesToDecrypt.map(_this.decryptSecrets));

        _this.assignDecryptedSecrets(encryptedValueKeys, decryptedSecrets, decryptedValues);

        delete currentToolConfiguration.Configuration.Configuration.Secrets;
      }

      return [decryptedSecrets, currentToolConfiguration];
    };

    _this.assignDecryptedSecrets = (encryptedValueKeys, decryptedSecrets, decryptedValues) => {
      for (let i = 0; i < encryptedValueKeys.length; i++) {
        decryptedSecrets[encryptedValueKeys[i]] = decryptedValues[i];
      }
    };

    _this.model = {
      Configuration: {},
      Annotation: '',
      Meta: [],
      ToolName: '',
      Secrets: {},
      ToolId: undefined,
      srcData: {}
    };
    _this.ayxAppContext = {
      darkMode: false,
      productTheme: {},
      locale: _this.context.AlteryxLanguageCode
    };
    _this.context.Gui = {
      SetConfiguration: async currentToolConfiguration => {
        if (_this.subscriptions && _this.subscriptions.has('MODEL_UPDATED')) {
          console.log("DesignerMessageAPI - SetConfig - currentToolConf", {currentToolConfiguration});
          _this.model = await _this.generateConfigShape(currentToolConfiguration);


          _this.subscriptions.get('MODEL_UPDATED')(_this.model);

          _this.context.model = _this.model;
        }
        console.log("designerMessageAPI SetConfiguration");
        let newConfigModel = {...currentToolConfiguration}
        newConfigModel = handleValueToConfig(newConfigModel)
        console.log("designerMessageApi",{newConfigModel})
        currentToolConfiguration = newConfigModel
        console.log(currentToolConfiguration)
        

        _this.context.JsEvent(JSON.stringify({
          Event: _constants.MESSAGE_TYPES.SET_CONFIGURATION
        }));
      },
      GetConfiguration: () => {
        const keys = Object.keys(_this.model.Secrets);
        Promise.all(keys.map(_this.encryptSecrets)).then(() => {
          console.log("designerMessageAPI GetConfiguration",_this.model.Configuration);

          const payload = {
            Configuration: {
              Configuration: { ..._this.model.Configuration,
                Secrets: { ..._this.model.Secrets
                }
              },
              Annotation: _this.model.Annotation
            }
          };

          _this.sendMessage(_constants.MESSAGE_TYPES.GET_CONFIGURATION, payload);
          console.log("designerMessageAPI GetConfiguration",{payload});
        });
      },
      Callbacks: {}
    };
    console.log("DesignerMessageAPI - end of script", {_this});
    return _this;
  }
  
  return DesignerMessageApi;
}(_MessageApiBase2.default);

var _default = DesignerMessageApi;
console.log("End of DesignerMessageAPI: _default",{_default});
exports.default = _default;