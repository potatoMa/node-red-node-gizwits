"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0: case 1: t = op; break;
        case 4: _.label++; return { value: op[1], done: false };
        case 5: _.label++; y = op[1]; op = [0]; continue;
        case 7: op = _.ops.pop(); _.trys.pop(); continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
          if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
          if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
          if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
          if (t[2]) _.ops.pop();
          _.trys.pop(); continue;
      }
      op = body.call(thisArg, _);
    } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./core");
var helpers_1 = require("./helpers");
module.exports = function(RED) {
  function DeviceStatusNode(props) {
    var _this = this;
    RED.nodes.createNode(this, props);
    helpers_1.setStatus(this, core_1.ResourceStatus.Connecting);
    var config = RED.nodes.getNode(props.server);
    if (!config) {
      helpers_1.setStatus(this, core_1.ResourceStatus.Error);
      this.error('Node is not configured');
      return;
    }
    // 创建订阅对象
    this.settings = config.settings
    this.log(`nodered_${props.productKey}_devices_allevent`);
    var sub = new core_1.Subscriber(core_1.open(config.settings), `nodered_${props.productKey}_devices_allevent`);
    helpers_1.setStatus(this, sub.status);
    sub.on('status', function (status) {
      _this.log('statusstatus' + JSON.stringify(_this.settings))
      return helpers_1.setStatus(_this, status);
    });
    sub.on('error', function (err) {
      return _this.error(err.toString(), { error: err });
    });
    sub.on('message', function (msg) {
      // 处理数据
      const contentStr = msg.content.toString('utf8');
      const deviceData = JSON.parse(contentStr);
      _this.log('message' + contentStr)
      const { condition, dataPointValue, dataPoint, dataPointValueType, device } = props;
      // 判断是否通过条件判断
      let passCondition = true;
      if (condition && dataPointValue && dataPoint) {
        const currentDp = deviceData.data[dataPoint];
        let realDataPointValue;
        // 根据dataPointValueType转换dataPointValue的值
        switch (dataPointValueType) {
          case 'str':
            realDataPointValue = dataPointValue;
            break;
          case 'num':
            realDataPointValue = Number(dataPointValue);
            break;
          case 'bool':
            realDataPointValue = dataPointValue === 'true';
            break;
          default:
            break;
        }
        switch (condition) {
          case 'eq':
            passCondition = currentDp === realDataPointValue;
            break;
          case 'neq':
            passCondition = currentDp !== realDataPointValue;
            break;
          case 'lt':
            passCondition = currentDp < realDataPointValue;
            break;
          case 'lte':
            passCondition = currentDp <= realDataPointValue;
            break;
          case 'gt':
            passCondition = currentDp > realDataPointValue;
            break;
          case 'gte':
            passCondition = currentDp >= realDataPointValue;
            break;
          default:
            break;
        }
      }
      // 判断是否通过设备判断（是否和配置的设备相同，如果配置了的话）
      let passDevice = true;
      if (device) {
        passDevice = deviceData.mac === device;
      }
      // 通过条件判断（如果设置了）以及为选定的设备时，发送到下个节点
      if (passCondition && passDevice) {
        _this.send({
          topic: props.routingkey || msg.fields.routingKey,
          payload: contentStr,
        });
      }
    });
    this.on('close', function () { return __awaiter(_this, void 0, void 0, function () {
      var e_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, sub.close()];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            e_1 = _a.sent();
            this.error(e_1.message, { error: e_1 });
            return [3 /*break*/, 3];
          case 3: return [2 /*return*/];
        }
      });
    }); });
  }
  RED.nodes.registerType("设备状态变化", DeviceStatusNode);
}