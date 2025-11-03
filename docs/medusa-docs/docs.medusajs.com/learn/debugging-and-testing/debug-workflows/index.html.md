# Debug Workflows

In this chapter, you'll learn about the different ways you can debug workflows in Medusa.

Debugging workflows is essential to ensure your custom features work as expected. It helps you identify unexpected issues and bugs in your workflow logic.

## Approaches to Debug Workflows

There are several ways to debug workflows in Medusa:

|Approach|When to Use|
|---|---|
|Write integration tests|To ensure your workflow produces the expected results and handles edge cases.|
|Add breakpoints|To inspect specific steps in your workflow and understand the data flow.|
|Log messages|To check values during execution with minimal overhead.|
|View Workflow Executions in Medusa Admin|To monitor stored workflow executions and long-running workflows, especially in production environments.|

***

## Approach 1: Write Integration Tests

Integration tests run your workflow in a controlled environment to verify its behavior and outcome. By writing integration tests, you ensure your workflow produces the expected results and handles edge cases.

### When to Use Integration Tests

It's recommended to always write integration tests for your workflows. This helps you catch issues early and ensures your custom logic works as intended.

### How to Write Integration Tests for Workflows

Refer to the [Integration Tests](https://docs.medusajs.com/learn/debugging-and-testing/testing-tools/integration-tests) chapter to learn how to write integration tests for your workflows and find examples of testing workflows.

***

## Approach 2: Add Breakpoints

Breakpoints allow you to pause workflow execution at specific steps and inspect the data. They're useful for understanding the data flow in your steps and identifying issues.

### When to Use Breakpoints

Use breakpoints when you need to debug specific steps in your workflow, rather than the entire workflow. You can verify that the step is behaving as expected and is producing the correct output.

### Where Can You Add Breakpoints

Since Medusa stores an internal representation of the workflow constructor on application startup, breakpoints within the workflow's constructor won't work during execution. Learn more in the [Data Manipulation](https://docs.medusajs.com/learn/fundamentals/workflows/variable-manipulation) chapter.

Instead, you can add breakpoints in:

- A step function.
- A step's compensation function.
- The `transform` callback function of a step.

For example:

### Step Function

```ts highlights={[["11"], ["12"]]} collapsibleLines="1-7" expandButtonLabel="Show Imports"
import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

const step1 = createStep(
  "step-1",
  async () => {
    // Add a breakpoint here to inspect the message
    const message = "Hello from step 1!"

    return new StepResponse(
      message
    )
  }
)

export const myWorkflow = createWorkflow(
  "my-workflow",
  () => {
    const response = step1()
    
    return new WorkflowResponse({
      response,
    })
  }
)
```

### Compensation Function

```ts highlights={[["18"], ["19"]]} collapsibleLines="1-7" expandButtonLabel="Show Imports"
import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

const step1 = createStep(
  "step-1",
  async () => {
    const message = "Hello from step 1!"

    return new StepResponse(
      message
    )
  },
  async () => {
    // Add a breakpoint here to inspect the compensation logic
    console.log("Compensating step 1")
  }
)

const step2 = createStep(
  "step-2",
  async () => {
    throw new Error("This is an error in step 2")
  }
)

export const myWorkflow = createWorkflow(
  "my-workflow",
  () => {
    const response = step1()
    step2()

    return new WorkflowResponse({
      response,
    })
  }
)
```

### Transform Callback

```ts highlights={[["28"], ["29"]]} collapsibleLines="1-8" expandButtonLabel="Show Imports"
import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"

const step1 = createStep(
  "step-1",
  async () => {
    const message = "Hello from step 1!"

    return new StepResponse(
      message
    )
  }
)

export const myWorkflow = createWorkflow(
  "my-workflow",
  () => {
    const response = step1()

    const transformedMessage = transform(
      { response },
      (data) => {
        // Add a breakpoint here to inspect the transformed data
        const upperCase = data.response.toUpperCase()
        return upperCase
      }
    )

    return new WorkflowResponse({
      response: transformedMessage,
    })
  }
)
```

### How to Add Breakpoints

If your code editor supports adding breakpoints, you can add them in your step and compensation functions, or the `transform` callback function. When the workflow execution reaches the breakpoint, your code editor will pause execution, allowing you to inspect the data and walk through the code.

If you're using VS Code or Cursor, learn how to add breakpoints in the [VS Code documentation](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_breakpoints). For other code editors, refer to their respective documentation.

***

## Approach 3: Log Messages

Logging messages is a simple yet effective way to debug code. By logging messages, you can check values during execution with minimal overhead.

### When to Use Logging

Use logging when debugging workflows and you want to check values during execution without the overhead of setting up breakpoints.

Logging is also useful when you want to verify variable values between steps or in a `transform` callback function.

### How to Log Messages

Since Medusa stores an internal representation of the workflow constructor on application startup, you can't directly log messages in the workflow's constructor.

Instead, you can log messages in:

- A step function.
- A step's compensation function.
- The `transform` callback function of a step.

You can log messages with `console.log`. In step and compensation functions, you can also use the [Logger](https://docs.medusajs.com/learn/debugging-and-testing/logging) to log messages with different log levels (info, warn, error).

For example:

### Step Function

```ts highlights={[["14"]]} collapsibleLines="1-7" expandButtonLabel="Show Imports"
import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

const step1 = createStep(
  "step-1",
  async ({}, { container }) => {
    const logger = container.resolve("logger")
    const message = "Hello from step 1!"

    logger.info(`Step 1 output: ${message}`)

    return new StepResponse(
      message
    )
  }
)

export const myWorkflow = createWorkflow(
  "my-workflow",
  () => {
    const response = step1()

    return new WorkflowResponse({
      response,
    })
  }
)
```

### Compensation Function

```ts highlights={[["22"]]} collapsibleLines="1-7" expandButtonLabel="Show Imports"
import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

const step1 = createStep(
  "step-1",
  async ({}, { container }) => {
    const logger = container.resolve("logger")
    const message = "Hello from step 1!"

    logger.info(`Step 1 output: ${message}`)

    return new StepResponse(
      message
    )
  },
  async (_, { container }) => {
    const logger = container.resolve("logger")
    logger.warn("Compensating step 1")
  }
)

export const myWorkflow = createWorkflow(
  "my-workflow",
  () => {
    const response = step1()

    return new WorkflowResponse({
      response,
    })
  }
)
```

### Transform Callback

```ts highlights={[["29"]]} collapsibleLines="1-8" expandButtonLabel="Show Imports"
import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"

const step1 = createStep(
  "step-1",
  async () => {
    const message = "Hello from step 1!"

    return new StepResponse(
      message
    )
  }
)

export const myWorkflow = createWorkflow(
  "my-workflow",
  () => {
    const response = step1()

    const transformedMessage = transform(
      { response },
      (data) => {
        const upperCase = data.response.toUpperCase()
        console.log("Transformed Data:", upperCase)
        return upperCase
      }
    )

    return new WorkflowResponse({
      response: transformedMessage,
    })
  }
)
```

If you execute the workflow, you'll see the logged message in your console.

Learn more about logging in the [Logger](https://docs.medusajs.com/learn/debugging-and-testing/logging) chapter.

***

## Approach 4: Monitor Workflow Executions in Medusa Admin

The Medusa Admin has a [Workflows](https://docs.medusajs.com/user-guide/settings/developer/workflows) settings page that provides a user-friendly interface to view stored workflow executions.

### When to Use Admin Monitoring

Use the Medusa Admin to monitor [stored workflow executions](https://docs.medusajs.com/learn/fundamentals/workflows/store-executions) when debugging unexpected issues and edge cases, especially in production environments and long-running workflows that run in the background.

By viewing the workflow executions through the Medusa Admin, you can:

- View the status of stored workflow executions.
- Inspect input and output data for each execution and its steps.
- Identify any issues or errors in the workflow execution.

### How to Monitor Workflow Executions in the Admin

The Workflows settings page in the Medusa Admin shows you the history of stored workflow executions only. Workflow executions are stored if a workflow is [long-running](https://docs.medusajs.com/learn/fundamentals/workflows/long-running-workflow), or if the `store` and `retentionTime` options are set on the workflow.

For example, to store workflow executions:

### Prerequisites

- [Redis Workflow Engine must be installed and configured.](https://docs.medusajs.com/resources/infrastructure-modules/workflow-engine/redis)

```ts highlights={[["22"], ["23"]]} collapsibleLines="1-7" expandButtonLabel="Show Imports"
import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

const step1 = createStep(
  "step-1",
  async () => {
    const message = "Hello from step 1!"

    return new StepResponse(
      message
    )
  }
)

export const myWorkflow = createWorkflow(
  {
    name: "my-workflow",
    retentionTime: 99999,
    store: true,
  },
  () => {
    const response = step1()

    return new WorkflowResponse({
      response,
    })
  }
)
```

Refer to the [Store Workflow Executions](https://docs.medusajs.com/learn/fundamentals/workflows/store-executions) chapter to learn more.

You can view all executions of this workflow in the Medusa Admin under the [Workflows settings page](https://docs.medusajs.com/user-guide/settings/developer/workflows). Each execution will show you the status, input, and output data.
