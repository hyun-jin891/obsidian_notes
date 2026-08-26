---
publish: true
---



# 🧬 Cell Ranger Pipeline

> **Purpose**
>
> Cell Ranger is the official primary analysis pipeline developed by **10x Genomics** for Chromium single-cell sequencing data.
>
> It converts raw sequencing reads (FASTQ) into a **gene-by-cell UMI count matrix**, while performing barcode correction, UMI deduplication, alignment, cell calling, and basic secondary analysis.

---

# Overall Workflow

```text
BCL Files (Illumina)
        │
        ▼
cellranger mkfastq
        │
        ▼
FASTQ Files
        │
        ▼
cellranger count
        │
        ├── Barcode Processing
        ├── UMI Processing
        ├── Read Alignment
        ├── Gene Assignment
        ├── Cell Calling
        ├── UMI Counting
        ├── Secondary Analysis
        ▼
Output Files
        │
        ├── Filtered Count Matrix
        ├── Raw Count Matrix
        ├── BAM
        ├── Metrics
        ├── Web Summary
        └── Loupe File
```

---

# Cell Ranger Commands

## 1. mkfastq

Purpose

Convert Illumina BCL files into FASTQ files.

Input

```
BCL files
Sample Sheet
```

Output

```
FASTQ files
```

Example

```bash
cellranger mkfastq \
    --run=/data/run_folder \
    --csv=samplesheet.csv \
    --output-dir=fastq_output
```

