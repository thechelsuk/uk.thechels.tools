---
layout: doc
title: Secure Development Policy Template
seo: Secure Development Policy Template
permalink: /secure-dev-policy
description: "A software engineering team leader secure development policy starter for 10 template"
category: templates
summary: "A secure development policy to adapt for your team."
group: policies
---

> Should be a word doc held by IT in central source available to all engineering function.
> Should be reviewed Annually in February by leadership team and adjust to reflect target operations.
> Adjust processes to align to this.

[[_TOC_]]

## INTRODUCTION

The following policy outlines the best practices and guidelines for secure software development within _[company]_

The policy is designed to ensure that all software development activities are conducted in a secure and controlled environment, and that the resulting software is free from known vulnerabilities that could be exploited by attackers.

The intended audience of this policy is those staff responsible for specifying, developing, and testing software.

### Guiding Principles (taken from NSSC SDP Guiding Principles)

1. Secure development is everyone’s responsibility.
2. It is the responsibility of everyone to keep their security knowledge up to date.
3. Code must be clean and maintainable.
4. The development environment must be secure.
5. The code repository must be secure.
6. The build and deployment pipeline must be secure.
7. Continually test and improve your security.
8. Plan for security flaws and bad actors.

## SCOPE

All [Company Name] applications and information systems that are business critical and/or process, store or transmit sensitive data, this policy applies to all internal and external engineers of [Company Name] software and infrastructure. This policy applies to human and/or AI-generated code.

## SOFTWARE DEVELOPMENT LIFECYCE (SDLC)

All software development projects must follow a secure and agile SDLC process, allowing for changing requirements and emergent issues and needs.

1. Requirements And design considerations of security and privacy must be made and be documented accordingly in this phase.
2. Software must be designed to be resilient to allow changes to be made safely.
3. Software must be designed to maintain the appropriate level of confidentiality of data it contains and processes.
4. Critical software must be designed to remain available and functional to a reasonable level of load, allowing that significant attacks may force downtime. Software should aim to meet service level and operational level agreements as agreed with business stakeholders.
5. Software must be designed to preserve the authenticity and integrity of all data collected and referenced.
6. Development teams should seek guidance from Information Security and Compliance expertise during initial design phases and beyond.
7. Authentication and authorization: Strong authentication and authorization controls must be implemented to prevent unauthorized access to sensitive data.
8. The software must be deployed in a secure environment, with appropriate access controls and monitoring in place.

### SECURITY OF THE DEVELOPMENT ENVIRONMENT

Securing the development environment is not about preventing developers from working. It is about understanding the risks to the environments, applying technical controls where appropriate and being able to trust and verify legitimate usage.

1. Ensure that the development environments are secure using the practices as outlined in this document, as well as consulting with architects, IT and Infosec teams on appropriate measures based on requirements and risk assessments.
2. Ensure the use of operational logging, security logging and least privilege access controls, for the development environment and solutions within it.
3. Work with Architects, IT and Infrastructure prior to any new/major developments to ensure a secure environment is made available which can be located in the Cloud, based on the requirements to ensure security, mitigate risks, and protect against threats.
4. Development of environments based in the Cloud should be stored in the UK where possible. If a necessary alternative Geo-location is required, must receive explicit approval from IT and Head of Engineering.  This is to ensure we meet applicable data protection legislation purposes as drawn out from business requirements. Consideration must be given to the cost and complexity to ensure that a rounded view is taken to provide redundancy and resilience.
5. When making major updates/implementing new services the location of the data being processed should be considered. For the avoidance of doubt, consult with Compliance team to ensure that documentation is updated to reflect processing locations.
6. Environments should be created through automated and repeatable pipelines where possible and practical to do so.
7. Ensure functionality for business users is kept separate from functionality intended for development use.
8. Ensure there are additional controls between the development environment and critical systems.
9. All communications between the application and external systems and users must be encrypted using industry-standard protocols. Data is encrypted in transit and at rest.

### SECURITY CONSIDERATIONS WITHIN THE PROJECT LIFECYCLE

Testing during software development is essential and recognised as good practice. It helps to gain confidence that the code being developed is functioning as intended and gain confidence in the security of products and services in the same way. Security testing can be manual, but it can also be automated.

