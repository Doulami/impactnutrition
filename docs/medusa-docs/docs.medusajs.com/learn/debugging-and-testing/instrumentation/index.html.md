# Configure Instrumentation

In this chapter, you'll learn about observability in Medusa and how to configure instrumentation with OpenTelemetry.

## What is Instrumentation?

Instrumentation is the collection of data about your application's performance and errors. It helps you debug issues, monitor performance, and gain insights into how your application behaves in production.

Instrumentation and observability are crucial as you build customizations in your application. They allow you to optimize performance, identify bottlenecks, and ensure your application runs smoothly.

***

## Instrumentation and Observability with OpenTelemetry

Medusa uses [OpenTelemetry](https://opentelemetry.io/) for instrumentation and reporting. When configured, it reports traces for:

- HTTP requests
- Workflow executions
- Query usages
- Database queries and operations

***

## How to Configure Instrumentation in Medusa?

### Prerequisites

- [An exporter to visualize your application's traces, such as Zipkin.](https://zipkin.io/pages/quickstart.html)

### Install Dependencies

As of [Medusa v2.11.0](https://github.com/medusajs/medusa/releases/tag/v2.11.0), OpenTelemetry dependencies are installed by default in new Medusa projects. If you're using an older version of Medusa, you need to install the `@opentelemetry/sdk-node`, `@opentelemetry/resources`, `@opentelemetry/sdk-trace-node`, and `@opentelemetry/instrumentation-pg` dependencies.

Before you start, you must install the dependencies relevant for the exporter you use. If you're using Zipkin, install the following dependencies:

```bash npm2yarn
npm install @opentelemetry/exporter-zipkin
```

### Add instrumentation.ts

Next, create the file `instrumentation.ts` with the following content:

```ts title="instrumentation.ts"
import { registerOtel } from "@medusajs/medusa"
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin"

// If using an exporter other than Zipkin, initialize it here.
const exporter = new ZipkinExporter({
  serviceName: "my-medusa-project",
})

export function register() {
  registerOtel({
    serviceName: "medusajs",
    // pass exporter
    exporter,
    instrument: {
      http: true,
      workflows: true,
      query: true,
    },
  })
}
```

In the `instrumentation.ts` file, you export a `register` function that uses Medusa's `registerOtel` utility function. You also initialize an instance of the exporter, such as Zipkin, and pass it to the `registerOtel` function.

`registerOtel` accepts an object where you can pass any [NodeSDKConfiguration](https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_sdk-node.NodeSDKConfiguration.html) property along with the following properties:

The `NodeSDKConfiguration` properties are accepted since Medusa v2.5.1.

- serviceName: (\`string\`) The name of the service traced.
- exporter: (\[SpanExporter]\(https://open-telemetry.github.io/opentelemetry-js/interfaces/\_opentelemetry\_sdk-node.node.SpanExporter.html)) An instance of an exporter, such as Zipkin.
- instrument: (\`object\`) Options specifying what to trace.

  - http: (\`boolean\`) Whether to trace HTTP requests.

  - query: (\`boolean\`) Whether to trace Query usages.

  - workflows: (\`boolean\`) Whether to trace Workflow executions.

  - db: (\`boolean\`) Whether to trace database queries and operations.
- instrumentations: (\[Instrumentation\[]]\(https://open-telemetry.github.io/opentelemetry-js/interfaces/\_opentelemetry\_instrumentation.Instrumentation.html)) Additional instrumentation options that OpenTelemetry accepts.

***

## Test it Out

To test it out, start your exporter, such as Zipkin.

Then, start your Medusa application:

```bash npm2yarn
npm run dev
```

Try to open the Medusa Admin or send a request to an API route.

If you check traces in your exporter, you'll find new traces reported.

### Trace Span Names

Trace span names start with the following keywords based on what it's reporting:

- `{methodName} {URL}` when reporting HTTP requests, where `{methodName}` is the HTTP method, and `{URL}` is the URL the request is sent to.
- `route:` when reporting route handlers running on an HTTP request.
- `middleware:` when reporting a middleware running on an HTTP request.
- `workflow:` when reporting a workflow execution.
- `step:` when reporting a step in a workflow execution.
- `query.graph:` when reporting Query usages.
- `pg.query:` when reporting database queries and operations.

***

## Useful Links

- [Integrate Sentry with Medusa](https://docs.medusajs.com/resources/integrations/guides/sentry)