(Current versions also support Illumina's **bcl-convert** workflow.)

---

## 2. count

Purpose

Analyze one Gene Expression sample.

Input

```
FASTQ

+

Reference Transcriptome
```

Output

```
Gene × Cell Count Matrix
```

Example

```bash
cellranger count \
    --id=Sample01 \
    --transcriptome=/ref/refdata-gex-GRCh38-2024-A \
    --fastqs=/data/fastqs \
    --sample=Sample01 \
    --localcores=16 \
    --localmem=64
```

Common parameters

| Parameter | Description |
|-----------|-------------|
| --id | Output directory name |
| --fastqs | FASTQ directory |
| --sample | Sample name |
| --transcriptome | Reference transcriptome |
| --localcores | CPU threads |
| --localmem | RAM (GB) |

---

## 3. multi

Purpose

Analyze multiple library types simultaneously.

Supported combinations

- Gene Expression
- Cell Multiplexing
- Feature Barcode
- Antibody Capture
- CRISPR Guide Capture
- V(D)J

Input

```
multi_config.csv
```

Example

```bash
cellranger multi \
    --id=PBMC \
    --csv=config.csv
```

---

## 4. aggr

Purpose

Aggregate multiple Cell Ranger outputs.

Typical uses

- Multiple sequencing lanes
- Multiple technical replicates
- Sequencing depth normalization

Example

```bash
cellranger aggr \
    --id=combined \
    --csv=aggregation.csv
```

---

## 5. reanalyze

Purpose

Run secondary analysis again.

Possible changes

- Number of PCs
- Clustering resolution
- Dimensionality reduction

No realignment is performed.

---

## 6. mkref

Purpose

Build a custom reference.

Input

```
Genome FASTA

+

Gene Annotation GTF
```

Output

```
Reference Transcriptome
```

---

# Internal Workflow of cellranger count

```text
FASTQ
        │
        ▼
Read Barcode
        │
        ▼
Barcode Error Correction
        │
        ▼
UMI Extraction
        │
        ▼
Read Alignment
(STAR)
        │
        ▼
Transcript Assignment
        │
        ▼
Gene Assignment
        │
        ▼
UMI Deduplication
        │
        ▼
Cell Calling
        │
        ▼
Count Matrix Generation
        │
        ▼
Secondary Analysis
```

---

# Step 1. Barcode Processing

Each Read 1 contains

```
Cell Barcode

+

UMI
```

Cell Ranger

- extracts
- validates
- error-corrects

the barcode sequence.

Reads with invalid barcodes are discarded.

---

# Step 2. Read Alignment

Read 2 contains

```
cDNA
```

Alignment is performed using a STAR-based aligner against the supplied reference transcriptome.

Output

```
Genome coordinates
```

---

# Step 3. Gene Assignment

Each aligned read is assigned to a gene.

Possible outcomes

- Exonic
- Intronic (depending on chemistry/settings)
- Ambiguous
- Intergenic

---

# Step 4. UMI Deduplication

Reads sharing

- same Cell Barcode
- same Gene
- same UMI

are considered PCR duplicates.

They collapse into

```
1 transcript
```

---

# Step 5. Cell Calling

Not every barcode corresponds to a real cell.

Cell Ranger determines which barcodes represent genuine cells.

Methods include

- UMI distribution
- Empty droplet modeling
- Barcode rank analysis

Output

```
Filtered Barcodes
```

---

# Step 6. Count Matrix Generation

Final matrix

Rows

```
Genes
```

Columns

```
Cells
```

Entries

```
UMI Counts
```

---

# Step 7. Secondary Analysis

Automatically performed.

Includes

- PCA
- Graph-based clustering
- t-SNE / UMAP (version dependent)
- Differential expression
- Marker genes

---

# Output Directory Structure

```text
Sample01/

├── outs/
│   ├── filtered_feature_bc_matrix/
│   ├── raw_feature_bc_matrix/
│   ├── possorted_genome_bam.bam
│   ├── molecule_info.h5
│   ├── metrics_summary.csv
│   ├── web_summary.html
│   ├── cloupe.cloupe
│   └── analysis/
```

---

# Important Output Files

## filtered_feature_bc_matrix/

Cells passing Cell Ranger QC.

Use this for Seurat or Scanpy.

---

## raw_feature_bc_matrix/

Contains

- true cells
- empty droplets

Useful for EmptyDrops.

---

## possorted_genome_bam.bam

Genome-aligned BAM.

Contains

- Cell Barcode
- UMI
- Alignment information

---

## molecule_info.h5

Stores every detected molecule before UMI collapsing.

Useful for advanced analyses.

---

## metrics_summary.csv

Tabular QC metrics.

---

## web_summary.html

Interactive quality-control report.

Open with any modern web browser.

```
Double-click

or

Firefox

or

Chrome
```

No internet connection is required.

---

## cloupe.cloupe

Visualization file for

Loupe Browser.

---

# Understanding web_summary.html

The web summary is the primary QC report generated by Cell Ranger and includes sequencing metrics, mapping statistics, cell-calling metrics, and automated secondary analysis. Alerts are shown if Cell Ranger detects potential issues during processing. Since Cell Ranger v8, the Summary page also records the exact command-line arguments used to run the analysis. :contentReference[oaicite:1]{index=1}

---

## Summary Tab

Displays overall sequencing and cell-calling metrics.

Top metrics include

### Estimated Number of Cells

Number of barcodes identified as real cells.

---

### Mean Reads per Cell

Average sequencing depth.

General recommendation

```
>20,000 reads/cell
```

(depending on experiment)

---

### Median Genes per Cell

Median number of detected genes.

Higher generally indicates better library complexity, although expectations depend strongly on cell type. :contentReference[oaicite:2]{index=2}

---

## Sequencing Metrics

Includes

- Total Reads
- Valid Barcodes
- Q30 Bases
- Sequencing Saturation

Purpose

Evaluate sequencing quality.

---

## Mapping Metrics

Includes

- Reads mapped confidently
- Reads in exons
- Reads in introns
- Reads antisense

Purpose

Evaluate alignment quality.

---

## Cell Metrics

Includes

- Fraction Reads in Cells
- Median UMI Counts
- Median Genes per Cell

Purpose

Assess cell capture and library quality.

---

## Barcode Rank Plot

One of the most important QC plots.

Axes

```
X

Barcodes

Y

UMI Counts
```

### Ideal Pattern

```
─────────────\
              \
               \
                \_____
```

A sharp "cliff" indicates good separation between real cells and empty droplets.

### Poor Pattern

```
────────────
────────────
────────────
```

A gradual decline may indicate

- poor cell viability
- ambient RNA contamination
- cell lysis
- overloading
- failed GEM generation

---

# Gene Expression Tab

Contains automated secondary analysis.

Includes

- PCA
- UMAP / t-SNE
- Graph-based clustering
- Differentially expressed genes

Useful for a rapid inspection before downstream analysis in Seurat or Scanpy. :contentReference[oaicite:3]{index=3}

---

# Recommended Quality Checks

✔ Estimated number of cells matches experimental expectation

✔ Median genes per cell is reasonable for the biological sample

✔ Fraction Reads in Cells is high

✔ Confident mapping rate is high

✔ Barcode Rank Plot shows a clear cliff

✔ No critical warnings or error alerts appear in the Summary tab

---

# Typical Workflow

```text
Illumina Sequencer
        │
        ▼
BCL Files
        │
        ▼
cellranger mkfastq
        │
        ▼
FASTQ
        │
        ▼
cellranger count
        │
        ▼
filtered_feature_bc_matrix
        │
        ▼
Seurat / Scanpy
        │
        ▼
QC
        │
        ▼
Normalization
        │
        ▼
Clustering
        │
        ▼
Cell Type Annotation
```