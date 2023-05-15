import express, { response, Express } from 'express';
const app: Express = express()
const port = 3001
import axios from 'axios';

import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { BatchSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
import opentelemetry, { trace, context, propagation } from "@opentelemetry/api";
import { NodeSDK } from '@opentelemetry/sdk-node';

import { traceFunction, traceFunctionMiddleWare, getTraceStateHeader } from './trace_utils';

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
const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();

const sdk = new NodeSDK({
    traceExporter: exporter,
    // instrumentations: [getNodeAutoInstrumentations()],
});

sdk
    .start()

app.use(traceFunctionMiddleWare)

app.get('/', async (req, res) => {
    // const a = new Thing()

    // const traced = wrap(getData)
    // console.log(traced)

    // console.log(await traced("hehe"));

    const obj = new SomeClass()
    const param = "hello"
    obj.method(param, param)
    // let value = await traceFunction("trace", obj.method(param))

    // console.log(value)
    // tracer.startActiveSpan('js-caller', async (span) => {
    // });


    res.sendFile('index.html', { root: "./" });
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
        console.log(headers)
        console.log(this.attr1)
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