---
publish: true
---


[BreakpointR](https://github.com/daewoooo/breakpointR)



## Overview

**breakpointR** is a Strand-seq analysis tool for detecting genomic
positions where **Watson/Crick strand directionality changes**.

> A persistent local change in the Watson/Crick read pattern can define
> a strand-state breakpoint.

It is particularly useful for localizing events such as **sister
chromatid exchanges (SCEs)** and **inversions**.

## 1. Why Strand-seq Can Detect Breakpoints

Conventional WGS can detect structural-variant breakpoints using
discordant paired-end or split reads. Strand-seq adds **Watson/Crick
orientation** information.

A diploid chromosome segment can show:

``` text
WW
WC
CC
```

A change along a chromosome can therefore define a breakpoint:

``` text
WW WW WW WW | WC WC WC WC
            ↑
      strand-state breakpoint
```

## 2. What breakpointR Detects

breakpointR searches for **local changes in strand directionality**:

``` text
W/C Strand-seq reads
        ↓
Local change in W/C composition
        ↓
Significant change point
        ↓
Breakpoint localization
        ↓
Chromosome segmentation
```

A breakpointR call is initially a **strand-directionality breakpoint**,
not automatically a confirmed structural variant.

## 3. Sister Chromatid Exchange (SCE)

SCE can change template-strand inheritance along a chromosome.

``` text
Before SCE:
Homolog 1: W
Homolog 2: W
State = WW

After SCE:
Homolog 1: C
Homolog 2: W
State = WC
```

Thus:

``` text
WW WW WW WW | WC WC WC WC
            ↑
            SCE
```

Typical one-step transitions include:

``` text
WW → WC
WC → CC
CC → WC
WC → WW
```

## 4. Inversions

An inversion reverses the orientation of a genomic segment:

``` text
Reference:
──────→→→→→→──────

Inversion:
──────←←←←←←──────
      ↑      ↑
     BP1    BP2
```

For a heterozygous inversion, one homolog may change orientation within
the inverted segment:

``` text
Outside:
Homolog A: W
Homolog B: W
State = WW

Inside:
Homolog A: W
Homolog B: C
State = WC
```

Result:

``` text
          inversion
        ┌───────────┐
WW WW WW│ WC WC WC  │WW WW WW
        ↑            ↑
       BP1          BP2
```

This is why Strand-seq is especially informative for inversions:
**orientation changes even when copy number does not**.


Heterozygous inversion: only one homologs inversion (read left)
Homozygous inversion: both homologs inversion

![[Pasted image 20260728145049.png]]

## 5. breakpointR Detection Principle

breakpointR looks for positions where local W/C composition changes
substantially.

Example WC → CC:

``` text
Before breakpoint       After breakpoint

W: ███████████          W:
C: ███████████          C: ███████████

       WC        |             CC
                 ↑
             breakpoint
```

### Sliding read window

In the illustrated method, a local window can contain a fixed number of
reads, for example 20:

``` text
[ 10 reads | 10 reads ]
    left       right
```

Compare Watson reads on the two sides.

Away from a breakpoint:

``` text
Left:  4 W
Right: 6 W

ΔW = 6 - 4 = 2
```

Near a breakpoint:

``` text
Left:  7 W
Right: 0 W

ΔW = 0 - 7 = -7
```

The window moves along the chromosome:

``` text
[--------- window ---------]
  [--------- window ---------]
    [--------- window ---------]
      ...
```

A large change in local strand composition produces a candidate
breakpoint.

## 6. Significant Breakpoints

Stable region:

``` text
similar W/C composition
        ↓
small |ΔW|
```

Transition:

``` text
WC | CC
   ↑
breakpoint
```

produces:

``` text
large |ΔW|
     ↓
candidate breakpoint
```

A statistical significance threshold, such as the z-score-based
criterion shown in the slides, can distinguish strong changes from
background fluctuations.

## 7. breakpointR vs. HMM

HMM strand-state calling and breakpointR use related W/C information but
answer different questions.

### HMM

``` text
W/C counts
    ↓
   HMM
    ↓
WW WW WW | WC WC WC | CC CC
```

Question:

> Which hidden strand state (WW/WC/CC) best explains each genomic
> region?

### breakpointR

``` text
W/C reads
    ↓
local change detection
    ↓
breakpoint positions
```

Question:

> Where does strand directionality change significantly?

Thus:

``` text
                  W/C Strand-seq data
                         │
               ┌─────────┴─────────┐
               ↓                   ↓
              HMM              breakpointR
               ↓                   ↓
        WW/WC/CC states       breakpoints
```

**breakpointR is not simply an HMM implementation, and HMM output is not
inherently required as breakpointR input.**

The two analyses can be complementary.

## 8. Other Structural Variants

breakpointR is most directly informative when an event creates a
detectable **strand-directionality change**.

### Deletion

A deletion primarily creates a read-depth/copy-number decrease:

``` text
Normal:
████████████████████

Deletion:
████████      ████████
        ↑
   reduced depth
```

It does not necessarily produce a W/C transition.

### Duplication

A duplication primarily produces increased copy number/read depth and
likewise does not necessarily create a strand-state breakpoint.

### Translocation

A translocation can be detectable by strand-state analysis **if it
changes observable strand directionality**:

``` text
WWWWWW | CCCCCC
       ↑
translocation-associated
strand-state breakpoint
```

But a translocation can also occur without an observable W/C change:

``` text
WWWWWW | WWWWWW
       ↑
translocation junction
```

Therefore:

``` text
Translocation
      ↓
Does it alter observable strand directionality?
      │
   ┌──┴──┐
  Yes    No
   ↓      ↓
strand   may be invisible to
change   strand-state analysis alone
   ↓
breakpointR can detect
the change point
```

Even when breakpointR detects the change, additional evidence is
required to establish that the underlying event is specifically a
translocation.

## 9. Position in the Strand-seq Workflow

``` text
Paired-end FASTQ
        ↓
Alignment
        ↓
Watson / Crick assignment
        ↓
BAM processing
        ↓
Duplicate marking
        ↓
Read filtering
        ↓
W/C counting
        ↓
Library QC
        ↓
Remove low-quality libraries
        ↓
QC-passed Strand-seq data
        ↓
breakpointR
        ↓
Strand-directionality breakpoints
        ↓
Chromosome segmentation
        ↓
Biological / SV interpretation
```

Library QC is important because low coverage, contamination, multi-cell
libraries, or excessive opposite-strand background can obscure genuine
strand-state changes.

## 10. Interpretation

A breakpointR call means:

> **A genomic position shows a significant local change in Strand-seq
> strand directionality.**

It does **not** automatically mean:

> **A confirmed structural variant of a specific type.**

Potential explanations include SCE, inversion, orientation-changing
rearrangements, some translocations, and technical artifacts.

## Overall Concept

``` text
Strand-seq
    ↓
Watson / Crick reads
    ↓
QC-passed strand profiles
    ↓
local W/C composition changes
    ↓
breakpointR
    ↓
significant strand-directionality breakpoints
    ↓
chromosome segmentation
    ↓
interpretation
    ├─ SCE
    ├─ inversion
    ├─ orientation-changing rearrangement
    └─ other candidate events
```

## Key Concept

> **breakpointR detects local changes in Watson/Crick strand
> directionality in Strand-seq data. It localizes strand-state
> breakpoints rather than directly classifying every breakpoint as a
> specific structural variant. SCEs and inversions generate particularly
> informative strand-state changes, while deletions, duplications, and
> translocations may require copy-number, junction, or other
> complementary evidence depending on the rearrangement.**