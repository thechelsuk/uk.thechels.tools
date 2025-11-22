---

layout: index
title: Principles
seo: Principles
permalink: /principles

---


> We aim to deliver the maximal outcome for the minimal amount of work.

We work in small fixed iterations of two-weeks, we set an ever-increasing high bar for quality, such that the only variable is the scope (i.e. the amount of work we commit to deliver in a sprint).

This quick feedback loop allows us to learn ([Empiricism](https://www.scrum.org/resources/blog/three-pillars-empiricism-scrum)) what doesn't work such that we can improve or change next time.

# Optimising for Speed (throughput) and Quality

There is no trade-off between speed and quality. You can have both and if we optimise for one, we grow and benefit from the other.

## Speed = Cycle time & Deployment Frequency

**Cycle time** = is a measure from the moment work starts to work being completed, by optimising for a low cycle time (_typically high performing teams have a cycle time of 24 hours_) then work is inevitably smaller, smaller changes are easier to review, easier to test and easier to deploy - reducing the impact of a big bang. Smaller releases means any failure can be identified and fixed more quickly e.g. rollback or fix forward.

Other variants of this metric include lead time - the time from story creation to work being completed and this includes the time an item is sat in a backlog, e.g. includes refinement and waiting time. Cycle Time can also be the time work is started (first commit) to PR being created, however, using Azure DevOps we'll use their ticket cycle time as a proxy.

**Deployment frequency**  = in order to push to production (_and high performing teams do this on demand multiple times a day [if the business can accept]_). Optimising for deployments means work has to be smaller to get the approval. The more often we deploy the quicker we are to add value for our customers, by releasing often we reduce the mean time to restore as we can easily deploy again a fix.

## Quality = Change Failure Rate & Mean Time To Restore

**Change failure rate** = is a measure of how often a deployment results in an incident, that is a degradation of service such that our users cannot perform the outcome intended, this isn't the same as a bug. We measure this as a percentage of deployments that have failed _and high performing teams have a change failure rate of less than 3%_ - By optimising for low change failure rate (or **CFR**) we end up with more deployments. A once a year deployment encompassing 12 months of changes has a much greater risk of failure and would be 100%. By increasing the number of deployments to say 26.. say once a sprint.. then the percentage for that one breaking change is 1/26 or 3.84% but if we do get to multiple deployments a day so 700 a year ish, that becomes 0.143% and elite!

**Mean time to restore** = is a measure in hours of how long it takes to restore the service to a working state. _High performing teams typically restore within an hour_. Optimising for ***MTTR*** means having a strong CI/CD pipeline and the ability to revert a deployment, it's a lot easier to revert a deployment when the change is smaller, reducing the impact on our customers. So by trying to optimise for restoration we value having a smaller deployment.

> Quality is everyone's responsibility - W. Edwards Deming

# Optimising for Learning

We optimise for learning by not rushing in to code, thinking more and planning well, such that we can uncover the simplest solution to a problem eliminating waste (you ain't gonna need it YAGNI, keep it simple KIS, maximising the work not done)

We accept and welcome change, we embrace uncertainty and we estimate our work given what we knew at the time.

- We assume we are wrong
- We work iteratively
- Control the variables
- Proceed in small steps
- Gather feedback
- We adopt an experimental approach to progress
- We review and reflect ([inspection](https://www.scrum.org/resources/blog/three-pillars-empiricism-scrum)) every sprint to find ways to improve our processes and ways of working ([adaption](https://www.scrum.org/resources/blog/three-pillars-empiricism-scrum))

# Optimising for teams

- We work in small cross-functional teams with a focus on collaboration
- With psychological safety
- Encouraging open and honest feedback in a caring way ([Radical Candor](https://www.radicalcandor.com/our-approach))

- Trust (sharing vulnerabilities with the group)
- Embrace conflict (utilising constructive and passionate debate over feigning agreement and "I don't mind")
- Commitment (by disagreeing and committing whole-heartedly to the team decision)
- Accountability (by calling out peers, leaders, or counterproductive behaviours to raise standards over ducking responsibility and blaming others)
- Pay attention to results (by focusing on team success over personal success, status, and ego).

> Regardless of what we discover, we understand and truly believe that everyone did the best job they could, given what they knew at the time, their skills and abilities, the resources available, and the situation at hand. - The Prime Directive.

We take every opportunity keep people informed and to teach/coach/support our teammates

# Optimising for alignment

- We work in two-week sprints (or cycles)
- We constantly refine our backlog as a breakdown of our roadmap and additional work items (e.g. bugs, technical debt, process improvements).
- We have a golden thread from `Company objectives -> Roadmap Items (Epics) -> Features -> Stories -> Tasks`
- We plan the cycle around a single _sprint goal_ That is a deliverable piece of value to our customers, we commit to deliver a number of work items to achieve that goal and prioritise these work items over everything else.

# Optimising for openness and transparency

- We provide feedback on progress, challenges, blockers and issues early and often such that anyone is abreast of the current situation.
- Everyone strives and collectively collaborates for the common organizational objective, and no one has any hidden agenda
- We use different communication media for the benefit of group, e.g., follow up documentation, Teams posts, minutes from verbal chats.
- We are open with each other when we are unsure or find complexity or difficulty
- We over-communicate given many work in a remote setting, we follow-up and check understanding
- We are transparent and use facts as is. ([transparency](https://www.scrum.org/resources/blog/three-pillars-empiricism-scrum))
