---
publish: true
---


[[Filtering Library Types]]


## Overview

After Strand-seq libraries are sequenced, the reads are processed to
preserve and quantify **DNA strand directionality**. The major steps
are:

1.  Align paired-end reads to the reference genome.
2.  Determine whether reads originate from the **Watson (W)** or **Crick
    (C)** strand.
3.  Mark PCR duplicates and perform quality control.
4.  Count Watson and Crick reads in fixed genomic windows.
5.  Infer strand states such as **WW, WC, and CC**.
6.  Generate chromosome-level and cell-level plots for downstream
    structural-variant analysis.

------------------------------------------------------------------------

## 1. Assigning Reads to Watson and Crick Strands

After alignment, read orientation relative to the reference genome is
used to classify Strand-seq reads.

For the convention used in this workflow:

-   **Crick (C)** corresponds to the **plus/forward (+) strand**.
-   **Watson (W)** corresponds to the **minus/reverse (-) strand**.

For single-end orientation:

-   Forward alignment → **Crick**
-   Reverse alignment → **Watson**

In a BAM file, the alignment orientation can be determined from the SAM
FLAG. For example:

-   `SAMFLAG 0` indicates a forward-aligned read.
-   `SAMFLAG 16` indicates a reverse-complemented alignment.

For paired-end Strand-seq data, strand assignment also depends on
whether the read is the first or second mate:

-   **Crick:** read 1 aligned to `+`, or read 2 aligned to `-`
-   **Watson:** read 1 aligned to `-`, or read 2 aligned to `+`

Thus, Strand-seq retains information that is normally ignored in
conventional WGS: the orientation of template-strand-derived reads.

------------------------------------------------------------------------

## 2. Counting Watson and Crick Reads in Genomic Windows

The genome is divided into fixed-size windows, and Watson and Crick
reads are counted separately within each window.

Example window sizes include:

-   20 kb
-   50 kb
-   100 kb
-   200 kb
-   500 kb

Conceptually:

``` text
Chromosome
|---- bin 1 ----|---- bin 2 ----|---- bin 3 ----|

Watson reads       W W W            W
Crick reads          C              C C C

                    ↓
             W/C counts per bin
```

The window size controls a trade-off between **spatial resolution** and
**statistical stability**:

-   Smaller windows provide higher genomic resolution but contain fewer
    reads.
-   Larger windows contain more reads and produce more stable
    strand-state estimates but reduce breakpoint resolution.

Because Strand-seq typically has low per-cell coverage, binning reads
across genomic intervals provides a more robust signal than analyzing
individual genomic positions.

------------------------------------------------------------------------

## 3. Inferring Strand States

For a diploid chromosome, the two homologous chromosomes can contribute
parental template strands in three major configurations:

-   **WW** --- both homologs contribute Watson template strands
-   **WC** --- one homolog contributes Watson and the other Crick
-   **CC** --- both homologs contribute Crick template strands

Expected read patterns are approximately:

``` text
WW: mostly Watson reads
WC: Watson + Crick reads
CC: mostly Crick reads
```

These states describe **template-strand inheritance**, not genotype. For
example, WW does not mean homozygous and WC does not mean heterozygous.

------------------------------------------------------------------------

## 4. Hidden Markov Model for Strand-State Calling

Because read counts are noisy and coverage is low, strand states can be
modeled along the chromosome using a **Hidden Markov Model (HMM)**.

### Hidden states

The underlying hidden state for each genomic window is one of:

``` text
WW
WC
CC
```

### Observations

The observed data are the Watson and Crick read counts within each
genomic window.

The HMM considers:

-   the probability of the observed W/C counts given each strand state
-   the probability of remaining in the same state between adjacent
    windows
-   the probability of transitioning to another state

Because neighboring genomic windows usually belong to the same
chromosome segment, remaining in the same state is generally expected to
be more likely than frequent state switching.

The model then identifies the **most probable sequence of strand
states** across the chromosome, for example:

``` text
Genomic position →

WC → WC → WC → WC → WC → CC → CC → CC
                         ↑
                  state transition
```

A persistent transition can indicate a biologically meaningful
breakpoint or structural change, although state changes can also arise
from events such as sister chromatid exchange.

Read-count distributions and coverage can additionally provide
information about **copy number/ploidy**, because different copy-number
states are expected to generate different total read-count
distributions.

![[Pasted image 20260728132821.png]]

------------------------------------------------------------------------

# Processing the Strand-seq Library After Sequencing

## Input

The workflow begins with paired-end FASTQ files, typically:

``` text
*_1_sequence.txt.gz
*_2_sequence.txt.gz
```

------------------------------------------------------------------------

## Step 1. Alignment, Read Groups, and Duplicate Marking

Reads are aligned to a reference genome, such as **GRCh38**, using BWA.

