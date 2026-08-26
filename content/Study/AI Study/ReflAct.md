---
publish: true
---



# ReflAct: World-Grounded Decision Making in LLM Agents via Goal-State Reflection

**Paper:** _ReflAct: World-Grounded Decision Making in LLM Agents via Goal-State Reflection_  
**Authors:** Jeonghye Kim, Sojeong Rhee, Minbeom Kim, Dohyung Kim, Sangmook Lee, Youngchul Sung, Kyomin Jung  
**Version:** arXiv:2505.15182v2 (2025)  
**Institutions:** KAIST, Seoul National University

---

## 1. One-Sentence Summary

**ReflAct is a training-free reasoning backbone that replaces ReAct-style “what should I do next?” reasoning with continuous reflection on the agent’s current state in relation to the final task goal before selecting each action.**

The paper’s central claim is:

> Instead of repeatedly adding memory, post-task reflection, or planning modules on top of ReAct, it can be more effective to redesign the reasoning backbone itself around **state grounding and continuous goal alignment**.

---

# 2. Motivation

LLM agents typically solve long-horizon tasks through an iterative loop:

```
Observation
   ↓
Thought
   ↓
Action
   ↓
New Observation
   ↓
...
```

A representative framework is **ReAct**.

At each timestep, ReAct observes the current context/history and generates something like:

```
Thought: What should I do next?
Action: ...
```

The problem is that if the `Thought` is wrong, it can strongly bias the downstream action selection.

---

# 3. Core Problems of ReAct Identified by the Authors

The paper identifies two major failure modes.

## 3.1 Lack of Grounding in the Internal State

The agent often fails to maintain a coherent representation of the actual environment state.

Examples include:

- revisiting a location that was already checked,
    
- believing it is holding an object when it is not,
    
- generating beliefs that contradict previous observations,
    
- repeatedly exploring locations that have already been ruled out.
    

In other words, the agent’s **belief state** can diverge from the actual interaction history.

---

## 3.2 Short-Sighted Planning

ReAct thoughts often focus on:

> What is the next locally plausible action?

rather than:

> Does this action actually move the agent closer to the final task goal?

In long-horizon tasks, small reasoning errors can accumulate and gradually push the entire trajectory away from the goal.

---

# 4. How Thought Influences Action

The authors emphasize that ReAct’s `Thought` is not merely an explanation. It acts as a strong conditioning signal for the action policy.

Let the current context be:

$$
c_t = (h_t, o_t)  
$$

where (h_t) is the interaction history and (o_t) is the current observation.

ReAct first generates a thought:

$$  
\tau_t \sim \pi_{\theta}^{thought}(\cdot \mid c_t)  
$$

The thought is then appended to the context:

$$  
c'_t = c_t \oplus \tau_t  
$$

and the next action is sampled as:

$$  
a_t \sim \pi_{\theta}^{act}(\cdot \mid c'_t)  
$$

Therefore, if the generated thought is ungrounded, it can directly push the action distribution toward an incorrect action.

---

# 5. How Strongly Does Thought Affect the Action Distribution?

In an ALFWorld experiment, the authors compare:

- **NoThinking**
    
- **ReAct**
    

using the entropy of the action probability distribution.

|Method|Average Action Entropy|
|---|---|
|NoThinking|1.23|
|ReAct|0.30|

The much lower entropy under ReAct means that adding a thought makes the model much more confident about a smaller set of actions.

This creates a double-edged effect:

```
Correct Thought
    ↓
Probability of correct action ↑

Wrong / Ungrounded Thought
    ↓
Probability of wrong action ↑
```

Therefore, the problem is not simply whether the agent reasons, but **whether its reasoning is properly grounded**.

---

# 6. Core Idea of ReflAct

ReflAct replaces the ReAct cycle:

```
Observation
   ↓
Thought about next action
   ↓
Action
```

with:

```
Observation + Interaction History + Goal
                  ↓
      Reflect on current state
       in relation to the goal
                  ↓
                Action
```

The key question becomes:

> **What state am I currently in, and how does this state relate to the final goal?**

---

# 7. ReflAct Prompt

The central ReflAct instruction is very simple:

```
You should first reflect on the agent's state in relation to the task goal,
and then output the action for this turn.
```

No model fine-tuning or additional learned component is required.

Therefore, ReflAct can be applied to:

- GPT-4o
    
- GPT-4o-mini
    
- Llama-3.1-Instruct
    
- other API-only or closed LLMs
    

as a **training-free, prompting-based reasoning backbone**.

---

# 8. Thought vs. Reflection

The paper contrasts ReAct-style thought with ReflAct-style reflection.

## ReAct-Style Thought

```
Thought:
Now I find a spraybottle 2.
Next, I need to take it.
```

This is mostly centered on the **next action**.

## ReflAct-Style Reflection

```
Reflection:
Currently, I am at cabinet 2 and have found a spraybottle 2,
which brings me closer to completing the task of placing it on the toilet.
```

The reflection explicitly represents:

1. the **current belief state**, and
    
2. its **relationship to the task goal**.
    

---

# 9. Formalization of ReflAct

The paper models the language-based agent environment as a POMDP:

$$
\mathcal{M} = \langle U, S, A, O, P, R \rangle
$$

where:

- (U): task instruction
    
- (S): hidden environment state
    
- (A): action
    
- (O): observation
    
- (P): transition function
    
- (R): reward
    

Because the environment is partially observable, the true state (s_t) is not directly accessible.

**The agent must therefore infer an internal belief state from its interaction history.

ReflAct introduces a reflection space (K), where each reflection (k) is intended to encode:

```
Reflection k
 ├── Internal belief state M
 └── Task goal G
```

This creates the following dependency:

```
Belief State + Goal
        ↓
   Reflection
        ↓
     Action
```

---

# 10. The Paper’s View of an Optimal Thought

Let the long-term return be:

$$ 
G_t = \sum_{k=0}^{\infty}\gamma^k R_{t+k}  
$$

The optimal reasoning step should not merely describe the next action. Instead, it should condition the downstream policy in a way that maximizes long-term return.

The paper’s intuition can be summarized as:

```
Less useful reasoning:
Observation → "What should I do next?"

More useful reasoning:
History + Observation
        ↓
What state am I actually in?
        ↓
How does this state relate to the final goal?
        ↓
What action moves me toward that goal?
```

---

# 11. Experimental Setup

## Benchmarks

### ALFWorld

Embodied household tasks involving:

```
find object
→ manipulate object
→ move object
→ place object
```

Metric:

- Success Rate (SR)
    

---

### ScienceWorld

A text-based scientific environment requiring multi-step procedural and scientific reasoning.

Metrics:

- Success Rate
    
- Average Reward (AR)
    

---

### Jericho

Interactive fiction environments requiring:

- commonsense reasoning,
    
- exploration,
    
- memory,
    
- long-horizon planning.
    

Metrics:

- Success Rate
    
- Average Reward
    

---

## Backbone Models

The main experiments use:

- GPT-4o
    
- GPT-4o-mini
    
- Llama-3.1-8B-Instruct
    
- Llama-3.1-70B-Instruct
    

Additional experiments use:

- Qwen3-8B
    

This shows that ReflAct is not tied to a specific model family.

---

# 12. Baselines

## NoThinking

```
Observation → Action
```

No explicit intermediate reasoning.

---

## ReAct

```
Observation
→ Thought about next action
→ Action
```

---

## Plan-and-Act

The model creates a plan only at the first timestep:

```
Initial Observation
      ↓
   Global Plan
      ↓
Action → Action → Action → ...
```

No further explicit reasoning is performed later.

---

## ReflAct

At every timestep:

```
Observation / History
       ↓
Current State ↔ Goal Reflection
       ↓
Action
```

---

# 13. Main Results

## GPT-4o

|   |   |   |   |   |   |   |
|---|---|---|---|---|---|---|
|Method|ALFWorld SR|ScienceWorld AR|ScienceWorld SR|Jericho AR|Jericho SR|Average|
|NoThinking|76.1|67.4|50.2|27.8|10.0|46.3|
|ReAct|85.1|68.7|55.9|50.4|20.0|56.0|
|Plan-and-Act|85.8|68.7|55.0|45.6|20.0|55.0|
|**ReflAct**|**93.3**|**68.9**|**57.8**|**53.2**|**35.0**|**61.6**|

---

## GPT-4o-mini

|   |   |   |   |   |   |   |
|---|---|---|---|---|---|---|
|Method|ALFWorld SR|ScienceWorld AR|ScienceWorld SR|Jericho AR|Jericho SR|Average|
|NoThinking|43.3|42.3|21.8|18.8|5.0|26.2|
|ReAct|53.0|49.1|37.0|29.8|15.0|36.8|
|Plan-and-Act|59.0|51.8|35.5|37.1|15.0|39.7|
|**ReflAct**|**66.4**|**55.4**|**37.0**|**45.4**|**20.0**|**44.8**|

---

## Llama-3.1-8B-Instruct

|   |   |   |   |   |   |   |
|---|---|---|---|---|---|---|
|Method|ALFWorld SR|ScienceWorld AR|ScienceWorld SR|Jericho AR|Jericho SR|Average|
|NoThinking|21.6|29.9|14.2|10.0|0.0|15.1|
|ReAct|29.1|43.0|27.5|12.8|0.0|22.5|
|Plan-and-Act|30.6|34.2|14.7|10.6|0.0|18.0|
|**ReflAct**|**60.5**|**47.2**|**33.2**|**20.9**|**10.0**|**34.4**|

The effect is especially large for the smaller model.

---

## Llama-3.1-70B-Instruct

|   |   |   |   |   |   |   |
|---|---|---|---|---|---|---|
|Method|ALFWorld SR|ScienceWorld AR|ScienceWorld SR|Jericho AR|Jericho SR|Average|
|NoThinking|53.7|65.6|46.4|27.4|5.0|39.6|
|ReAct|81.3|66.4|53.1|33.9|10.0|48.9|
|Plan-and-Act|81.3|67.7|52.6|29.6|10.0|48.2|
|**ReflAct**|**83.6**|**73.7**|**58.8**|**44.5**|**20.0**|**56.1**|

---

# 14. ReflAct vs. ReAct Improvement

Reported improvement over ReAct:

|   |   |
|---|---|
|Environment|Improvement over ReAct|
|ALFWorld|**+36.4%**|
|ScienceWorld|**+8.5%**|
|Jericho|**+38.1%**|

Reported improvement over NoThinking:

|   |   |
|---|---|
|Environment|Improvement|
|ALFWorld|+77.9%|
|ScienceWorld|+25.9%|
|Jericho|+101.1%|

---

# 15. Important Ablation: Is Simply Stating the State and Goal Enough?

The authors compare:

```
1. State
2. Goal
3. State + Goal
4. State + Goal + ReAct-style next-action Thought
5. ReflAct
```

The result is important:

- simply verbalizing the **state** is not enough,
    
- simply verbalizing the **goal** is not enough,
    
- even writing both **state + goal** is not sufficient,
    
- adding a next-action thought gives inconsistent improvements,
    
- ReflAct performs best by explicitly reasoning about the **relationship between the current state and the goal**.
    

Thus:

```
State: X
Goal: Y
```

is less effective than:

```
I am currently in state X.
Relative to goal Y, I have already completed A,
but condition B is still missing.
```

The relational reasoning is the key.

---

# 16. ReflAct vs. Reflexion

The two approaches have similar names but operate at different timescales.

## Reflexion

After a task failure:

```
Trial
 ↓
Failure
 ↓
Post-task Reflection
 ↓
Lesson / Improvement Plan
 ↓
Next Trial
```

This is **post-task, inter-trial reflection**.

## ReflAct

During the task, at every timestep:

```
Observation
 ↓
State–Goal Reflection
 ↓
Action
```

This is **in-task reflection**.

The paper shows that adding Reflexion to ReAct can improve performance, but ReAct + Reflexion still often fails to match the first-trial performance of ReflAct.

With GPT-4o:

```
ReflAct + Reflexion
```

reaches **94.8% success rate on ALFWorld**.

Thus the two methods are potentially complementary.

---

# 17. ReflAct vs. WKM

WKM uses external:

- Task Knowledge
    
- State Knowledge
    

generated by a parametric world model and injects that information into ReAct.

ReflAct instead asks the LLM itself to infer its internal state from interaction history.

Results show:

```
ReAct + WKM
```

improves over ReAct, but still underperforms ReflAct.

When WKM state knowledge is placed directly before the action, replacing the thought, performance can even decrease.

The authors interpret this as evidence that externally generated state representations can misguide the agent if they are wrong, whereas internally modeling the state from the current history can be more robust.

---

# 18. ReflAct vs. RAFA

RAFA performs explicit future trajectory search:

```
Current State
   ├── Action A
   │     ├── Predicted Observation
   │     └── Value Estimate
   └── Action B
         ├── Predicted Observation
         └── Value Estimate
```

For the paper’s example setting:

```
depth = 2
branching factor = 2
```

RAFA requires **13 LM queries per step**.

ReflAct instead generates:

```
Reflection + Action
```

in a single model call:

```
1 LM query / step
```

ReflAct therefore emphasizes accurate grounding of the current state rather than expensive explicit simulation of multiple future trajectories.

---

# 19. ReflAct vs. MPO

MPO learns high-level meta-plans and then applies them to agents as plug-in guidance.

The paper applies public MPO meta-plans to:

- NoThinking
    
- ReAct
    
- ReflAct
    

Results:

```
NoThinking + MPO ↑
ReAct + MPO ↑
```

but both remain below the performance of plain ReflAct.

Adding MPO to ReflAct yields:

- a small gain for GPT-4o,
    
- a small drop for Llama-3.1-8B.
    

The authors suggest that out-of-distribution meta-plans can sometimes provide misleading guidance.

---

# 20. Does ReflAct Still Help Stronger Reasoning Models?

The paper also evaluates Qwen3-8B.

|   |   |   |   |
|---|---|---|---|
|Metric|NoThinking|ReAct|ReflAct|
|ALFWorld SR|60.5|65.7|**80.6**|
|ScienceWorld AR|45.2|50.3|**51.8**|
|ScienceWorld SR|26.5|34.1|**36.0**|
|Jericho AR|32.1|30.4|**33.2**|
|Jericho SR|10|5|**20**|

The authors conclude that even models with stronger single-turn reasoning still benefit from explicit belief-state grounding and continuous goal alignment in long-horizon agent tasks.

---

# 21. Hallucinated Action Analysis

The paper defines a hallucinated action approximately as an invalid or erroneous action that produces an observation such as:

```
Nothing happens.
```

ReflAct produces slightly longer reasoning outputs than ReAct.

However, its hallucinated-action rate is lower.

This suggests:

```
Longer reasoning
≠
More hallucination
```

The paper argues that hallucination may be caused less by the amount of reasoning itself and more by **ungrounded or poorly structured reasoning**.

---

# 22. Number of Reasoning Steps

Average number of steps:

|   |   |   |   |
|---|---|---|---|
|Environment|NoThinking|ReAct|ReflAct|
|ALFWorld|21.0|18.6|**16.5**|
|ScienceWorld|24.0|20.3|**19.8**|
|Jericho|28.4|26.2|**24.6**|

ReflAct solves tasks in fewer steps.

Therefore, there is a trade-off:

```
Per-step token length ↑
Trajectory length ↓
```

---

# 23. Self-Correction Example

Task:

```
cool some lettuce and put it in countertop
```

The agent first executes:

```
Action:
cool lettuce 1 with fridge 1
```

while not being at the fridge, which leads to:

```
Observation:
Nothing happens.
```

ReflAct then reflects that:

- it is still at countertop 2,
    
- it is holding lettuce 1,
    
- the fridge action failed because it is not currently at the fridge.
    

It then corrects itself:

```
Action:
go to fridge 1
```

The key point is that **goal-state reflection itself can induce online self-correction without a separate error-recovery module**.

---

# 24. ALFWorld Performance by Task Type

|   |   |   |
|---|---|---|
|Task|GPT-4o|Llama-3.1-8B|
|Put|95.8|83.3|
|Clean|96.8|38.7|
|Heat|78.3|56.5|
|Cool|95.2|66.7|
|Examine|100.0|72.2|
|Put Two|94.1|52.9|
|**Average**|**93.3**|**60.5**|

GPT-4o is relatively weaker on Heat tasks, while Llama-3.1-8B particularly struggles with Clean tasks.

This shows that ReflAct improves the reasoning backbone but does not eliminate limitations of the underlying model’s procedural or environmental competence.

---

# 25. Prompt Robustness

The authors also modify the wording of the ReflAct prompts and one-shot examples.

|   |   |   |
|---|---|---|
|Model|Original|Revised|
|GPT-4o|93.3|91.0|
|GPT-4o-mini|66.4|65.7|
|Llama-3.1-8B|60.5|62.7|
|Llama-3.1-70B|83.6|83.6|

Performance changes only modestly.

The authors interpret this as evidence that ReflAct does not depend on one exact prompt wording, although the optimal prompt may vary by model.

---

# 26. ReflAct Compared with Other Reflection and Planning Methods

|   |   |   |   |
|---|---|---|---|
|Method|Reflection / Planning Timing|Main Focus|Training Required|
|ReAct|Every step|Next action|No|
|Reflexion|After task completion|Failed trajectory|No|
|WKM|Every step|External task/state knowledge|Uses a learned external model|
|RAFA|Every step|Possible future trajectories|No, but many LM calls|
|MPO|High level|Learned meta-plan|Yes during meta-plan learning|
|**ReflAct**|**Every step**|**Current state ↔ final goal**|**No**|

The novelty is not merely “using reflection.”

The important contribution is **where reflection is inserted and what the reflection is about**.

---

# 27. Conceptual View: Belief-State Modeling

ReflAct can be interpreted through the POMDP concept of a **belief state**.

In a partially observable environment:

```
Observation History
       ↓
Belief About Current State
       ↓
Action
```

is required because the true state is not directly observable.

ReflAct does not train a separate belief-state model.

Instead, it prompts the LLM to continuously articulate:

```
What do I currently believe about the world?
How does that relate to the task goal?
```

This can be viewed as a form of:

> **prompt-induced belief-state tracking**

---

# 28. Meaning of the Key Figures

## Figure 1

ReAct:

```
Observation_t
     ↓
Thought_t
     ↓
Action_t
```

The reasoning direction is mainly from the current observation toward the next action.

ReflAct:

```
History + Observation_t
        ↓
 Internal State
        ↕
      Goal
        ↓
   Reflection_t
        ↓
     Action_t
```

The agent continuously connects its inferred state to the final goal.

---

## Figure 4

In the ReAct failure example, the agent repeatedly tries to return to cabinet 1 even after already checking it.

ReflAct instead represents:

```
I am currently at cabinet 1,
I am not holding the required object,
and I still need to find the soap bar.
```

This allows it to move to another cabinet rather than looping.

The figure illustrates how goal-conditioned state reflection can prevent repetitive, logically inconsistent actions.

---

# 29. Main Contributions

## Contribution 1 — Analysis of ReAct Failure

The paper shows that ReAct thoughts strongly shape action selection and that ungrounded thoughts can introduce failure modes that would not occur without explicit reasoning.

## Contribution 2 — Redesign of the Reasoning Backbone

Instead of adding another module on top of ReAct, the paper replaces:

```
Thought → Action
```

with:

```
Goal-conditioned State Reflection → Action
```

## Contribution 3 — Goal-Conditioned Internal State Modeling

The model continuously interprets its current belief state relative to the final goal.

## Contribution 4 — Training-Free Method

No fine-tuning is required.

## Contribution 5 — Broad Evaluation

The method is evaluated across multiple model families and three long-horizon interactive benchmarks.

---

# 30. Limitations

The paper explicitly discusses several limitations.

## 30.1 Mathematics and Coding Are Not Evaluated

The experiments focus on interactive environments.

It is therefore unknown whether the same approach works equally well for:

- mathematical reasoning,
    
- coding,
    
- formal planning.
    

These domains may require more structured state and goal representations.

---

## 30.2 Token Overhead

ReflAct reflections are somewhat longer than ReAct thoughts.

Possible future directions include:

- compressed reflection,
    
- concise structured state representations,
    
- summarization,
    
- compact reasoning formats.
    

---

## 30.3 External Verifiers Are Not Fully Explored

The authors suggest future hybrid architectures such as:

```
State–Goal Reflection
        ↓
External Verifier
        ↓
Consistency Check / Correction
        ↓
Action
```

---

# 31. Most Important Message of the Paper

The central message is not simply:

> “Reflection is useful.”

A more accurate statement is:

> **LLM-agent reasoning should be designed to track the current world state and continuously relate that state to the final task goal, rather than focusing only on next-action prediction.**

The paper reframes agent reliability away from simply adding:

```
More planning
More memory
More modules
More search
```

toward the more fundamental question:

```
Is the agent's internal belief actually grounded in the environment?
```

---

# 32. ReAct vs. ReflAct Intuition

## ReAct

```
"What should I do next?"
```

## ReflAct

```
"Where am I now?
What do I know?
What has already been completed?
What is still missing relative to the final goal?"
        ↓
"So what should I do now?"
```

---

# 33. Why This Matters for Closed LLM Agents

ReflAct was tested with proprietary models such as GPT-4o.

Therefore, even without access to model weights, agent behavior can be modified through:

```
Closed LLM API
      +
Reasoning Instruction
      +
Interaction History
      +
Task Goal
```

ReflAct therefore belongs to the following research category:

```
Training-Free Agent Methodology
        │
        ├── Prompt-based reasoning backbone
        ├── Belief-state tracking
        ├── Goal-conditioned reflection
        └── Inference-time agent control
```

This makes the method especially relevant when using closed-source LLM APIs that cannot be fine-tuned.

---

# 34. Natural Research Extensions

The following directions follow naturally from the paper’s results and discussion.

## 34.1 Structured State Reflection

Instead of unrestricted natural-language reflection:

```
current_state:
  location:
  inventory:
  completed_subgoals:
  observations:
  unresolved_uncertainties:

goal_state:
  required_conditions:

gap:
  missing_conditions:

next_action:
```

A more explicit representation may improve consistency and reduce token usage.

---

## 34.2 Evidence-Grounded Reflection

For scientific agents, reflection could include:

```
Current belief
+
Evidence supporting the belief
+
Evidence contradicting the belief
+
Uncertainty
+
Goal
```

This could make state tracking more reliable in evidence-heavy tasks.

---

## 34.3 Graph-Based State Representation

For complex problems, the agent state could be represented as a graph:

```
Entity
 ↓
Relation
 ↓
Evidence
 ↓
Hypothesis
 ↓
Goal
```

This would extend ReflAct from natural-language belief tracking to an explicit world-state graph.

---

## 34.4 Hierarchical Goal Reflection

For very long tasks:

```
Final Goal
   ↓
Subgoal
   ↓
Current State
   ↓
Gap
   ↓
Action
```

may be more effective than conditioning every action only on one global goal.

---

## 34.5 Reflection + Verifier

A possible hybrid design:

```
State–Goal Reflection
        ↓
Verifier
 ├── Is the state supported by observations?
 ├── Is the goal represented correctly?
 └── Is the proposed action consistent?
        ↓
Action
```

This directly follows the paper’s suggestion that external verification could improve future versions of ReflAct.

---

# 35. Five Things to Remember

1. **ReAct thoughts strongly bias the downstream action distribution.**
    
2. **Ungrounded thoughts can introduce new failures that do not occur in NoThinking agents.**
    
3. **ReflAct replaces next-action reasoning with goal-conditioned state reflection.**
    
4. **Simply stating the state and goal is not enough; reasoning about their relationship is the key.**
    
5. **The method is training-free and can be applied directly to closed LLMs such as GPT-4o.**
    

---

# 36. Final Summary

```
ReAct
Observation
   ↓
"What should I do next?"
   ↓
Thought
   ↓
Action
```

Potential failure:

```
Ungrounded Thought
      ↓
Incorrect Belief
      ↓
Wrong Action
      ↓
Compounding Error
```

ReflAct:

```
Observation + History
        ↓
Current Belief State
        ↕
      Final Goal
        ↓
     Reflection
        ↓
      Action
```

Expected effect:

```
Better Grounding
      +
Continuous Goal Alignment
      ↓
Fewer Hallucinated Actions
Fewer Reasoning Steps
Better Long-Horizon Task Performance
```

**Key takeaway:**

> **Good agent reasoning starts less from “thinking harder about the next action” and more from maintaining an accurate belief about the current state and continuously relating that belief to the final goal.**