---
layout: doc
title: SLA Policy Template
seo: SLA Policy Template
permalink: /Service-level-agreement-policy
description: "A software engineering team leader's service level agreement policy template"
category: templates
summary: "A service level agreement policy to adapt for your team."
group: policies
---

> SLA Policy review every 6 months - last _[date]_

[[_TOC_]]

## INTRODUCTION

To Set out the needs and requirements of the business with regards to uptime, error allowance and performance of systems commensurate with business needs.

## COMMON LANGUAGE

_SLA_ - Service level agreements

_SLO_ - Service level objectives can give a low-noise signal as to the overall health of services.

_SLI_ - Service level indicators is a quantitative measure of some aspect of the service. Typically this could be latency or availability.

_"Three 9s"_ refers to 99.9% uptime, this allows an error budget of 1 minus the SLO or SLA. For example three 9s would allow 1000 errors from 100,000 requests to an API without breaching contractual agreements.

_"Four 9s"_ refers to 99.99% uptime, this allows an error budget of 1 minus the SLO or SLA. For example four 9s would allow 100 errors from 100,000 requests to an API without breaching contractual agreements.

_Error Budget_ - An error budget is the maximum amount of time that a technical system can fail without contractual consequences.

_Compliance Periods_ - The period of time of which the SLO/SLA is measured. e.g. a rolling 30 day period, or rolling 12 month period, or a fixed quarter.

## AGREED SERVICE LEVELS

- SLO
  - Latency - TBD
  - Availability - Uptime of Three nines (8.77 hours error budget) per 12 month rolling period.

## APPENDIX

| Availability%               | Downtime per year | Downtime per quarter | Downtime per month | Downtime per week | Downtime per day (24 hours) |
|:----------------------------|:------------------|:---------------------|:-------------------|:------------------|:----------------------------|
| 90% ("one nine")            | 36.53 days        | 9.13 days            | 73.05 hours        | 16.80 hours       | 2.40 hours                  |
| 95% ("one nine five")       | 18.26 days        | 4.56 days            | 36.53 hours        | 8.40 hours        | 1.20 hours                  |
| 99% ("two nines")           | 3.65 days         | 21.9 hours           | 7.31 hours         | 1.68 hours        | 14.40 minutes               |
| 99.5% ("two nines five")    | 1.83 days         | 10.98 hours          | 3.65 hours         | 50.40 minutes     | 7.20 minutes                |
| 99.9% ("three nines")       | 8.77 hours        | 2.19 hours           | 43.83 minutes      | 10.08 minutes     | 1.44 minutes                |
| 99.99% ("four nines")       | 52.60 minutes     | 13.15 minutes        | 4.38 minutes       | 1.01 minutes      | 8.64 seconds                |
| 99.999% ("five nines")      | 5.26 minutes      | 1.31 minutes         | 26.30 seconds      | 6.05 seconds      | 864.00 Milliseconds         |
