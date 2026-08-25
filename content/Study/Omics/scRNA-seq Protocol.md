---
publish: true
---

# 🧬 Single-Cell RNA Sequencing (scRNA-seq) Experimental Protocol

> **Objective**
>
> To profile the transcriptome of individual cells by isolating single cells, capturing their mRNA, generating barcoded cDNA libraries, sequencing them, and reconstructing gene expression matrices for downstream computational analysis.

---

# Overall Workflow

```text
Biological Sample
        │
        ▼
Tissue Dissociation
        │
        ▼
Single-Cell Suspension
        │
        ▼
Cell Quality Assessment
        │
        ▼
Single-Cell Isolation
        │
        ▼
Cell Lysis
        │
        ▼
mRNA Capture
        │
        ▼
Reverse Transcription
        │
        ▼
Cell Barcode + UMI Assignment
        │
        ▼
cDNA Amplification
        │
        ▼
Library Preparation
        │
        ▼
Next-Generation Sequencing
        │
        ▼
FASTQ Files
        │
        ▼
Cell Ranger / STARsolo / Other Pipeline
        │
        ▼
Gene × Cell Count Matrix
```

---

# Step 1. Biological Sample Collection

## Purpose

Obtain viable tissue or cultured cells for single-cell transcriptome analysis.

## Typical Samples

- Fresh tissue
- Frozen tissue (protocol dependent)
- Cell culture
- Blood
- Plant tissue
- Organoids

## Considerations

- Minimize ischemic time.
- Preserve RNA integrity.
- Keep samples cold whenever possible.

---

# Step 2. Tissue Dissociation

## Purpose

Separate intact tissue into individual cells.

## Typical Methods

### Mechanical dissociation

- Chopping
- Mincing
- GentleMACS homogenization

### Enzymatic digestion

Common enzymes include

- Collagenase
- Dispase
- Trypsin
- Papain
- Cellulase (plants)
- Pectinase (plants)

The enzyme cocktail depends on the tissue type.

---

# Step 3. Generate a Single-Cell Suspension

## Purpose

Obtain a suspension containing individual cells.

Common procedures

- Pipetting
- Gentle trituration
- Filtration (typically 40–70 μm strainers)

Remove

- Cell clumps
- Debris
- Extracellular matrix

---

# Step 4. Cell Quality Assessment

## Purpose

Evaluate whether cells are suitable for sequencing.

Common measurements

### Cell viability

Typical threshold

```
> 80–90%
```

Measured using

- Trypan Blue
- AO/PI staining
- Flow cytometry

---

### Cell concentration

Measured with

- Hemocytometer
- Automated cell counter

---

### Doublet inspection

Avoid excessive cell concentration to minimize two cells entering the same capture event.

---

# Step 5. Single-Cell Isolation

Several experimental platforms exist.

---

## Droplet-based (10x Genomics Chromium)

Most widely used.

Workflow

```text
Cell
        +
Gel Bead
        +
Oil
        ↓
GEM (Gel Bead-in-Emulsion)
```

Each droplet ideally contains

- one cell
- one gel bead

---

## Plate-based

Examples

- SMART-seq2
- SMART-seq3

One cell is sorted into one well.

Advantages

- Full-length transcripts
- Higher sensitivity

Disadvantages

- Lower throughput

---

## Microwell-based

Examples

- Seq-Well

Cells settle into microwells before barcoding.

---

# Step 6. Cell Lysis

Cells are lysed inside droplets or wells.

Purpose

Release

- mRNA
- other intracellular contents

Only RNA is retained for downstream processing.

---

# Step 7. mRNA Capture

Most protocols capture

```
Poly(A)+ mRNA
```

using

```
Oligo(dT)
```

attached to the bead.

Captured molecules include

```
5' cap
↓

Coding sequence

↓

Poly(A) tail
```

The oligo(dT) hybridizes to the poly(A) tail.

---

# Step 8. Reverse Transcription

Reverse transcriptase converts

```
mRNA
```

↓

```
cDNA
```

At this stage, each cDNA molecule receives

- Cell Barcode
- Unique Molecular Identifier (UMI)

---

# Step 9. Cell Barcode and UMI Assignment

