---
layout: page
title: UFG-GGEMM
description: High-performance grouped matrix multiplication for fine-grained and ultra-fine-grained Mixture-of-Experts workloads.
img: assets/img/projects/ufg-ggemm-architecture.svg
importance: 2
category: research
related_publications: false
github: https://github.com/shuochen0113/ufg-ggemm
---

**Tsinghua University** · Oct. 2025 – Jun. 2026

_Research Assistant with Prof. Bowen Zhou & Dr. Youbang Sun_

UFG-GGEMM is a CUDA operator library for PyTorch Mixture-of-Experts models. It targets fine-grained routing regimes in which launch cost, scheduling, metadata construction, padding, and data movement can dominate tensor-core arithmetic.

{% include figure.liquid loading="lazy" path="assets/img/projects/ufg-ggemm-architecture.svg" title="UFG-GGEMM operator architecture" %}

## Highlights

- One autograd-enabled `grouped_mm` API that accepts cumulative offsets or per-expert counts.
- GPU-resident routing metadata and shape-aware dispatch for dense, sparse-active, and fine-grained expert distributions.
- Hopper TMA/WGMMA pipelines with cluster multicast, plus portable CUTLASS fallbacks for Ampere and Ada GPUs.
- Support for BF16 autograd, empty experts, skewed routing, CUDA Graph capture, and `torch.compile`.

On an NVIDIA H800, the measured BF16 crossover against DeepGEMM occurs at 512 experts, with relative throughput reaching 1.33× at 6,144 experts.

{% include figure.liquid loading="lazy" path="assets/img/projects/ufg-ggemm-performance.svg" title="UFG-GGEMM BF16 performance relative to DeepGEMM" %}

[View the source code on GitHub](https://github.com/shuochen0113/ufg-ggemm).
