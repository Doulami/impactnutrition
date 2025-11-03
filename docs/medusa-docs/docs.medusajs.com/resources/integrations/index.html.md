# Integrations

You can integrate any third-party service to Medusa, including storage services, notification systems, Content-Management Systems (CMS), etc… By integrating third-party services, you build flows and synchronize data around these integrations, making Medusa not only your commerce application, but a middleware layer between your data sources and operations.

Medusa provides integrations out-of-the-box that are listed here, but you can also create your own integrations, such as integrating ERP systems, as explained in [this guide](https://docs.medusajs.com/learn/customization/integrate-systems).

This section holds guides to help technical teams add integrations to a Medusa application. If you're not a technical user, refer your technical team to this documentation instead.

## Analytics

An Analytics Module Provider tracks events and user behavior in your Medusa application using a third-party service.

- [PostHog](https://docs.medusajs.com/infrastructure-modules/analytics/posthog)
- [Segment](https://docs.medusajs.com/integrations/guides/segment)

Learn how to integrate a custom third-party analytics provider in the [Create Analytics Module Provider](https://docs.medusajs.com/references/analytics/provider) documentation.

***

## Auth

An Auth Module Provider authenticates users with their account on a third-party service.

- [Google](https://docs.medusajs.com/commerce-modules/auth/auth-providers/google)
- [GitHub](https://docs.medusajs.com/commerce-modules/auth/auth-providers/github)

Learn how to integrate a custom third-party authentication provider in the [Create Auth Module Provider](https://docs.medusajs.com/references/auth/provider) documentation.

***

## CMS

Integrate a third-party Content-Management System (CMS) to utilize rich content-related features.

- [Contentful (Localization)](https://docs.medusajs.com/integrations/guides/contentful)
- [Payload CMS](https://docs.medusajs.com/integrations/guides/payload)
- [Sanity](https://docs.medusajs.com/integrations/guides/sanity)

***

## ERP

Integrate your business's Enterprise Resource Planning (ERP) system with Medusa to sync products and orders, restrict purchase with custom rules, and more.

To learn about the general approach of integrating an ERP with Medusa and the different use cases you can implement, refer to the [ERP Recipe](https://docs.medusajs.com/recipes/erp).

- [Odoo](https://docs.medusajs.com/recipes/erp/odoo)

***

## File

A File Module Provider uploads and manages assets, such as product images, on a third-party service.

- [AWS S3 (and Compatible APIs)](https://docs.medusajs.com/infrastructure-modules/file/s3)

Learn how to integrate a custom third-party file or storage provider in the [Create File Module Provider](https://docs.medusajs.com/references/file-provider-module) documentation.

***

## Fulfillment

A Fulfillment Module Provider provides fulfillment options during checkout, calculates shipping rates, and processes an order's fulfillments.

- [ShipStation](https://docs.medusajs.com/integrations/guides/shipstation)

Learn how to integrate a third-party fulfillment provider in the [Create Fulfillment Module Provider](https://docs.medusajs.com/references/fulfillment/provider) documentation.

***

## Instrumentation

Integrate a third-party service to monitor performance, errors, and other metrics in your Medusa application.

- [Sentry](https://docs.medusajs.com/integrations/guides/sentry)

***

## Migration

Migrate data from another ecommerce platform to Medusa.

- [Magento](https://docs.medusajs.com/integrations/guides/magento)

***

## Notification

A Notification Module Provider sends messages to users and customers in your Medusa application using a third-party service.

- [SendGrid](https://docs.medusajs.com/infrastructure-modules/notification/sendgrid)
- [Mailchimp](https://docs.medusajs.com/integrations/guides/mailchimp)
- [Resend](https://docs.medusajs.com/integrations/guides/resend)
- [Slack](https://docs.medusajs.com/integrations/guides/slack)
- [Twilio SMS](https://docs.medusajs.com/how-to-tutorials/tutorials/phone-auth#step-3-integrate-twilio-sms)

Learn how to integrate a third-party notification provider in the [Create Notification Module Provider](https://docs.medusajs.com/references/notification-provider-module) documentation.

***

## Payment

A Payment Module Provider processes payments made in your Medusa store using a third-party service.

- [Stripe](https://docs.medusajs.com/commerce-modules/payment/payment-provider/stripe)

Learn how to integrate a third-party payment provider in the [Create Payment Module Provider](https://docs.medusajs.com/references/payment/provider) documentation.

***

## Search

Integrate a search engine to index and search products or other types of data in your Medusa application.

- [Algolia](https://docs.medusajs.com/integrations/guides/algolia)
- [Meilisearch](https://docs.medusajs.com/integrations/guides/meilisearch)

***

## Tax

Integrate a third-party tax calculation service to handle tax rates and rules in your Medusa application.

- [Avalara](https://docs.medusajs.com/integrations/guides/avalara)
