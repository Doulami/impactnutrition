# Execute Nested Workflows

In this chapter, you'll learn how to execute a workflow in another workflow.

## How to Execute a Workflow in Another?

In many cases, you may have a workflow that you want to re-use in another workflow. This is most common when you build custom workflows and you want to utilize Medusa's [existing workflows](https://docs.medusajs.com/resources/medusa-workflows-reference).

Executing a workflow within another is slightly different from how you usually execute a workflow. Instead of invoking the workflow, passing it the container, then running its `run` method, you use the `runAsStep` method of the workflow. This will pass the Medusa container and workflow context to the nested workflow.

For example, to execute the [createProductsWorkflow](https://docs.medusajs.com/resources/references/medusa-workflows/createProductsWorkflow) in your custom workflow:

```ts highlights={workflowsHighlights} collapsibleLines="1-7" expandMoreButton="Show Imports"
import {
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"
import { 
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"

const workflow = createWorkflow(
  "hello-world",
  async (input) => {
    const products = createProductsWorkflow.runAsStep({
      input: {
        products: [
          // ...
        ],
      },
    })

    // ...
  }
)
```

The `runAsStep` method accepts an `input` property to pass input to the workflow.

### Returned Data

Notice that you don't need to use `await` when executing the nested workflow, as it's not a promise in this scenario.

You also receive the workflow's output as a return value from the `runAsStep` method. This is different from the usual workflow response, where you receive the output in a `result` property.

***

## Prepare Input Data

Since Medusa creates an internal representation of your workflow's constructor function, you can't manipulate data directly in the workflow constructor. You can learn more about this in the [Data Manipulation](https://docs.medusajs.com/learn/fundamentals/workflows/variable-manipulation) chapter.

If you need to perform some data manipulation to prepare the nested workflow's input data, use `transform` from the Workflows SDK.

For example:

```ts highlights={transformHighlights} collapsibleLines="1-12"
import {
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { 
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"

type WorkflowInput = {
  title: string
}

const workflow = createWorkflow(
  "hello-product",
  async (input: WorkflowInput) => {
    const createProductsData = transform({
      input,
    }, (data) => [
      {
        title: `Hello ${data.input.title}`,
      },
    ])

    const products = createProductsWorkflow.runAsStep({
      input: {
        products: createProductsData,
      },
    })

    // ...
  }
)
```

In this example, you use the `transform` function to prepend `Hello` to the title of the product. Then, you pass the result as input to the `createProductsWorkflow`.

Learn more about `transform` in the [Data Manipulation](https://docs.medusajs.com/learn/fundamentals/workflows/variable-manipulation) chapter.

***

## Run Workflow Conditionally

Similar to the [previous section](#prepare-input-data), you can't use conditional statements directly in the workflow constructor. Instead, you can use the `when-then` function from the Workflows SDK to run a workflow conditionally.

For example:

```ts highlights={whenHighlights} collapsibleLines="1-16"
import {
  createWorkflow,
  when,
} from "@medusajs/framework/workflows-sdk"
import { 
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { 
  CreateProductWorkflowInputDTO,
} from "@medusajs/framework/types"

type WorkflowInput = {
  product?: CreateProductWorkflowInputDTO
  should_create?: boolean
}

const workflow = createWorkflow(
  "hello-product",
  async (input: WorkflowInput) => {
    const product = when(input, ({ should_create }) => should_create)
      .then(() => {
        return createProductsWorkflow.runAsStep({
          input: {
            products: [input.product],
          },
        })
      })
  }
)
```

In this example, you use `when-then` to run the `createProductsWorkflow` only if `should_create` (passed in the `input`) is enabled.

Learn more about `when-then` in the [When-Then Conditions](https://docs.medusajs.com/learn/fundamentals/workflows/conditions) chapter.

***

## Errors in Nested Workflows

A nested workflow behaves similarly to a step in a workflow. So, if the nested workflow fails, it will throw an error that stops the parent workflow's execution and compensates previous steps.

In addition, if another step fails after the nested workflow, the nested workflow's steps will be compensated as part of the compensation process.

Learn more about handling errors in workflows in the [Error Handling](https://docs.medusajs.com/learn/fundamentals/workflows/errors) chapter.

***

## Nested Long-Running Workflows

When you execute a long-running workflow within another workflow, the parent workflow becomes a long-running workflow as well.

So, the parent workflow will wait for the nested workflow to finish before continuing its execution.

Refer to the [Long-Running Workflows](https://docs.medusajs.com/learn/fundamentals/workflows/long-running-workflow) chapter for more information on how to handle long-running workflows.
