# Lighthouse — v2-after

Median of 3 runs per page against `http://localhost:4173` (vite preview, local, simulated throttling).

| form | page | perf (runs) | a11y | best pr. | seo | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mobile | 404 | **86** (84/86/86) | 96 | 100 | 100 | 3.0 s | 3.4 s | 44 ms | 0.002 |
| mobile | home | **89** (88/89/89) | 96 | 100 | 100 | 2.8 s | 2.9 s | 158 ms | 0.004 |
| mobile | shop | **89** (89/89/89) | 100 | 100 | 100 | 2.9 s | 3.0 s | 35 ms | 0.003 |
| mobile | product | **85** (84/85/85) | 96 | 100 | 100 | 2.9 s | 3.6 s | 60 ms | 0.009 |
| mobile | about | **85** (85/84/85) | 96 | 100 | 100 | 2.9 s | 3.6 s | 49 ms | 0.003 |
| mobile | cart | **89** (89/89/89) | 100 | 100 | 100 | 2.9 s | 3.1 s | 50 ms | 0.020 |
| mobile | checkout | **88** (88/88/88) | 100 | 100 | 100 | 2.9 s | 3.1 s | 46 ms | 0.042 |
| desktop | 404 | **99** (99/99/99) | 96 | 100 | 100 | 0.7 s | 0.8 s | 0 ms | 0.003 |
| desktop | home | **100** (100/100/100) | 96 | 100 | 100 | 0.6 s | 0.7 s | 0 ms | 0.006 |
| desktop | shop | **100** (100/100/100) | 100 | 100 | 100 | 0.7 s | 0.7 s | 0 ms | 0.003 |
| desktop | product | **100** (100/100/100) | 96 | 100 | 100 | 0.7 s | 0.7 s | 0 ms | 0.003 |
| desktop | about | **99** (99/99/99) | 96 | 100 | 100 | 0.7 s | 0.8 s | 0 ms | 0.003 |
| desktop | cart | **100** (100/100/100) | 96 | 100 | 100 | 0.7 s | 0.7 s | 0 ms | 0.003 |
| desktop | checkout | **100** (100/100/100) | 100 | 100 | 100 | 0.7 s | 0.7 s | 0 ms | 0.003 |
