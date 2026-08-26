---
publish: true
---


[[Strand-seq Data Processing]]


# Overview of Single-Cell Genome Data Analysis – Strand-seq

## Context

Single-cell genome sequencing approaches provide different types of genomic information.

- **Single-nucleus sequencing (SNS)** and **Direct Library Preparation (DLP)** can be used for single-cell whole-genome analysis, including detection of genomic variants.
- **Strand-seq** preserves the orientation of parental DNA template strands and is particularly useful for **structural variation (SV)** analysis.

Strand-seq analysis therefore incorporates not only genomic position but also the **Watson/Crick orientation** of sequencing reads.

---

## Strand-seq Analysis Workflow

### Step 1. Alignment and Read Orientation

Sequencing reads are aligned to a reference genome to determine their genomic positions.

- **BWA** can be used for read alignment.
- The **sequence orientation** of aligned reads is retained to distinguish Watson- and Crick-oriented reads.

Strand orientation is a key source of information in Strand-seq because changes in Watson/Crick patterns can indicate chromosome rearrangements.

---

### Step 2. PCR Duplicate Removal and Quality Checking

PCR duplicates are identified and removed or marked to reduce technical bias introduced during library amplification.

Example tool:

- **BioBamBam**

Alignment and duplicate processing are also important parts of **quality control**, because Strand-seq libraries should contain reliable strand-specific signals with limited technical artifacts.

---

### Step 3. Genotyping, Haplotyping, and Segmentation

After preprocessing, strand-specific read patterns are analyzed across the genome.

This stage can include:

- **Genotyping**
- **Haplotyping / phasing**
- **Genome segmentation**
- Detection of changes in Watson/Crick strand states

Example tool:

- **BreakpointR**

BreakpointR identifies genomic positions where strand-state patterns change and segments chromosomes according to these changes.

---

### Step 4. Structural Variant Calling

The segmented and strand-specific information can then be used to identify **structural variants**.

Example pipeline/tool:

- **Mosaicatcher**

Strand-seq is particularly informative for structural alterations that affect DNA orientation or chromosome structure, including inversions and complex rearrangements.

Because these variants can generate strand-orientation changes across relatively large genomic regions, Strand-seq can provide informative SV signals even at **low per-cell sequencing coverage**.

---

### Step 5. Single-Cell Clustering and Phylogenetic Analysis

Structural variation profiles from individual cells can be compared to identify cells sharing similar genomic alterations.

These profiles can be used for:

- **Single-cell clustering**
- Identification of clones and subclones
- Analysis of genomic heterogeneity
- **Phylogenetic and lineage reconstruction**
- Investigation of clonal evolution

---

## Overall Workflow

```text
Strand-seq library
        ↓
Read alignment
+ Watson/Crick orientation
        ↓
PCR duplicate processing
+ quality control
        ↓
Genotyping / Haplotyping / Segmentation
        ↓
Breakpoint detection
        ↓
Structural variant calling
        ↓
Single-cell clustering
+ phylogenetic analysis
```

## Key Concept

> Strand-seq preserves DNA strand directionality, allowing Watson/Crick orientation changes to be used as informative signals for structural variant detection at the single-cell level.


