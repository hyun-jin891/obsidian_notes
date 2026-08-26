---
publish: true
---



# 🌱 EX. Arabidopsis scRNA-seq
## Seurat + Harmony Workflow

---

# Overall Workflow

```text
10X Cell Ranger Output
        │
        ▼
Create Seurat Object
        │
        ▼
Calculate QC Metrics
(Mitochondrial / Chloroplast / Ribosomal)
        │
        ▼
Normalize Each Sample  (No mandatory)
        │
        ▼
Identify Highly Variable Genes (HVGs)   (No mandatory)
        │
        ▼
Merge All Samples
        │
        ▼
Quality Control Filtering
        │
        ▼
Re-normalization
        │
        ▼
Re-identify HVGs
        │
        ▼
Scale Data
        │
        ▼
Principal Component Analysis (PCA)
        │
        ▼
UMAP + Neighbor Graph + Clustering
        │
        ▼
Harmony Batch Correction
        │
        ▼
Harmony UMAP + Reclustering
        │
        ▼
Marker Gene Identification
        │
        ▼
Heatmap Visualization
        │
        ▼
Save Results
```

---

# 1. Load 10X Genomics Data

### Purpose

Load the Cell Ranger filtered count matrix into R.

**Functions**

- `Read10X()`
- `CreateSeuratObject()`

Each sequencing library is converted into an independent Seurat object.

Samples include:

- WT
- PIFq
- scDS1
- scDS2
- scT1S

---

# 2. Calculate Quality Control (QC) Metrics

Quality metrics are computed for every cell.

## Mitochondrial Percentage

```R
PercentageFeatureSet("^ATMG")
```

Purpose:

- Detect damaged or dying cells.
- High mitochondrial expression often indicates poor-quality cells.

---

## Chloroplast Percentage

```R
PercentageFeatureSet("^ATCG")
```

Purpose:

- Particularly important for plant scRNA-seq.
- Excessive chloroplast transcripts may indicate contamination or low-quality cells.

---

## Ribosomal Percentage

```R
PercentageFeatureSet("^RPS|^RPL")
```

Purpose:

- Measure ribosomal transcript abundance.
- Can reflect translation activity.

---

The following QC metrics are added to the metadata:

- `percent.mito`
- `percent.cp`
- `percent.ribo`

---

# 3. Normalize Each Sample

```R
NormalizeData()
```

Purpose:

- Correct sequencing-depth differences.
- Normalize gene expression within each sample before integration.

---

# 4. Identify Highly Variable Genes (HVGs)

```R
FindVariableFeatures()
```

Parameters

- Selection method: `vst`
- Number of genes: `2000`

Purpose:

- Select genes with the highest biological variability.
- HVGs are used for downstream dimensionality reduction.

---

# 5. Annotate Sample Information

Each Seurat object receives a sample label.

Example:

```
WT
PIFq
scDS1_1
...
```

Purpose:

- Preserve sample identity.
- Required later for batch correction using Harmony.

---

# 6. Merge Samples

```R
merge()
```

Purpose:

- Combine all individual samples into one Seurat object.

At this stage:

- Biological variation remains.
- Batch effects are still present.

---

# 7. Initial Quality Assessment

Visualize QC distributions using violin plots.

Metrics include:

- Number of detected genes (`nFeature_RNA`)
- Total UMI counts (`nCount_RNA`)
- Mitochondrial percentage
- Chloroplast percentage

Purpose:

- Inspect sample quality.
- Determine appropriate filtering thresholds.

---

# 8. Quality Control Filtering

Cells are filtered according to multiple criteria.

## Gene Count

Remove cells with extremely low numbers of detected genes.

Threshold:

- Lower 5% quantile

---

## UMI Count

Remove:

- Low-count cells (bottom 5%)
- Extremely high-count cells

Upper threshold:

```
Mean + 2 × Standard Deviation
```

Purpose:

- Remove poor-quality cells.
- Reduce potential doublets.

---

## Mitochondrial Percentage Example

```
< 5%
```

---

## Chloroplast Percentage Example

```
< 10%           This may be excessive, so mesophyll can be removed
```

---

Filtering is performed using

