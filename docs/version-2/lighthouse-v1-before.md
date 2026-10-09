# Lighthouse — v1-before

Median of 3 runs per page against `http://localhost:4174` (vite preview, local, simulated throttling).

| form | page | perf (runs) | a11y | best pr. | seo | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mobile | 404 | **90** (87/90/96) | 96 | 100 | 100 | 2.8 s | 3.0 s | 74 ms | 0.002 |
| mobile | home | **90** (90/90/90) | 96 | 100 | 100 | 2.8 s | 2.9 s | 111 ms | 0.003 |
| mobile | shop | **90** (90/89/96) | 100 | 100 | 100 | 2.8 s | 3.0 s | 43 ms | 0.003 |
| mobile | product | **89** (89/89/89) | 96 | 100 | 100 | 2.9 s | 3.0 s | 48 ms | 0.007 |
| mobile | about | **85** (85/85/86) | 96 | 100 | 100 | 2.9 s | 3.6 s | 39 ms | 0.003 |
| mobile | cart | **89** (89/89/88) | 96 | 100 | 100 | 2.9 s | 3.1 s | 41 ms | 0.021 |
| mobile | checkout | **89** (89/89/96) | 100 | 100 | 100 | 2.8 s | 3.0 s | 35 ms | 0.043 |
| desktop | 404 | **100** (100/100/100) | 96 | 100 | 100 | 0.7 s | 0.7 s | 0 ms | 0.003 |
| desktop | home | **100** (100/100/100) | 96 | 100 | 100 | 0.6 s | 0.7 s | 0 ms | 0.006 |
| desktop | shop | **100** (100/100/100) | 100 | 100 | 100 | 0.7 s | 0.7 s | 0 ms | 0.003 |
| desktop | product | **100** (100/100/100) | 96 | 100 | 100 | 0.7 s | 0.7 s | 0 ms | 0.003 |
| desktop | about | **99** (99/99/99) | 96 | 100 | 100 | 0.7 s | 0.8 s | 0 ms | 0.003 |
| desktop | cart | **100** (100/100/100) | 96 | 100 | 100 | 0.7 s | 0.7 s | 0 ms | 0.003 |
| desktop | checkout | **100** (100/100/100) | 100 | 100 | 100 | 0.7 s | 0.7 s | 0 ms | 0.025 |
