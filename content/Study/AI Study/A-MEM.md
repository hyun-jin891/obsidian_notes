---
publish: true
---




![[Pasted image 20260817174806.png]]



# A-MEM: Memory Note Construction, Linking, and Evolution

## 1. Core Workflow

When a new interaction enters A-MEM, it is converted into a structured  
memory note:

$$  
m_n = {c_n, t_n, K_n, G_n, X_n, e_n, L_n}  
$$

where:

Symbol Meaning

---

$c_n$ Original content  
$t_n$ Timestamp  
$K_n$ LLM-generated keywords  
$G_n$ LLM-generated tags  
$X_n$ LLM-generated contextual description  
$e_n$ Memory embedding  
$L_n$ Links to related memories

The overall process is:

```
New Interaction
      ↓
Structured Memory Note
      ↓
Embedding-based Neighbor Retrieval
      ↓
Top-k Individual Memory Notes
      ↓
 ┌───────────────┴───────────────┐
 ↓                               ↓
Link Generation              Memory Evolution
 ↓                               ↓
Semantic Links              Updated Old Notes
 └───────────────┬───────────────┘
                 ↓
          Evolving Memory Store
```

## 2. Note Construction

A-MEM does not store only the raw interaction. The LLM generates  
additional semantic attributes such as context, keywords, and tags.

The embedding is constructed from the concatenation of these  
representations:

$$  
e_n =  
f_{\text{enc}}  
\left[  
\operatorname{concat}(c_n, K_n, G_n, X_n)  
\right]  
$$

Therefore, the memory embedding represents not only the original content  
but also the LLM-generated semantic interpretation of that content.

## 3. What Is Compared During Link Generation?

The important point is that retrieval operates over **individual memory  
notes**, not over a representative note for a "box."

For a new memory $m_n$, A-MEM compares its embedding $e_n$ with the  
embedding $e_j$ of each existing memory note $m_j$ using cosine  
similarity:

$$
\frac{e_n \cdot e_j}  
{|e_n| |e_j|}  
$$

The system then retrieves the top-$k$ nearest individual notes:

$$
{m_j \mid \operatorname{rank}(s_{n,j}) \le k}  
$$

Conceptually:

```
Existing Memory Notes

m1      m2      m3      m4      m5      ...      mN
│       │       │       │       │                │
e1      e2      e3      e4      e5               eN
 \       \       \       |       /               /
  └──────── cosine similarity with e_new ───────┘
                         ↓
                    Top-k Notes
```

A-MEM does **not** first retrieve a box using a box-level representative  
embedding.

## 4. What Does "Box" Mean?

The "box" in A-MEM should not be interpreted as a conventional cluster  
with:

- a representative vector,
    
- a centroid,
    
- or a single representative note used for retrieval.
    

Instead, it is primarily a conceptual Zettelkasten-style representation  
of a group of interconnected memories.

A memory can be conceptually associated with multiple groups because  
links are formed dynamically.

Therefore:

```
Incorrect interpretation:

New Note
   ↓
Compare with Box Centroids
   ↓
Retrieve Box
   ↓
Update Every Note in Box
```

A more accurate interpretation is:

```
New Note
   ↓
Compare with Individual Note Embeddings
   ↓
Retrieve Top-k Neighbor Notes
   ↓
LLM determines semantic links
   ↓
Relevant notes become interconnected
```

## 5. Link Generation After Top-k Retrieval

Cosine similarity is used only to obtain candidate neighboring memories.

The retrieved top-$k$ notes are **not automatically linked** to the new  
note.

Instead, the LLM receives the new memory together with the retrieved  
neighborhood and determines which relationships are meaningful.

Conceptually:

```
New Note N
    ↓
Embedding Retrieval
    ↓
Top-k Candidates

m2   m7   m11   m15   m21

    ↓
LLM Link Judgment
    ↓

        m2
         │
         │
m11 ─────N───── m15

m7   → no meaningful link
m21  → no meaningful link
```

Thus, A-MEM separates:

1. **Candidate retrieval** --- embedding similarity
    
2. **Relationship judgment** --- LLM reasoning
    

This allows the system to model conceptual relationships that are not  
captured perfectly by embedding similarity alone.

## 6. Memory Evolution

After identifying the nearest memory set, A-MEM can evolve existing  
memories using the newly arrived information.

The key point is again that the system does **not simply update every  
note belonging to one retrieved box**.

