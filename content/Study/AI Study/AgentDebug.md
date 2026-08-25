---
publish: true
---


# How AgentDebug Maps Errors at Each Step

## 1. Core Idea

In **AgentDebug**, the error mapping at each step is **not performed by a separately trained classifier**.

Instead, an LLM is used as a **prompt-based detector** that examines each module output and determines whether it matches one of the predefined error types in the **AgentErrorTaxonomy**.

The process is performed at two levels:

```
Failed Trajectory
      │
      ▼
Level 1: Local Error Detection
      │
      │  Step × Module
      │  taxonomy matching
      ▼
Structured Error Map
      │
      ▼
Level 2: Global Root-Cause Diagnosis
      │
      │  identify earliest critical error
      ▼
Critical Step + Module + Error Type
      │
      ▼
Correction Guidance
```

The first level asks:

> **What kind of error, if any, occurred in this specific module at this specific step?**

The second level asks:

> **Among all detected errors, which one is the earliest root-cause error that actually caused the final task failure?**

---

# 2. Step-Level Modular Decomposition

AgentDebug decomposes each decision step into four main agent modules:

```
State / Input
    ↓
Memory
    ↓
Reflection
    ↓
Planning
    ↓
Action
    ↓
Environment Response
```

The four modules are:

|Module|Role|
|---|---|
|**Memory**|Recall or retrieve relevant information from prior context|
|**Reflection**|Interpret the current situation, progress, and outcomes|
|**Planning**|Decide the next strategy or action|
|**Action**|Execute the low-level operation|

System-level failures such as tool execution errors, environment errors, or step-limit exhaustion are handled separately.

For every step (t), AgentDebug analyzes every module (m):

$$  
m \in {\text{Memory, Reflection, Planning, Action}}  
$$

and maps the corresponding module output to an error type from the AgentErrorTaxonomy.

Conceptually:

$$
\text{LLMDetector}  
(  
\text{Task},  
\text{Context},  
\text{Module Output},  
\text{Environment Response},  
\text{Error Definitions}  
)  
$$

---

# 3. What Is Given to the LLM Detector?

For each module, the detector receives a structured prompt containing:

```
TASK
ENVIRONMENT
CURRENT STEP
INPUT AND CONTEXT
MODULE TO ANALYZE
MODULE OUTPUT
ENVIRONMENT RESPONSE
ERROR DEFINITIONS
```

A simplified example:

```
TASK:
Find a product under $50.

CURRENT STEP:
Step 4

INPUT AND CONTEXT:
[full conversation history and trajectory context]

MODULE TO ANALYZE:
Memory

MODULE OUTPUT:
"The user wants a product under $100."

ENVIRONMENT RESPONSE:
...

ERROR DEFINITIONS:
[AgentErrorTaxonomy definitions]
```

The LLM is then asked to determine:

1. Whether an error exists in the module
    
2. Which exact error type applies
    
3. What evidence supports the judgment
    
4. Why the output matches the corresponding error definition
    

---

# 4. Detector Output Format

The detector returns a structured JSON object.

Example:

```
{
  "error_detected": true,
  "error_type": "hallucination",
  "evidence": "The module recalls a $100 budget even though the user specified $50.",
  "reasoning": "The memory output contradicts information explicitly present in the current input."
}
```

This structured format allows AgentDebug to construct a full **step-by-step error map** over the trajectory.

---

# 5. The Important Dependency Rule

A crucial part of the detector prompt is that **each module is evaluated relative to the information that should legitimately be available to that module**.

The paper defines the evaluation dependencies approximately as:

```
Memory
↓
Evaluate against the current step input

Reflection
↓
Evaluate against:
current input + Memory output

Planning
↓
Evaluate against:
current input + Memory + Reflection

Action
↓
Evaluate against:
current input + Planning
```

This matters because a downstream module may produce a reasonable output **given an incorrect upstream module**.

---

# 6. Why This Dependency Matters

