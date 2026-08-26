---
publish: true
---



### Single-cell Whole Genome Sequencing (scWGS)

**Total Genome of Single Cell Sequencing -> Find out the genomic variation


* Genomic variation
	* SNVs (Single Nucleotide Variants): single nt substitutions
	* Indels: small insertions and deletions
	* CNVs (Copy Number Variations)
	* SVs (Structural Variations)

```
scWGS is particularly useful for studying **tumor heterogeneity, clonal
evolution, somatic mutations, and cell lineage relationships**.
```

#### Workflows

1. Single cell isolation
2. Library preparation: DNA fragmentation -> attach sequencing adapter
	1. SNS (Single-Nucleus Sequencing): WGA (Whole genome amplification) followed by library preparation (because there is a small amount of genomic DNA)
	2. DLP (Direct Library Preparation): without WGA
3. Sequencing and alignment: Sequenced reads are mapped to a reference genome (BWA or Bowtie2)
4. Remove PCR duplicates: Picard MarkDuplicates & BioBamBam
5. Genotyping: Freebayes, GATK
6. Variant calling: Genomic variants are identified per single cell (SCcaller, Monovar, Aneufinder)
7. Single-cell clustering and phylogenetic analysis: comparing based on their genomic alteration profiles (SCIPhi, TimeScape)

