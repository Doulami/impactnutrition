# Infrastructure Modules

Medusa's architectural functionalities, such as emitting and subscribing to events or caching data, are all implemented in Infrastructure Modules. An Infrastructure Module is a package that can be installed and used in any Medusa application. These modules allow you to choose and integrate custom services for architectural purposes.

For example, you can use our [Redis Event Module](https://docs.medusajs.com/infrastructure-modules/event/redis) to handle event functionalities, or create a custom module that implements these functionalities with Memcached. Learn more in [the Architecture documentation](https://docs.medusajs.com/learn/introduction/architecture).

This section of the documentation showcases Medusa's Infrastructure Modules, how they work, and how to use them in your Medusa application.

## Analytics Module

The Analytics Module is available starting [Medusa v2.8.3](https://github.com/medusajs/medusa/releases/tag/v2.8.3).

The Analytics Module exposes functionalities to track and analyze user interactions and system events. For example, tracking cart updates or completed orders. Learn more in the [Analytics Module documentation](https://docs.medusajs.com/infrastructure-modules/analytics).

{/* The Analytics Module has module providers that implement the underlying logic of integrating third-party services for tracking analytics. The following Analytics Module Providers are provided by Medusa. You can also create a custom provider as explained in the [Create Analytics Module Provider guide](/references/analytics/provider). */}

- [Local](https://docs.medusajs.com/infrastructure-modules/analytics/local)
- [PostHog](https://docs.medusajs.com/infrastructure-modules/analytics/posthog)

## Caching Module

The Caching Module provides functionality to cache data in your Medusa application, improving performance and reducing latency for frequently accessed data.

The following Caching modules are provided by Medusa. You can also create a custom Caching Module Provider as explained in the [Create Caching Module Provider guide](#).

The Caching Module is available starting [Medusa v2.11.0](https://github.com/medusajs/medusa/releases/tag/v2.11.0). It replaces the deprecated [Cache Module](https://docs.medusajs.com/infrastructure-modules/cache).

- [Redis](https://docs.medusajs.com/infrastructure-modules/caching/providers/redis)
- [Memcached](#)

***

## Event Module

An Event Module implements the underlying publish/subscribe system that handles queueing events, emitting them, and executing their subscribers.  Learn more in [this documentation](https://docs.medusajs.com/infrastructure-modules/event).

The following Event modules are provided by Medusa. You can also create your own event module as explained in [this guide](https://docs.medusajs.com/infrastructure-modules/event/create).

- [Local](https://docs.medusajs.com/infrastructure-modules/event/local)
- [Redis](https://docs.medusajs.com/infrastructure-modules/event/redis)

***

## File Module

The File Module handles file upload and storage of assets, such as product images. Refer to the [File Module documentation](https://docs.medusajs.com/infrastructure-modules/file) to learn more about it.

The File Module has module providers that implement the underlying logic of handling uploads and downloads of assets, such as integrating third-party services. The following File Module Providers are provided by Medusa. You can also create a custom provider as explained in the [Create File Module Provider guide](https://docs.medusajs.com/references/file-provider-module).

- [Local](https://docs.medusajs.com/infrastructure-modules/file/local)
- [AWS S3 (and Compatible APIs)](https://docs.medusajs.com/infrastructure-modules/file/s3)

***

## Locking Module

The Locking Module manages access to shared resources by multiple processes or threads. It prevents conflicts between processes and ensures data consistency. Refer to the [Locking Module documentation](https://docs.medusajs.com/infrastructure-modules/locking) to learn more about it.

The Locking Module uses module providers that implement the underlying logic of the locking mechanism. The following Locking Module Providers are provided by Medusa. You can also create a custom provider as explained in the [Create Locking Module Provider guide](https://docs.medusajs.com/references/locking-module-provider).

- [Redis](https://docs.medusajs.com/infrastructure-modules/locking/redis)
- [PostgreSQL](https://docs.medusajs.com/infrastructure-modules/locking/postgres)

***

## Notification Module

The Notification Module handles sending notifications to users or customers, such as reset password instructions or newsletters. Refer to the [Notification Module documentation](https://docs.medusajs.com/infrastructure-modules/notification) to learn more about it.

The Notification Module has module providers that implement the underlying logic of sending notifications, typically through integrating a third-party service. The following modules are provided by Medusa. You can also create a custom provider as explained in the [Create Notification Module Provider guide](https://docs.medusajs.com/references/notification-provider-module).

- [Local](https://docs.medusajs.com/infrastructure-modules/notification/local)
- [SendGrid](https://docs.medusajs.com/infrastructure-modules/notification/sendgrid)

### Notification Module Provider Guides

- [Send Notification](https://docs.medusajs.com/infrastructure-modules/notification/send-notification)
- [Create Notification Provider](https://docs.medusajs.com/references/notification-provider-module)
- [Resend](https://docs.medusajs.com/integrations/guides/resend)

***

## Workflow Engine Module

A Workflow Engine Module handles tracking and recording the transactions and statuses of workflows and their steps. Learn more about it in the [Workflow Engine Module documentation](https://docs.medusajs.com/infrastructure-modules/workflow-engine).

The following Workflow Engine modules are provided by Medusa.

- [In-Memory](https://docs.medusajs.com/infrastructure-modules/workflow-engine/in-memory)
- [Redis](https://docs.medusajs.com/infrastructure-modules/workflow-engine/redis)
