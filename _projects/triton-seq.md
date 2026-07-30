---
layout: page
title: Triton-Seq
description: A compiler-extended Triton framework for GPU-accelerated Smith-Waterman sequence alignment with custom MLIR passes for automatic shared memory optimization.
img: assets/img/projects/triton-seq-pipeline.png
importance: 1
category: research
related_publications: false
github: https://github.com/shuochen0113/Triton-Seq
---

**Cornell University** · Nov. 2024 – Apr. 2026

_Research Intern with Prof. Zhiru Zhang_

A high-performance GPU-accelerated framework for Smith-Waterman sequence alignment, featuring optimized Triton kernels and custom compiler extensions for automatic shared memory optimization.

{% include figure.liquid loading="lazy" path="assets/img/projects/triton-seq-pipeline.png" title="Triton-Seq asynchronous host pipeline and sequence packing" %}

## Highlights

- Optimized Triton kernel with wavefront parallelism, a ring-buffer design, and 4-bit DNA sequence encoding.
- Custom MLIR passes for automatic shared-memory promotion, reproducing a manually validated optimization of approximately 35%.
- Asynchronous double-buffered execution that overlaps CPU preparation and GPU execution across two CUDA streams.
- Bit-exact correctness verification against AGAThA and ksw2.

{% include figure.liquid loading="lazy" path="assets/img/projects/triton-seq-shared-memory.png" title="Triton-Seq dynamic-programming buffer and shared-memory layout" %}

[View the source code on GitHub](https://github.com/shuochen0113/Triton-Seq).
