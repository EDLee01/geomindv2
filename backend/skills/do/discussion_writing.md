# Discussion Writing Skill (Do Agent)

## Purpose
Write Discussion section with literature support and interpretation of results.

## Process

### 1. Identify Discussion Points

Based on Results, identify key findings to discuss:
- Main findings that need interpretation
- Unexpected results
- Comparisons with previous studies
- Methodological considerations
- Implications

### 2. Literature Support

**Trigger supplementary literature search:**

```
GeoMind: 根据你的结果，建议补充以下文献支撑：

1. **水温与 DO 负相关** (r = -0.72)
   - 需要找支撑文献？
   - 建议检索: "water temperature dissolved oxygen relationship"

2. **LSTM 预测精度** (R² = 0.89)
   - 需要找对比研究？
   - 建议检索: "LSTM water quality prediction accuracy"

3. **季节性变化模式**
   - 需要机理解释文献？

请告诉我需要检索哪些。
```

### 3. Citation Format

**Always provide abstract support:**

```markdown
**文献支撑**:
> Zhang et al. (2023) 在摘要中指出："Water temperature was identified
> as the primary driver of dissolved oxygen variation, with a correlation
> coefficient of -0.68 (p < 0.01)."
> [DOI: https://doi.org/10.1016/j.watres.2023.xxx]

本研究发现的 r = -0.72 与该结果一致，进一步证实了...
```

### 4. Discussion Structure

```markdown
# Discussion

## 4.1 Interpretation of Key Findings

### 4.1.1 Temporal Trends
The significant decreasing trend in DO (Sen's slope = -0.05 mg/L/year)
is consistent with previous studies in similar watersheds. Zhang et al.
(2023) reported a decline rate of 0.04-0.06 mg/L/year in the Yangtze
River Delta [1].

This trend may be attributed to:
1. Increasing water temperature due to climate change [2]
2. Elevated nutrient loading from agricultural runoff [3]
...

### 4.1.2 Spatial Patterns
The observed spatial clustering (Moran's I = 0.65) suggests...

## 4.2 Comparison with Previous Studies

| Study | Region | Method | R² | This Study |
|-------|--------|--------|----| -----------|
| Wang (2022) | Taihu | RF | 0.82 | 0.87 |
| Li (2023) | PRD | LSTM | 0.85 | 0.89 |

Our model achieved comparable or better performance...

## 4.3 Methodological Considerations

The use of LSTM networks offers advantages in capturing...
However, limitations include...

## 4.4 Implications

### 4.4.1 Scientific Implications
...

### 4.4.2 Management Implications
...

## 4.5 Limitations and Future Directions

1. Limited temporal coverage (3 years)
2. Uncertainty in interpolated meteorological data
3. Future work could incorporate...
```

## Quality Criteria

- Every interpretation supported by data OR literature
- Clear connection between results and discussion
- Honest acknowledgment of limitations
- Balanced comparison with prior work
- Practical implications clearly stated

## User Collaboration

Discussion depth is controlled by user:
- User decides which findings to emphasize
- User chooses interpretation direction
- GeoMind provides literature support
- Iterative refinement based on feedback
