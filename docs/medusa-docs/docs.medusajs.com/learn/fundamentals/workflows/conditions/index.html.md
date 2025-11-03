# Conditions in Workflows with When-Then

In this chapter, you'll learn how to execute an action based on a condition in a workflow using when-then from the Workflows SDK.

## Why If-Conditions Aren't Allowed in Workflows?

Medusa creates an internal representation of the workflow definition you pass to `createWorkflow` to track and store the workflow's steps. At that point, variables in the workflow don't have any values. They only do when you execute the workflow.

So, you can't use an if-condition that checks a variable's value, as the condition will be evaluated when Medusa creates the internal representation of the workflow, rather than during execution.

Instead, use `when-then` from the Workflows SDK. It allows you to perform steps in a workflow only if a condition that you specify is satisfied.

Restrictions for conditions is only applicable in a workflow's definition. You can still use if-conditions in your step's code.

***

## How to use When-Then?

The Workflows SDK provides a `when` function that is used to check whether a condition is true. You chain a `then` function to `when` that specifies the steps to execute if the condition in `when` is satisfied.

For example:

```ts highlights={highlights}
import { 
  createWorkflow,
  WorkflowResponse,
  when,
} from "@medusajs/framework/workflows-sdk"
// step imports...

const workflow = createWorkflow(
  "workflow", 
  function (input: {
    is_active: boolean
  }) {

    const result = when(
      input, 
      (input) => {
        return input.is_active
      }
    ).then(() => {
      const stepResult = isActiveStep()
      return stepResult
    })

    // executed without condition
    const anotherStepResult = anotherStep(result)

    return new WorkflowResponse(
      anotherStepResult
    )
  }
)
```

In this code snippet, you execute the `isActiveStep` only if the `input.is_active`'s value is `true`.

### When Parameters

`when` accepts two parameters:

1. The first parameter is either an object or the workflow's input. This data is passed as a parameter to the function in `when`'s second parameter.
2. The second parameter is a function that returns a boolean indicating whether to execute the action in `then`.
   - You can perform conditional checks or use conditional operators in this function, but only on the function's parameters.

### Then Callback Function

To specify the action to perform if the condition is satisfied, chain a `then` function to `when` and pass it a callback function. The callback function is only executed if `when`'s second parameter function returns a `true` value.

The callback function passed to `then` is treated the same as the workflow's definition function. That means:

- You can execute steps in the callback function.
- You can't [transform data and variables](https://docs.medusajs.com/learn/fundamentals/workflows/variable-manipulation) in the callback function. Instead, use `transform`.
- You can't use if-else conditions in the callback function.
- You can't use loops in the callback function.
- You should keep in mind the [workflow constructor constraints](https://docs.medusajs.com/learn/fundamentals/workflows/constructor-constraints) in the callback function.

***

## Implementing If-Else with When-Then

`when-then` doesn't support if-else conditions. Instead, use two `when-then` conditions in your workflow.

For example:

```ts highlights={ifElseHighlights}
const workflow = createWorkflow(
  "workflow", 
  function (input: {
    is_active: boolean
  }) {

    const isActiveResult = when(
      input, 
      (input) => {
        return input.is_active
      }
    ).then(() => {
      return isActiveStep()
    })

    const notIsActiveResult = when(
      input,
      (input) => {
        return !input.is_active
      }
    ).then(() => {
      return notIsActiveStep()
    })

    // ...
  }
)
```

In the above workflow, you use two `when-then` blocks. The first one performs a step if `input.is_active` is `true`, and the second performs a step if `input.is_active` is `false`, acting as an else condition.

***

## Specify Name for When-Then

Internally, `when-then` blocks have a unique name similar to a step. When you return a step's result in a `when-then` block, the block's name is derived from the step's name. For example:

```ts
const isActiveResult = when(
  input, 
  (input) => {
    return input.is_active
  }
).then(() => {
  return isActiveStep()
})
```

This `when-then` block's internal name will be `when-then-is-active`, where `is-active` is the step's name.

However, if you need to return in your `when-then` block something other than a step's result, you need to specify a unique step name for that block. Otherwise, Medusa will generate a random name for it which can cause unexpected errors in production.

You pass a name for `when-then` as a first parameter of `when`, whose signature can accept three parameters in this case. For example:

```ts highlights={nameHighlights}
const { isActive } = when(
  "check-is-active",
  input, 
  (input) => {
    return input.is_active
  }
).then(() => {
  const isActive = isActiveStep()

  const returnData = transform({
    isActive,
  }, (data) => {
    return {
      message: data.isActive ? "Active" : "Not Active",
    }
  })

  return returnData
})
```

Since `then` returns a value different than the step's result, you pass to the `when` function the following parameters:

1. A unique name to be assigned to the `when-then` block.
2. Either an object or the workflow's input. This data is passed as a parameter to the function in `when`'s second parameter.
3. A function that returns a boolean indicating whether to execute the action in `then`.

The second and third parameters are the same as the parameters you previously passed to `when`.