Each sequencing read contains

```
Cell Barcode
```

Identifies the cell of origin.

---

```
UMI
```

Identifies the original RNA molecule.

Purpose

PCR duplicates sharing the same UMI are collapsed into one transcript count.

---

Example

```
Cell A

Gene X

UMI = ACTG

PCR
↓

500 reads

↓

Count = 1 transcript
```

---

# Step 10. cDNA Amplification

Because each cell contains only picogram quantities of RNA,

PCR amplification is performed.

Purpose

Generate sufficient material for sequencing.

Potential issue

- PCR amplification bias

UMIs help correct this computationally.

---

# Step 11. Library Preparation

The amplified cDNA is converted into a sequencing library.

Typical procedures

- Fragmentation (platform dependent)
- Adapter ligation
- Index addition

The final library contains

```
Adapter

Cell Barcode

UMI

cDNA insert
```

---

# Step 12. Next-Generation Sequencing

Typically performed on Illumina platforms.

Examples

- NovaSeq
- NextSeq
- HiSeq

Typical read structure (10x Genomics 3')

```
Read 1
--------
Cell Barcode
UMI

Read 2
--------
cDNA sequence

Index Read
--------
Sample Index
```

---

# Step 13. Base Calling

The sequencer generates

```
BCL files
```

↓

converted to

```
FASTQ files
```

using

```
bcl2fastq

or

mkfastq
```

---

# Step 14. Read Alignment

Common pipelines

- Cell Ranger
- STARsolo
- Alevin
- Kallisto | Bustools

Reads are aligned against a reference genome or transcriptome.

Example

```
FASTQ

↓

Alignment

↓

Gene Assignment
```

---

# Step 15. UMI Counting

Reads sharing

- identical Cell Barcode
- identical UMI
- identical Gene

are collapsed.

Purpose

Estimate the number of original RNA molecules.

---

# Step 16. Cell Calling

Separate real cells from empty droplets.

Algorithms

- Cell Ranger
- EmptyDrops

Output

A filtered list of valid cells.

---

# Step 17. Gene × Cell Count Matrix

Final output

Rows

```
Genes
```

Columns

```
Cells
```

Values

```
UMI counts
```

Example

| Gene | Cell1 | Cell2 | Cell3 |
|------|------:|------:|------:|
| ACTB | 18 | 2 | 5 |
| GAPDH | 9 | 11 | 4 |
| CD3D | 0 | 31 | 0 |

This count matrix serves as the input for downstream analysis in Seurat, Scanpy, or similar frameworks.

---

# Downstream Computational Analysis

```text
Gene × Cell Matrix
        │
        ▼
Quality Control
        │
        ▼
Normalization
        │
        ▼
Highly Variable Gene Selection
        │
        ▼
Scaling
        │
        ▼
PCA
        │
        ▼
Batch Correction (optional)
        │
        ▼
UMAP / t-SNE
        │
        ▼
Clustering
        │
        ▼
Marker Gene Detection
        │
        ▼
Cell Type Annotation
        │
        ▼
Differential Expression
        │
        ▼
Trajectory / Cell Communication /
Gene Regulatory Network Analysis
```

---

# Summary of Major Experimental Steps

| Step | Objective |
|-------|-----------|
| Sample collection | Obtain viable biological material |
| Tissue dissociation | Generate individual cells |
| Cell quality assessment | Remove low-quality cells before library preparation |
| Single-cell isolation | Separate individual cells into independent reaction compartments |
| Cell lysis | Release intracellular RNA |
| mRNA capture | Capture poly(A)+ transcripts using oligo(dT) |
| Reverse transcription | Convert mRNA into cDNA |
| Cell barcode assignment | Identify the cell of origin |
| UMI assignment | Quantify original RNA molecules accurately |
| PCR amplification | Increase cDNA yield for sequencing |
| Library preparation | Construct sequencing-ready DNA libraries |
| Next-generation sequencing | Generate raw sequencing reads |
| Alignment & UMI counting | Produce gene-level transcript counts |
| Cell calling | Identify true cells and remove empty droplets |
| Count matrix generation | Produce the Gene × Cell matrix for downstream analysis |