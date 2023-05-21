import express, { response, Express } from 'express';
const app: Express = express()
const port = 3001
import axios from 'axios';

import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { BatchSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
import opentelemetry, { trace, context, propagation } from "@opentelemetry/api";
import { NodeSDK } from '@opentelemetry/sdk-node';

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

import { traceFunction, traceFunctionMiddleWare, traceFunctionCallback, getTraceStateHeader, setCorrectFileForMiddlewareSpan } from './trace_utils';

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

const provider = new WebTracerProvider();

const collectorOptions = {
    url: "http://127.0.0.1:8000/v1/traces"
}

// const exporter = new ConsoleSpanExporter()
const exporter = new OTLPTraceExporter(collectorOptions) //ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();

const sdk = new NodeSDK({
    traceExporter: exporter,
    // instrumentations: [getNodeAutoInstrumentations()],
});

sdk
    .start()

// app.use(traceFunctionMiddleWare)

app.get('/', async (req, res) => {
    const returnVal = await traceFunctionCallback("app.get('/')", async () => {
        const obj = new SomeClass()
        const param = "hello"
        const methodReturn = await obj.method(param, param)
        return methodReturn
    })
    console.log(returnVal)
    // return methodReturn
    // const traced = wrap(getData)
    // console.log(traced)

    // console.log(await traced("hehe"));


    // let value = await traceFunction("trace", obj.method(param))

    // console.log(value)
    // tracer.startActiveSpan('js-caller', async (span) => {
    // });


    res.sendFile('index.html', { root: "./" });
})


app.use('/dist_trace', traceFunctionMiddleWare, async (req, res) => {
    setCorrectFileForMiddlewareSpan("frontend/app.ts")
    const random = Math.floor(Math.random() * 4)
    const headers = getTraceStateHeader()
    for (let i = 0; i < random; i++) {

        // headers.setAttribute("Content-Type", "application/json")

        const responseData = (
            await axios.get("http://127.0.0.1:5000/callee", {
                headers: headers
            })
        ).data;
    }
    // headers.setAttribute("Content-Type", "application/json")

    const responseData = (
        await axios.get("http://127.0.0.1:5000/dist_trace", {
            headers: headers
        })
    ).data;

    console.log(headers)
    res.send("hello")
})


app.use('/callee', traceFunctionMiddleWare, (req, res) => {
    setCorrectFileForMiddlewareSpan("frontend/app.ts")
    res.send("hello")
})


class SomeClass {
    attr1: string

    constructor() {
        this.attr1 = "hello"
        this.method = this.method.bind(this)
    }

    @traceFunction
    async method(param1, param2) {
        const headers = getTraceStateHeader()
        // headers.setAttribute("Content-Type", "application/json")

        const responseData = (
            await axios.get("http://127.0.0.1:5000/callee", {
                headers: headers
            })
        ).data;
        console.log(responseData)
        return this.attr1
    }
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})