# Store Workflow Executions

In this chapter, you'll learn how to store workflow executions in the database and access them later.

## Workflow Execution Retention

Medusa doesn't store your workflow's execution details by default. However, you can configure a workflow to keep its execution details stored in the database.

This is useful for auditing and debugging purposes. When you store a workflow's execution, you can view details around its steps, their states and their output. You can also check whether the workflow or any of its steps failed.

You can view stored workflow executions from the Medusa Admin dashboard by going to Settings -> Workflows.

***

## How to Store Workflow's Executions?

### Prerequisites

- [Redis Workflow Engine must be installed and configured.](https://docs.medusajs.com/resources/infrastructure-modules/workflow-engine/redis)

`createWorkflow` from the Workflows SDK can accept an object as a first parameter to set the workflow's configuration. To enable storing a workflow's executions:

- Enable the `store` option. If your workflow is a [Long-Running Workflow](https://docs.medusajs.com/learn/fundamentals/workflows/long-running-workflow), this option is enabled by default.
- Set the `retentionTime` option to the number of seconds that the workflow execution should be stored in the database.

For example:

```ts highlights={highlights}
import { createStep, createWorkflow } from "@medusajs/framework/workflows-sdk"

const step1 = createStep(
  {
    name: "step-1",
  },
  async () => {
    console.log("Hello from step 1")
  }
)

export const helloWorkflow = createWorkflow(
  {
    name: "hello-workflow",
    retentionTime: 99999,
    store: true,
  },
  () => {
    step1()
  }
)
```

Whenever you execute the `helloWorkflow` now, its execution details will be stored in the database.

***

## Retrieve Workflow Executions

You can view stored workflow executions from the Medusa Admin dashboard by going to Settings -> Workflows.

When you execute a workflow, the returned object has a `transaction` property containing the workflow execution's transaction details:

```ts
const { transaction } = await helloWorkflow(container).run()
```

To retrieve a workflow's execution details from the database, resolve the Workflow Engine Module from the container and use its `listWorkflowExecutions` method.

For example, you can create a `GET` API Route at `src/workflows/[id]/route.ts` that retrieves a workflow execution for the specified transaction ID:

```ts title="src/workflows/[id]/route.ts" highlights={retrieveHighlights}
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { transaction_id } = req.params
  
  const workflowEngineService = req.scope.resolve(
    Modules.WORKFLOW_ENGINE
  )

  const [workflowExecution] = await workflowEngineService.listWorkflowExecutions({
    transaction_id: transaction_id,
  })

  res.json({
    workflowExecution,
  })
}
```

In the above example, you resolve the Workflow Engine Module from the container and use its `listWorkflowExecutions` method, passing the `transaction_id` as a filter to retrieve its workflow execution details.

A workflow execution object will be similar to the following:

```json
{
  "workflow_id": "hello-workflow",
  "transaction_id": "01JJC2T6AVJCQ3N4BRD1EB88SP",
  "id": "wf_exec_01JJC2T6B3P76JD35F12QTTA78",
  "execution": {
    "state": "done",
    "steps": {},
    "modelId": "hello-workflow",
    "options": {},
    "metadata": {},
    "startedAt": 1737719880027,
    "definition": {},
    "timedOutAt": null,
    "hasAsyncSteps": false,
    "transactionId": "01JJC2T6AVJCQ3N4BRD1EB88SP",
    "hasFailedSteps": false,
    "hasSkippedSteps": false,
    "hasWaitingSteps": false,
    "hasRevertedSteps": false,
    "hasSkippedOnFailureSteps": false
  },
  "context": {
    "data": {},
    "errors": []
  },
  "state": "done",
  "created_at": "2025-01-24T09:58:00.036Z",
  "updated_at": "2025-01-24T09:58:00.046Z",
  "deleted_at": null
}
```

### Example: Check if Stored Workflow Execution Failed

To check if a stored workflow execution failed, you can check its `state` property:

```ts
if (workflowExecution.state === "failed") {
  return res.status(500).json({
    error: "Workflow failed",
  })
}
```

Other state values include `done`, `invoking`, and `compensating`.