Consider the following example.

```
Actual Information:
Product price = $70
Budget = $50
```

Suppose the agent produces:

```
Memory:
"The product costs $40."

Reflection:
"$40 is within the $50 budget."

Planning:
"Purchase the product."

Action:
purchase(product)
```

A naive evaluator might mark every downstream component as wrong:

```
Memory      → Wrong
Reflection  → Wrong
Planning    → Wrong
Action      → Wrong
```

But AgentDebug's modular evaluation can instead distinguish **causal validity** from **ultimate correctness**.

For example:

```
Memory
→ ERROR
  False recall / hallucination

Reflection
→ Potentially reasonable GIVEN the incorrect memory

Planning
→ Potentially reasonable GIVEN memory + reflection

Action
→ Potentially reasonable GIVEN the plan
```

The goal is to avoid incorrectly labeling every downstream consequence as an independent error.

---

# 7. Level 1: Local Error Detection

The first LLM pass performs **local classification**.

For each:

```
Step × Module
```

the LLM maps the output into:

```
No Error
or
Specific AgentErrorTaxonomy Category
```

For example:

```
Step 1
 ├─ Planning   → no_error
 └─ Action     → no_error

Step 2
 ├─ Memory     → hallucination
 ├─ Reflection → no_error
 ├─ Planning   → constraint_ignorance
 └─ Action     → no_error

Step 3
 ├─ Memory     → retrieval_failure
 ├─ Reflection → outcome_misinterpretation
 ├─ Planning   → inefficient_planning
 └─ Action     → invalid_action
```

This produces a structured **error profile** for the full trajectory.

---

# 8. Level 2: Global Critical-Error Detection

The second LLM pass receives:

- the entire failed trajectory,
    
- the step-by-step error analysis,
    
- the AgentErrorTaxonomy,
    
- the criteria for a critical error.
    

The LLM then tries to identify:

> **The earliest error that causally pushed the trajectory onto an unrecoverable path toward failure.**

The global debugger is explicitly instructed to consider the **entire trajectory**, rather than simply selecting the first detected error.

---

# 9. Error Is Not the Same as Critical Error

This distinction is central to AgentDebug.

Consider:

```
Step 3
Memory:
"Hotel A costs $100."

        ↓

Step 4
Reflection:
"Hotel A satisfies the budget."

        ↓

Step 5
Planning:
"Book Hotel A."

        ↓

Step 6
Action:
book(hotel_A)

        ↓

FAIL
Actual price = $300
```

Several errors may appear:

```
Step 3 → Memory Error
Step 4 → Reflection Error
Step 5 → Planning Error
Step 6 → Action Error
```

But the causal chain may be:

```
Memory Error
     ↓
Reflection Error
     ↓
Planning Error
     ↓
Action Error
```

The **critical error** is therefore the upstream memory failure, not necessarily the final wrong action.

Fixing only the final action may not help because the agent still holds the incorrect internal information.

---

# 10. Criteria for a Critical Error

The global AgentDebug prompt asks the LLM to identify an error that satisfies criteria such as:

- it is the **root cause** of the task failure,
    
- it triggered a **cascade of subsequent errors**,
    
- the trajectory could plausibly have succeeded if this error had not occurred,
    
- correcting this error would fundamentally redirect the trajectory toward success.
    

The LLM is also instructed to:

```
Trace backward from the final failure
        ↓
Identify the causal chain
        ↓
Locate the earliest meaningful origin
```

rather than relying on fixed severity weights.

---

# 11. Structured Root-Cause Output

The global debugger returns a structured report such as:

```
{
  "critical_step": 3,
  "critical_module": "memory",
  "error_type": "hallucination",
  "root_cause": "The agent incorrectly recalled the hotel price.",
  "evidence": "The trajectory states that Hotel A costs $100 although the environment listed it as $300.",
  "correction_guidance": "Retrieve and verify the actual price before checking the budget constraint.",
  "cascading_effects": [
    {
      "step": 4,
      "impact": "Reflection incorrectly concluded that the hotel satisfied the budget."
    },
    {
      "step": 5,
      "impact": "Planning selected an invalid booking strategy."
    }
  ]
}
```