Typical processing includes:

-   read alignment
-   conversion to BAM
-   sorting/indexing
-   addition of read-group information
-   PCR duplicate marking
-   preservation of alignment orientation

Read groups are particularly useful when multiple single cells or
libraries are processed together because reads must remain associated
with their originating cell/library.

------------------------------------------------------------------------

## Step 2. Filtering and Counting Reads in Fixed Windows

Aligned reads are filtered according to the pipeline's quality criteria.

Watson and Crick reads are then counted across fixed genomic bins, such
as:

``` text
20 kb
50 kb
100 kb
200 kb
```

The resulting count information can be used for:

-   Strand-seq quality control
-   W/C strand-state analysis
-   read-depth analysis
-   ploidy/copy-number assessment
-   preliminary identification of structural abnormalities

------------------------------------------------------------------------

## Step 3. Plots and Statistics

The processed data are summarized using cell-level and chromosome-level
plots.

These visualizations allow inspection of:

-   Watson/Crick balance
-   strand-state changes
-   chromosome-specific abnormalities
-   coverage and read depth
-   duplicate rates
-   possible structural variants

------------------------------------------------------------------------

# Workflow Management with Snakemake

The Strand-seq preprocessing workflow can be automated using
**Snakemake**, a Python-based workflow management system.

Snakemake represents the analysis as a set of interdependent rules:

``` text
FASTQ
  ↓
Alignment
  ↓
BAM sorting
  ↓
Duplicate marking
  ↓
Read counting
  ↓
Plots / statistics
```

Each rule specifies its required input and expected output. Snakemake
constructs a dependency graph and executes the required jobs in the
correct order.

Advantages include:

-   automated execution of multi-step workflows
-   reproducibility
-   dependency management
-   parallel execution
-   support for local machines and compute clusters
-   reuse of existing intermediate results

If an intermediate result already exists and is up to date, Snakemake
can avoid recomputing that step.

------------------------------------------------------------------------

# Example Pipeline

A typical preprocessing pipeline performs the following operations:

1.  **Align reads to GRCh38**
2.  **Add read groups**
3.  **Sort and index BAM files**
4.  **Mark PCR duplicates**
5.  **Count Watson and Crick reads in genomic bins**
6.  **Generate overview plots across cells**
7.  **Generate chromosome-level plots for individual cells**

The workflow can process multiple cells in parallel while preserving
cell-specific read information.

------------------------------------------------------------------------

# Pipeline Outputs

The preprocessing pipeline produces several types of output for quality
control and downstream analysis.

## 1. Overview Plots

Dataset-level plots summarize properties across cells, including:

-   selected bin size
-   excluded genomic bins/chromosomes
-   total reads per cell
-   duplicate rate
-   read-count mean/variance relationships

These plots help identify low-quality libraries or unusual cells before
downstream analysis.

## 2. Single-Cell Genome Profiles

For each cell, chromosome-wide profiles display Watson and Crick read
distributions.

These profiles can reveal:

-   WW/WC/CC strand states
-   strand-state transitions
-   chromosome abnormalities
-   candidate structural variants


## 3. Single-Chromosome Profiles

Individual chromosomes can be visualized at higher resolution to inspect
local changes in Watson/Crick orientation and potential breakpoints.
![[Pasted image 20260728131550.png]]
## 4. Count Matrices

Read-count matrices across genomic bins can be used for:

-   read-depth analysis
-   ploidy diagnosis
-   copy-number analysis
-   downstream statistical modeling

## 5. Processed BAM Files

Processed BAM files preserve the aligned sequencing information and can
be used as input for more advanced downstream analyses, including
segmentation and structural-variant detection.

------------------------------------------------------------------------

# Overall Workflow

``` text
Paired-end FASTQ                                                ---
        ↓                                                          |
BWA alignment to reference genome                                  |
        ↓                                                          |
Determine read orientation                                         |
        ↓                                                          |
Watson / Crick assignment                                          |
        ↓                                                          | 
Sort BAM + add read groups                                         |
        ↓                                                          |
Mark PCR duplicates                                                | 
        ↓                                                     Ashley-QC 
Filter reads                                                       |
        ↓                                                          |
Count W/C reads in genomic windows                                 |
        ↓                                                          |
Quality control + read-depth statistics                            |
        ↓                                                       ----      
WW / WC / CC strand-state inference (HMM)
        ↓
Chromosome segmentation / breakpoint analysis
        ↓
Structural-variant analysis
```

## Key Concept

> Strand-seq analysis converts the orientation of aligned sequencing
> reads into chromosome-scale Watson/Crick profiles. Binning and
> probabilistic strand-state inference make these directional signals
> usable even at low single-cell sequencing coverage, providing a
> foundation for breakpoint, copy-number, and structural-variant
> analysis.