1. All software must be tested for vulnerabilities before it is deployed into production.
2. Only approved libraries, languages and tools may be used in software development.
3. Security analysis and assessment must be factored into refinement and planning of work items. An example of this assessment could be the use of the STRIDE model.
4. Access control must be tested throughout the development lifecycle of the product by the scrum development team.
5. Development teams should seek guidance from the IT and Compliance Team throughout the duration of the development lifecycle.
6. Use Point-in-time assessments, such as penetration testing, in line with Information Security and Data Protection team roadmaps, this is particularly necessary for new functionality.
7. Any credentials used for testing (automatic or manual) should be stored securely e.g.  KeyVault or managed identities
8. Use of live data for testing purposes must be used in compliance with GDPR and go through an automated process of anonymisation and obfuscation.
9. Independent quality assurance is achieved through analysis by third party software e.g. GitHub’s Advanced Security.

### SECURE REPOSITORIES

1. All code must be stored in appropriately secured, cloud based, repositories and those repositories must be held within approved, [Company Name] controlled, version control systems.
2. All code repositories are protected by centrally managed accounts and those accounts are managed by IT.
3. No code should be stored in public facing repositories without prior approval from Head of Engineering.
4. Repositories must not contain credentials and credentials are blocked from being added to code repositories.
5. All code repositories containing deployed code, or code that is intended be deployed, must be analysed by quality checking tools e.g., GitHub Advanced Security CodeQL or similar.
6. Gated access or controls, around publishing to further environments, must be in place.
7. Developers make use of multi-factor authentication when accessing code repositories where possible (e.g., GitHub, NuGet, NPM).
8. Access to source code repositories is reviewed regularly, in line with the leavers and joiners process.

## SECURITY TESTING

All code must be tested for security vulnerabilities in line with the OWASP top 10 recommendations. This should include the use of automated testing tools and manual code reviews.
Penetration Testing should be carried out by an approved party on an agreed schedule in line with the business’ requirements and risk appetite.
Regular maintenance must be performed on the software to identify and address any new vulnerabilities that may arise.

## ACCESS CONTROL

Access to development environments, source code, and software artifacts must be tightly controlled to prevent unauthorized access or modification. Access controls must be implemented for all personnel involved in the software development process, including contractors and third-party vendors.

## INCIDENT RESPONSE

An incident response plan must be in place to ensure that any security incidents are detected and responded to in a timely manner. The plan should include procedures for reporting incidents, containing the damage, and restoring normal operations.

## COMPLIANCE

All software development activities must comply with industry standards and regulatory requirements, such as the General Data Protection Regulation (GDPR).

## TRAINING AND AWARENESS

All personnel involved in software development must receive regular training and awareness on secure coding practices, vulnerability management, and incident response procedures.

### REQUIRED APPLICATION SECURITY KNOWLEDGE

1. Relevant documentation is created and stored appropriately in accordance with a team’s established processes.
2. Access control and measures are in place.
3. Run retrospective sessions to learn from mistakes. Provide discussion and feedback for future code and/or processes.

### DEVELOPMENT TEAM CAPABILITY

1. We aim to ensure that the development team:
a. Are trained, coached and /or mentored and are appropriately equipped to complete development activities.
b. Are trained in relevant compliance and legislative requirements, and certified where applicable.
c. Are trained in agile development approach providing quick response to known security related issues.
d. Are aware of and encouraged to use test-driven development and pair programming techniques and a ‘many eyes approach’ to development activities to reduce security vulnerabilities.
e. Peer review code to ensure confidence in quality and security.

2. Where source is stored in Git repositories code should be merged into main branches via pull requests. Branch policies must be in place to ensure changes are reviewed and approved before merge.
3. Robust testing practices through unit testing, integration testing, functional testing, and continuous regression testing throughout the development lifecycle through an early and often approach.
4. Trusted and trained to act appropriately and accordingly and to report issues when unsure or risk identified.
5. Code defensively to ensure inputs are not compromised especially around critical components or exposed endpoints.

## CONCLUSION

This policy provides a framework for secure software development within [Company Name]. Adherence to these guidelines will help to ensure that software is developed in a secure and controlled environment, and that vulnerabilities are identified and addressed before they can be exploited by attackers.