Instead, existing notes in the retrieved neighborhood are individually  
considered for evolution.

For an existing memory $m_j$:

$$  
m_j^*  
\leftarrow  
LLM  
\left(  
m_n  
\parallel  
M_n^{near}\setminus m_j  
\parallel  
m_j  
\parallel  
P_{s3}  
\right)  
$$

In other words, when considering whether to evolve $m_j$, the LLM  
receives:

```
1. New memory m_n

2. Other retrieved neighboring memories
   M_near − m_j

3. The existing memory m_j
   that is currently being evaluated
```

## 7. Example of Note-by-Note Evolution

Suppose nearest-neighbor retrieval returns:

```
M_near = {m2, m7, m11}
```

Conceptually, evolution can be viewed as:

```
Evolution of m2:

LLM(
    new note,
    {m7, m11},
    m2
)
    ↓
   m2*
```

```
Evolution of m7:

LLM(
    new note,
    {m2, m11},
    m7
)
    ↓
   m7*
```

```
Evolution of m11:

LLM(
    new note,
    {m2, m7},
    m11
)
    ↓
   m11*
```

If evolution is appropriate, semantic attributes such as contextual  
descriptions, keywords, or tags can be revised.

The evolved memory $m_j^*$ then replaces the previous version $m_j$ in  
the memory store.

## 8. Example of Semantic Evolution

Suppose an old memory contains:

```
Content:
"I am interested in AI."

Context:
"The user has a general interest in artificial intelligence."

Keywords:
AI

Tags:
technology
```

Later memories arrive:

```
"I am developing LLM agents."

"I want to apply LLM agents to bioinformatics."

"I am interested in computational biology."
```

The old memory may evolve into a richer representation:

```
Context:
"The user's interest in AI is particularly centered on
LLM agents and computational biology."

Keywords:
AI
LLM agents
bioinformatics

Tags:
AI
agent systems
computational biology
```

The original memory is therefore not merely stored permanently as a  
static object. Its semantic representation can be reinterpreted as new  
related information arrives.

## 9. Full Workflow

The complete process can be summarized as:

```
New Interaction
      │
      ▼
┌──────────────────────────┐
│ Construct New Note m_n   │
│                          │
│ content                  │
│ timestamp                │
│ context                  │
│ keywords                 │
│ tags                     │
│ embedding e_n            │
│ links                    │
└────────────┬─────────────┘
             │
             │ cosine similarity
             ▼
─────────────────────────────────────
Existing Individual Memory Notes

m1   m2   m3   m4   m5   ...   mN
│    │    │    │    │          │
e1   e2   e3   e4   e5         eN
─────────────────────────────────────
             │
             ▼
        Top-k Notes
       {m2, m7, m11}
             │
       ┌─────┴─────┐
       ▼           ▼
 Link Generation   Memory Evolution
       │           │
 LLM determines    m2  → m2*
 semantic links    m7  → m7*
                   m11 → m11*
       │           │
       └─────┬─────┘
             ▼
      Updated Memory Store
```

## 10. Precise Interpretation

A concise and accurate description of A-MEM is:

> **A new interaction is transformed into a structured memory note  
> containing content, timestamp, LLM-generated semantic attributes, an  
> embedding, and links. The new note embedding is compared with the  
> embeddings of existing individual memory notes using cosine  
> similarity. The top-k nearest notes are retrieved as candidates. An  
> LLM then determines meaningful semantic links and can individually  
> evolve nearby existing notes using the new note and neighboring  
> context. Evolved notes replace their previous representations in the  
> memory store.**

Therefore, the following interpretation should be avoided:

> "A-MEM retrieves a box using a representative note and then updates  
> all notes inside that box."

Instead:

> **The operational unit for similarity retrieval and evolution is the  
> individual memory note; the box is primarily a conceptual  
> representation of dynamically interconnected memories.**

## 11. Key Takeaway

The A-MEM pipeline separates three different functions:

---

Stage Mechanism Unit

---

Candidate retrieval Cosine similarity Individual memory note

Link generation LLM semantic reasoning New note + retrieved  
notes

The central idea is therefore:

```
Static Vector Memory

Interaction
   ↓
Store
   ↓
Retrieve
```

becomes:

```
Agentic Memory

Interaction
   ↓
Interpret
   ↓
Create Semantic Note
   ↓
Retrieve Neighbor Notes
   ↓
Build Relationships
   ↓
Reinterpret Existing Memories
   ↓
Evolving Memory Network
```