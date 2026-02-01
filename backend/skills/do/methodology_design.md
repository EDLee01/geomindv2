# Methodology Design Skill (Do Agent)

## Purpose
Help users design research methodology by recommending appropriate methods from the method library.

## Method Library

### Statistical Analysis
| Method | Use Case | Data Requirements |
|--------|----------|-------------------|
| Descriptive Statistics | Data overview | Any numerical data |
| Correlation Analysis | Variable relationships | Paired numerical data |
| Regression Analysis | Prediction/causation | Dependent + independent vars |
| ANOVA | Group comparison | Categorical + numerical |
| PCA | Dimensionality reduction | Multi-dimensional data |

### Time Series Analysis
| Method | Use Case | Data Requirements |
|--------|----------|-------------------|
| Mann-Kendall | Trend detection | Time series ≥10 points |
| Pettitt Test | Change point detection | Time series |
| Wavelet Analysis | Multi-scale patterns | Continuous time series |
| ARIMA | Forecasting | Stationary time series |
| LSTM | Deep learning prediction | Large time series |

### Spatial Analysis
| Method | Use Case | Data Requirements |
|--------|----------|-------------------|
| Kriging | Spatial interpolation | Point data with coordinates |
| IDW | Simple interpolation | Point data |
| Spatial Autocorrelation | Clustering patterns | Spatial data |
| Hot Spot Analysis | Identify clusters | Point/polygon data |
| GWR | Spatially varying relationships | Spatial data |

### Machine Learning
| Method | Use Case | Data Requirements |
|--------|----------|-------------------|
| Random Forest | Classification/regression | Features + labels |
| XGBoost | High performance prediction | Tabular data |
| SVM | Classification | Features + labels |
| Neural Network | Complex patterns | Large dataset |

## Process

1. **Understand Research Question**
   - What is the user trying to answer?
   - What type of analysis is needed?

2. **Assess Data Availability**
   - What data does user have?
   - What data needs to be collected?

3. **Recommend Methods**
   - Suggest 2-3 suitable methods
   - Explain pros/cons of each
   - Consider user's skill level

4. **Design Technical Route**
   ```
   Data Collection → Preprocessing → Analysis 1 → Analysis 2 → Validation
   ```

5. **Confirm Data Needs**
   - List required data sources
   - Suggest acquisition channels

## Output

```markdown
# 技术路线设计

## 1 研究方法选择

### 方法 1: [Name]
- **简介**: ...
- **适用场景**: ...
- **优势**: ...
- **局限**: ...

### 方法 2: [Name]
...

## 2 数据需求

| 数据类型 | 来源 | 时间范围 | 备注 |
|---------|------|---------|------|
| ... | ... | ... | ... |

## 3 技术路线图

[Flowchart description]

## 4 预期输出
- ...
```

## Notes

- Not supporting custom methods yet (future feature)
- Not supporting water quality evaluation (requires standards)
- Store selected methodology in project memory
