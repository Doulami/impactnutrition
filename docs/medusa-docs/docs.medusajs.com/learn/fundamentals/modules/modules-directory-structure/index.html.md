# Modules Directory Structure

In this chapter, you'll learn about the expected files and directories in your module.

![Module Directory Structure Example](https://res.cloudinary.com/dza7lstvk/image/upload/v1714379976/Medusa%20Book/modules-dir-overview_nqq7ne.jpg)

## index.ts

The `index.ts` file is in the root of your module's directory and exports the module's definition as explained in the [Modules](https://docs.medusajs.com/learn/fundamentals/modules) chapter.

***

## service.ts

A module must have a main service that contains the module's business logic. It's created in the `service.ts` file at the root of your module directory as explained in the [Modules](https://docs.medusajs.com/learn/fundamentals/modules) chapter.

***

## Other Directories

The following directories are optional and you can choose to create them based on your module's functionality:

- `models`: Holds the [data models](https://docs.medusajs.com/learn/fundamentals/data-models) representing tables in the database.
- `migrations`: Holds the [migration](https://docs.medusajs.com/learn/fundamentals/data-models/write-migration) files used to reflect changes on the database.
- `loaders`: Holds the [script files to run on the application's startup](https://docs.medusajs.com/learn/fundamentals/modules/loaders) when Medusa loads the module.