```R
subset()
```

---

# 9. Re-normalization

After filtering,

```R
NormalizeData()
```

is performed again.

Reason:

Removing cells changes the global count distribution.

---

# 10. Re-identify Highly Variable Genes

```R
FindVariableFeatures()
```

Purpose:

Recompute HVGs after QC filtering.

---

# 11. Scale the Data

Two scaling strategies are applied.

---

## Scale All Genes

```R
ScaleData(features = all.genes)
```

Purpose:

- Heatmap visualization
- Marker gene visualization

---

## Scale Only HVGs

```R
ScaleData()
```

Purpose:

- PCA
- UMAP
- Clustering

Scaling only HVGs reduces computational cost without affecting most downstream analyses.

---

# 12. Principal Component Analysis (PCA)

```R
RunPCA()
```

Input:

```
VariableFeatures()
```

Only HVGs are used.

Evaluate PCA using:

- `ElbowPlot()`
- `VizDimLoadings()`

Purpose:

Reduce dimensionality while preserving biological variation.

---

# 13. Initial Clustering

Pipeline:

```text
RunUMAP()
        ↓
FindNeighbors()
        ↓
FindClusters()
```

Performed using PCA embeddings.

Purpose:

Generate an initial clustering before batch correction.

---

# 14. Harmony Batch Correction

```R
RunHarmony()
```

Batch variable:

```
sample
```

Purpose:

- Remove sample-specific batch effects.
- Preserve biological variation.

Harmony produces a corrected low-dimensional embedding.

---

# 15. Clustering After Harmony

The Harmony embedding replaces PCA for downstream analyses.

Pipeline:

```text
Harmony Embedding
        ↓
RunUMAP()
        ↓
FindNeighbors()
        ↓
FindClusters()
```

Purpose:

Generate biologically meaningful clusters after removing batch effects.

---

# 16. Marker Gene Identification

```R
FindAllMarkers()
```

Parameters:

- Positive markers only
- Minimum expression percentage = 0.25
- Log2 fold-change threshold = 0.25

Purpose:

Identify genes specifically enriched in each cluster.

---

# 17. Marker Gene Visualization

Top marker genes are selected for each cluster.

Visualization:

```R
DoHeatmap()
```

Purpose:

- Evaluate cluster quality.
- Confirm biological identities.
- Compare marker expression across clusters.

---

# 18. Save Analysis Results

Marker genes:

```R
write.csv()
```

Output:

```
marker.csv
```

---

Seurat object:

```R
saveRDS()
```

Output:

```
obj.rds
```

Allows future analyses without rerunning the entire workflow.

---

# Complete Pipeline Summary

```text
Read10X
    │
CreateSeuratObject
    │
Calculate QC Metrics
    │
NormalizeData
    │
FindVariableFeatures
    │
Merge Samples
    │
Quality Control Filtering
    │
NormalizeData
    │
FindVariableFeatures
    │
ScaleData
    │
RunPCA
    │
RunUMAP
    │
FindNeighbors
    │
FindClusters
    │
RunHarmony
    │
RunUMAP
    │
FindNeighbors
    │
FindClusters
    │
FindAllMarkers
    │
DoHeatmap
    │
Save Results
```

---

# Key Seurat Functions

| Function | Purpose |
|-----------|---------|
| `Read10X()` | Load Cell Ranger count matrix |
| `CreateSeuratObject()` | Create Seurat object |
| `PercentageFeatureSet()` | Calculate QC metrics |
| `NormalizeData()` | Normalize gene expression |
| `FindVariableFeatures()` | Identify highly variable genes |
| `merge()` | Merge multiple samples |
| `ScaleData()` | Standardize expression values |
| `RunPCA()` | Perform principal component analysis |
| `RunUMAP()` | Compute UMAP embedding |
| `FindNeighbors()` | Build KNN graph |
| `FindClusters()` | Perform graph-based clustering |
| `RunHarmony()` | Correct batch effects |
| `FindAllMarkers()` | Identify cluster marker genes |
| `DoHeatmap()` | Visualize marker expression |
| `saveRDS()` | Save Seurat object |





-> After this, cell annotation will be carried out