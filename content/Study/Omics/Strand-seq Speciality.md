---
publish: true
---


# Low Coverage but Sufficient for Structural Variant Detection

Strand-seq typically generates **very low sequencing coverage per single cell** compared with conventional whole-genome sequencing. However, this low coverage can still be sufficient for detecting **structural variants (SVs)** because Strand-seq captures **DNA strand orientation** rather than relying only on local read depth.

## Why Low Coverage Can Be Sufficient

For detecting small variants such as SNVs, sequencing reads must directly cover the specific nucleotide position of interest. Therefore, reliable SNV detection generally requires sufficient local coverage.

In contrast, Strand-seq detects many structural variants by identifying changes in **Watson (W) and Crick (C) strand orientation** across relatively large genomic regions.

For example, an inversion can produce a characteristic strand-orientation switch:

```text
Normal:
WWWWWWWWWWWWWW

Inversion:
WWWWWCCCCWWWWW
     ↑   ↑
```

Because this signal extends across a genomic interval, Strand-seq does not necessarily require dense sequencing at every nucleotide. Even sparse reads can reveal a consistent change in strand direction across the affected region.

## Key Idea

**Low sequencing depth does not necessarily mean low information content.**

Strand-seq preserves strand-specific information that conventional sequencing does not retain. This makes broad structural changes detectable from relatively sparse genomic coverage.

Therefore:

> Strand-seq has low per-cell sequencing coverage, but its strand-orientation signal can still provide sufficient information for detecting structural variants, particularly inversions and other rearrangements that alter DNA directionality.

## Practical Advantage

The ability to detect structural variation at low coverage makes it possible to analyze many individual cells while keeping sequencing requirements relatively low. Multiple cells can also be combined computationally to improve confidence in recurrent structural variant signals.