Thus the output identifies not only **where** the failure began, but also:

- the responsible module,
    
- the error type,
    
- the evidence,
    
- the root cause,
    
- the downstream cascade,
    
- actionable correction guidance.
    

---

# 12. Full Two-Level Diagnosis Pipeline

The complete diagnosis process can be represented as:

```
                     Failed Trajectory
                            │
                            ▼
          ┌────────────────────────────────┐
          │ Level 1: Local Error Detector  │
          └────────────────────────────────┘
                            │
                For every Step × Module
                            │
                  ┌─────────┼─────────┐
                  ↓         ↓         ↓
               Memory   Reflection  Planning ...
                  │         │         │
                  ▼         ▼         ▼
            Taxonomy   Taxonomy   Taxonomy
             Mapping    Mapping    Mapping
                  └─────────┬─────────┘
                            ↓
                    Structured Error Map
                            │
                            ▼
          ┌────────────────────────────────┐
          │ Level 2: Global AgentDebug     │
          └────────────────────────────────┘
                            │
                Entire trajectory analysis
                            │
                            ▼
                 Causal root-cause tracing
                            │
                            ▼
            Critical Step + Module + Type
                            │
                            ▼
                Actionable Feedback
```

---

# 13. Why This Is Different from a Standard LLM Judge

A standard LLM judge might simply ask:

```
"Was this action correct?"
```

AgentDebug instead decomposes the evaluation into:

```
Step-level temporal structure
        +
Module-level functional structure
        +
Predefined error taxonomy
        +
Evidence-based classification
        +
Global causal attribution
```

The architecture therefore uses LLM-as-a-judge in two distinct roles:

### Local Role

```
Classification:
"What error type occurred here?"
```

### Global Role

```
Causal Diagnosis:
"Which detected error actually caused the final failure?"
```

---

# 14. No Dedicated Error Classifier Is Trained

The important methodological point is:

```
No dedicated classifier training
No specialized debugging model training
```

Instead:

```
Existing LLM
   +
Error Taxonomy
   +
Structured Prompt
   +
Trajectory Context
```

is used for diagnosis.

In the paper's experiments, **GPT-4.1 with temperature 0** is used for critical-error detection.

This makes the approach compatible with **closed, API-only LLMs**, because the methodology operates entirely at inference time.

---

# 15. Conceptual Interpretation

AgentDebug can be understood as:

> **Hierarchical LLM-as-a-Judge for causal trajectory debugging**

The hierarchy is:

```
Level 1:
Module-level semantic classification

          ↓

Level 2:
Trajectory-level causal attribution
```

More formally:

$$
{e_t^m}_{t,m}  
$$

followed by:

$$
\text{GlobalDebugger}  
(  
\tau,  
{e_t^m}  
)  
$$

where:

- (t^*): critical step
    
- (m^*): critical module
    
- (z^*): critical error type
    
- ($$\tau$$): full agent trajectory
    

---

# 16. Main Takeaway

The step-level error mapping in AgentDebug is performed by an LLM that receives:

```
Task
+
Trajectory Context
+
Specific Module Output
+
Environment Response
+
Explicit Error Definitions
```

and performs **taxonomy-based classification**.

Then a second LLM-based diagnosis stage uses the resulting error map to determine the **earliest causal root error**.

Therefore, the method is best summarized as:

```
Local taxonomy matching
        ↓
Structured error map
        ↓
Global causal reasoning
        ↓
Root-cause localization
```

rather than simply:

```
"Ask the LLM where the agent failed."
```

The key methodological contribution is the combination of **modular decomposition, explicit error definitions, structured LLM judging, and trajectory-level causal diagnosis**.