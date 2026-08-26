---
publish: true
---

[MosaiCatcher](https://github.com/friendsofstrandseq/mosaicatcher)

[[Run MosaiCatcher]]

[[MosaiCatcher Output]]

![[Pasted image 20260728152531.png]]

* Here, one homolog(paternal or maternal) consists of 2 strands(absolutely consist of W and C)
* Balanced translocation
	* For the region of chr9, chr9 maternal chr -> gives W or C to daughter cell normarly .....**A
	* For the normal region of chr9, chr9 paternal chr -> gives W or C to daughter cell normaly .....**B
	* ch9 paternal chr in chr13 -> gives W or C to daughter cell abnormaly (must originally be the same with **B**) .....**C
	* If **A** = W, **B** = C, and **C** = W, the chromosome plot of chr9
		* normal region: WC
		* translocated region: WW
		* It can be discriminated from SCE
			* **It is less probable that SCE forms (sub)clones, so it may be SCE if the pattern happens at the only individual cell

	

## Overview

**MosaiCatcher** is a Strand-seq analysis framework for **automatic single-cell structural variant (SV) calling, genotyping, and clustering**.

It integrates multiple signals:

- Watson/Crick strand orientation
- Read depth / total read count
- Haplotype-specific read counts
- Shared segmentation across multiple single cells
- Bayesian probabilistic modeling

Using these signals together, MosaiCatcher identifies characteristic genomic footprints and assigns the most probable SV state to genomic segments.

Its running involves lots of pipelines with Snakemake

[MosaiCatcher Pipeline](https://github.com/friendsofstrandseq/mosaicatcher-pipeline)

![[Pasted image 20260729153104.png]]

---

# 1. Input and General Workflow

The input is typically **single-cell BAM files** from Strand-seq.

```text
Single-cell BAM files
        ↓
Bin genome and count mapped reads
        ↓
Joint segmentation across cells
        ↓
Build consensus haplotypes
        ↓
Count haplotype-specific W/C reads
        ↓
Bayesian modeling
        ↓
Assign most probable genomic/SV state per segment
        ↓
Generate single-cell SV profiles
        ↓
Cluster cells / identify clones and subclones
```

Workflow execution can be managed with **Snakemake**.

---

# 2. Why Strand-seq Is Useful for SV Calling

Strand-seq preserves parental template-strand orientation.

Each genomic segment therefore contains information about:

- Watson (W) reads
- Crick (C) reads
- Haplotype origin
- Total read depth

Different structural variants generate different combinations of these signals.

---

# 3. Characteristic SV Footprints

## Deletion

A deletion reduces copy number.

Typical signals:

- decreased total read depth
- loss or reduction of one haplotype-specific component
- altered W/C composition depending on which haplotype is deleted

```text
Normal:
H1 █████
H2 █████

Deletion:
H1 █████
H2
```

## Duplication

A duplication increases copy number.

Typical signals:

- increased read depth
- extra haplotype-specific reads
- possible changes in W/C composition

```text
Normal CN:      2
Duplication CN: >2
```

## Balanced Inversion

A balanced inversion changes orientation without necessarily changing copy number.

```text
Reference:
──────→→→→→→──────

Inversion:
──────←←←←←←──────
      ↑      ↑
     BP1    BP2
```

The main signal is **strand-orientation change**.

## Inverted Duplication

An inverted duplication combines:

```text
copy-number gain
        +
orientation reversal
```

## Balanced / Unbalanced Translocation

Translocations can create characteristic Strand-seq patterns when a segment becomes physically linked to another chromosome.

- **Unbalanced translocation** can also alter copy number. (e.g. normal chr remains and corresponding chr's region is duplicated and translocated)
- **Balanced translocation** may preserve copy number, making strand and haplotype information especially important.

---

# 4. Joint Segmentation Across Cells

MosaiCatcher analyzes **many cells together** and identifies shared genomic boundaries.

```text
Cell 1  ─────────│──────────
Cell 2  ─────────│──────────
Cell 3  ─────────│──────────
                 ↑
          shared segment boundary
```

Joint segmentation is useful because single-cell Strand-seq coverage is low and individual cells can be noisy.

---

# 5. Consensus Haplotype Construction

Heterozygous variants can be used to build two consensus haplotypes:

```text
H1: A C G T A ...
H2: A T G C A ...
```

Reads can then be categorized as:

```text
C-H1
W-H1
C-H2
W-H2
```

Example:

```text
             H1      H2

Watson        4       0
Crick         0       2
```

These haplotype-specific strand counts contain information about orientation and copy number.

---

# 6. Bayesian Framework

MosaiCatcher uses a **Bayesian framework** to infer the underlying genomic state from noisy observations.

Conceptually:

P(state | data) ∝ P(data | state) × P(state)

Observed data can include:

- W/C read counts
- total read depth
- haplotype-specific counts

The model asks:

> Given the observed read pattern, which genomic or SV state is most probable?

## Multinomial Model

Haplotyped reads distributed among:

```text
C-H1
W-H1
C-H2
W-H2
```

can be modeled with a multinomial distribution.

## Negative Binomial Model

Total read counts can be modeled with a negative binomial distribution to account for noisy and overdispersed sequencing counts.

This helps distinguish copy-number states such as:

```text
CN = 0
CN = 1
CN = 2
CN = 3
...
```

---

# 7. Assigning SV States

For each genomic segment, MosaiCatcher evaluates possible states and assigns the **most probable SV type**.

```text
Observed W/C + haplotype + depth
              ↓
        Bayesian model
              ↓
posterior probabilities
              ↓
       most probable state
```

Possible states can include:

- reference
- deletion
- duplication
- inversion
- inverted duplication
- complex rearrangement

The exact state space depends on the implementation.

---

# 8. Relationship to breakpointR

**breakpointR** and **MosaiCatcher** analyze related Strand-seq information but answer different questions.

## breakpointR

Main question:

> Where does strand directionality change?

```text
W/C reads
   ↓
local W/C change
   ↓
breakpoint
```

## MosaiCatcher

Main question:

> What genomic/SV state best explains the combined strand, haplotype, and read-depth pattern?

```text
W/C orientation
+ read depth
+ haplotype
+ multi-cell information
          ↓
     MosaiCatcher
          ↓
SV state + genotype + cell profile
```

BreakpointR primarily localizes **change points**, while MosaiCatcher performs broader **SV inference and classification**.

---

# 9. Distinguishing SCEs from Clonal SVs

SCEs can create strand-state changes that resemble SV breakpoints.

However, SCEs generally occur independently in individual cells. (There is less clone sharing the same type of SCE)

```text
Cell 1: SCE at 35 Mb
Cell 2: SCE at 81 Mb
Cell 3: no SCE
Cell 4: SCE at 12 Mb
```

A clonally inherited SV is more likely to recur at the same genomic position:

```text
Cell 1: SV at 40 Mb
Cell 2: SV at 40 Mb
Cell 3: SV at 40 Mb
Cell 4: no SV
```

Interpretation:

```text
single-cell/private breakpoint
        ↓
SCE or rare/private SV possible

recurrent breakpoint in multiple cells
        ↓
clonal SV more likely
```

---

# 10. Variant Allele Fraction / Cell Fraction

After SV calling across cells, the frequency of an event can be summarized.

![[Pasted image 20260728160247.png]]

```text
VAF / cell fraction ≈ 1
        ↓
germline or dominant clonal event more likely

lower fraction
        ↓
somatic / subclonal event more likely
```

![[Pasted image 20260728160153.png]]


This is an interpretation guideline, not an absolute rule.

A breakpoint observed in only one cell may represent:

- rare SV
- private somatic event
- SCE
- technical artifact

---

# 11. Single-Cell SV Profiles and Clustering

MosaiCatcher can produce a cell-by-SV representation.

```text
             DEL1  DUP1  INV1

Cell 1         0     1     0
Cell 2         0     1     0
Cell 3         0     1     0

Cell 4         1     0     1
Cell 5         1     0     1
```

Cells with similar SV profiles can be clustered:

```text
Cell 1 ─┐
Cell 2 ─┼─ Clone A
Cell 3 ─┘

Cell 4 ─┐
Cell 5 ─┴─ Clone B
```

This can reveal:

- dominant clones
- subclonal populations
- tumor heterogeneity
- clonal evolution

Hierarchical clustering such as **Ward's method** can be applied to SV genotype likelihoods or derived profiles.

![[Pasted image 20260728160337.png]]

Heatmap for SV clustering

For P33, single dominant SV clone
For P1, 23 cells shared similar SV pattern (SV cluster)

---

# 12. Chromosome-Level Output

A chromosome-level visualization can include:

- Watson and Crick read profiles
- inferred strand states
- genomic segmentation
- SV classes
- cell-specific genotype information

These plots are useful for:

- inspecting called SVs
- identifying recurrent events
- comparing clones
- validating segmentation

![[Pasted image 20260728160514.png]]


---

# 13. Translocation Detection Using Co-Segregation

A translocated segment can be linked to its **recipient chromosome** using segregation patterns across cells.

Suppose a segment originates from chr22 but becomes attached to chr13.

```text
Original:

chr13  ─────────────────

chr22  ─────────────[XXXXX]


After translocation:

chr13  ─────────────────[XXXXX]

chr22  ─────────────
```

The sequence of `XXXXX` still maps to chr22 in the reference genome, but physically it is now part of the derivative chr13 chromosome.

Therefore, across cells, the translocated segment should follow the segregation pattern of the **recipient chromosome**, not the original donor chromosome.

---

# 14. Donor vs. Recipient Pattern

If the translocated chr22 segment shows:

```text
Cell 1   W
Cell 2   C
Cell 3   C
Cell 4   W
...
```

and chr13-H2 shows the same pattern:

```text
Cell 1   W
Cell 2   C
Cell 3   C
Cell 4   W
...
```

then strong co-segregation suggests:

```text
chr22 segment ↔ chr13-H2
```

This indicates that the chr22-derived segment is likely physically attached to chr13-H2.

---

# 15. Finding Translocation Partners

Across many cells, the strand-state pattern of a suspicious segment can be compared with chromosome haplotypes.

```text
translocated segment pattern
             ↓
compare with chromosome haplotypes
             ↓
find strongest correlation / co-segregation
             ↓
candidate recipient chromosome
```

Genomic coordinates identify the **donor sequence**, while co-segregation can reveal the **physical recipient chromosome**.


---

# 16. Why a Translocation Can Resemble an Inverted Duplication

A translocated segment may show:

- extra copy number
- abnormal strand orientation

and therefore resemble an inverted duplication.

However, if the suspicious segment does **not** follow the donor chromosome's segregation and instead follows another chromosome haplotype, this suggests a translocation.

```text
Abnormal segment
      ↓
Does it follow donor chromosome segregation?
      │
   ┌──┴──┐
  Yes    No
          ↓
compare with other chromosome haplotypes
          ↓
strong co-segregation with recipient
          ↓
translocation candidate
```

---

# 17. Major Outputs

MosaiCatcher analysis can provide or support generation of:

## Chromosome SV plots

Single-cell chromosome profiles with:

- W/C reads
- strand states
- SV classes
- segment boundaries

## SV frequency / VAF summaries

Population-level frequency of called events.

## Cell × SV matrices

Profiles of SV states across single cells.

## Clustering / clonal structure

Grouping cells by shared SV patterns.

## Candidate translocation partners

Inferred from haplotype-specific co-segregation across cells.

---

# 18. Position in the Overall Strand-seq Workflow

```text
Strand-seq library
        ↓
Sequencing
        ↓
Alignment + BAM processing
        ↓
Watson / Crick assignment
        ↓
Library QC
        ↓
QC-passed single-cell BAMs
        ↓
MosaiCatcher
        ↓
Binning + joint segmentation
        ↓
Consensus haplotypes
        ↓
Haplotype-specific W/C counts
        ↓
Bayesian SV-state inference
        ↓
Single-cell SV calls
        ↓
SV frequency / clustering
        ↓
Clone and subclone analysis
        ↓
Translocation partner analysis
```

---

# Key Concepts

> **MosaiCatcher combines Strand-seq strand orientation, read depth, haplotype information, and multi-cell segmentation to infer structural-variant states at the single-cell level.**

> **Different SVs produce different footprints: deletions and duplications primarily alter copy number, inversions alter orientation, and translocations can be identified through abnormal strand patterns and co-segregation with recipient chromosome haplotypes.**

> **Unlike breakpointR, which mainly localizes strand-directionality change points, MosaiCatcher aims to classify genomic states, genotype SVs, compare cells, and reconstruct clonal structure.**
