"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var app = (0, express_1.default)();
var port = 3001;
var axios_1 = __importDefault(require("axios"));
var sdk_trace_web_1 = require("@opentelemetry/sdk-trace-web");
var sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
var api_1 = __importStar(require("@opentelemetry/api"));
var sdk_node_1 = require("@opentelemetry/sdk-node");
//...
// // Optionally register automatic instrumentation libraries
// registerInstrumentations({
//   instrumentations: [],
// });
// const resource =
//   Resource.default().merge(
//     new Resource({
//       [SemanticResourceAttributes.SERVICE_NAME]: "service-name-here",
//       [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
//     })
//   );
var provider = new sdk_trace_web_1.WebTracerProvider();
var exporter = new sdk_trace_base_1.ConsoleSpanExporter();
var processor = new sdk_trace_base_1.BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);
provider.register();
var sdk = new sdk_node_1.NodeSDK({
    traceExporter: exporter,
    // instrumentations: [getNodeAutoInstrumentations()],
});
sdk
    .start();
var tracer = api_1.default.trace.getTracer('my-service-tracer');
var traceFunction = function (name, fn) { return __awaiter(void 0, void 0, void 0, function () {
    var returnValue;
    return __generator(this, function (_a) {
        returnValue = tracer.startActiveSpan(name, function (span) { return __awaiter(void 0, void 0, void 0, function () {
            var returnValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(fn);
                        console.log(fn.arguments);
                        console.log(span.spanContext);
                        return [4 /*yield*/, fn.call(undefined)];
                    case 1:
                        returnValue = _a.sent();
                        console.log(returnValue);
                        span.setAttribute("attr1", "hello");
                        span.end();
                        return [2 /*return*/, returnValue];
                }
            });
        }); });
        // const original = descriptor.value;
        // if (typeof original === 'function') {
        //     descriptor.value = function (...args) {
        //         console.log(`Arguments: ${args}`);
        //         try {
        //             const result = original.apply(this, args);
        //             console.log(`Result: ${result}`);
        //             return result;
        //         } catch (e) {
        //             console.log(`Error: ${e}`);
        //             throw e;
        //         }
        //     }
        // }
        // return fn(...args) {
        //     return fn.apply(this, args)
        // };
        return [2 /*return*/, returnValue];
    });
}); };
var traceFunctionMiddleWare = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, traceFunction(req.originalUrl, next())];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var getTraceStateHeader = function () {
    var output = {};
    api_1.propagation.inject(api_1.context.active(), output);
    // const { traceparent, tracestate } = output;
    return output;
};
app.use(traceFunctionMiddleWare);
app.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var obj, param, value;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                obj = new SomeClass();
                param = "hello";
                return [4 /*yield*/, traceFunction("trace", obj.method(param))];
            case 1:
                value = _a.sent();
                console.log(value);
                // tracer.startActiveSpan('js-caller', async (span) => {
                // });
                res.sendFile('index.html', { root: "./" });
                return [2 /*return*/];
        }
    });
}); });
var SomeClass = /** @class */ (function () {
    function SomeClass() {
        var _this = this;
        this.method = function (param) { return __awaiter(_this, void 0, void 0, function () {
            var headers, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headers = getTraceStateHeader();
                        console.log(headers);
                        console.log(this.attr1);
                        return [4 /*yield*/, axios_1.default.get("http://127.0.0.1:5000/callee", {
                                headers: headers
                            })];
                    case 1:
                        responseData = (_a.sent()).data;
                        console.log(responseData);
                        return [2 /*return*/, this.attr1];
                }
            });
        }); };
        this.attr1 = "hello";
        this.method = this.method.bind(this);
    }
    return SomeClass;
}());
app.listen(port, function () {
    console.log("Example app listening on port ".concat(port));
});
