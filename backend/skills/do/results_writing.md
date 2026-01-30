# Results Writing Skill (Do Agent)

## Purpose
Write Results section based on structured analysis data with deep user collaboration.

## Core Principle

**User Participation** - This is the user's paper, not GeoMind's paper.

## Data Sources

Read from project memory:
- `results_data.json` - Structured analysis results
- `tables/*.md` - Generated tables
- `figures/*.png` - Generated figures

## Process

### 1. Present Options to User

```
GeoMind: 根据分析结果，Results 可以包含以下内容：

1. **溶解氧时间变化特征**
   - 关键数据：年均 7.85 mg/L，夏季最低 5.2 mg/L
   - 对应图表：图 1、表 1

2. **空间分布特征**
   - 关键数据：上游 > 下游，差异显著 (p<0.05)
   - 对应图表：图 2

3. **驱动因子分析**
   - 关键数据：温度 (r=-0.72)、流量 (r=0.45) 显著相关
   - 对应图表：表 2、图 3

你希望：
A) 我先生成初稿，你再修改
B) 逐节讨论，你告诉我写作重点
C) 你提供思路，我来执行
```

### 2. Generate Based on User Choice

**Option A - Full Draft:**
- Generate complete Results section
- User reviews and provides feedback
- Iterate based on feedback

**Option B - Section by Section:**
- Discuss each subsection
- User specifies emphasis
- Generate incrementally

**Option C - User-Led:**
- User provides outline/key points
- GeoMind fills in details with data

### 3. Writing Guidelines

- **Data-Driven**: Every statement backed by data
- **Figure/Table References**: Proper citations (Fig. 1, Table 1)
- **No Interpretation**: Save interpretation for Discussion
- **Logical Flow**: Organize by theme, not by method

## Output Format

```markdown
# Results

## 3.1 Temporal Variation of Dissolved Oxygen

The dissolved oxygen concentration showed significant temporal variation
during the study period (Table 1). The annual mean DO was 7.85 ± 1.23 mg/L,
with the highest values observed in winter (9.2 mg/L) and lowest in summer
(5.2 mg/L) (Fig. 1).

**Table 1** Seasonal statistics of dissolved oxygen (mg/L)

| Season | Mean | SD | Min | Max |
|--------|------|-----|-----|-----|
| Spring | 8.1 | 0.9 | 6.5 | 9.8 |
| Summer | 5.8 | 1.2 | 4.2 | 7.5 |
| ...

The Mann-Kendall test indicated a significant decreasing trend (Z = -2.45,
p = 0.014), with Sen's slope of -0.05 mg/L per year (Fig. 2).

## 3.2 Spatial Distribution

Spatial analysis revealed significant heterogeneity in DO distribution
across the study area (Moran's I = 0.65, p < 0.001). Hot spot analysis
identified the upstream region as a significant high-value cluster
(Fig. 3).
```

## Quality Criteria

- All data values match source data
- Proper significant figures
- Consistent units throughout
- Figures and tables properly referenced
- No interpretation (save for Discussion)
- Logical paragraph structure
