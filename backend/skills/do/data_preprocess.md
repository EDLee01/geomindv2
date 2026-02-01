# Data Preprocessing Skill

## Purpose
Clean, validate, and prepare data for analysis.

## Supported Formats
- Excel (.xlsx, .xls)
- CSV (.csv)
- JSON (.json)
- GeoJSON (.geojson)

## Size Limits
- Maximum: 50MB
- For larger files, recommend local processing

## Automatic Detection

### 1. Data Profile
```python
# Check basic info
df.shape  # rows, columns
df.dtypes  # data types
df.describe()  # statistics
```

### 2. Missing Values
```python
missing = df.isnull().sum()
missing_pct = (missing / len(df)) * 100
```

### 3. Outliers
```python
# IQR method
Q1 = df[col].quantile(0.25)
Q3 = df[col].quantile(0.75)
IQR = Q3 - Q1
outliers = df[(df[col] < Q1 - 1.5*IQR) | (df[col] > Q3 + 1.5*IQR)]
```

### 4. Data Quality
- Duplicate rows
- Inconsistent date formats
- Unit inconsistencies
- Invalid values (negative where shouldn't be)

## Processing Strategies

### Missing Values
- **Default**: Delete rows with missing values
- Alternative: Mean/median imputation
- Advanced: Interpolation for time series
- Always inform user of chosen strategy

### Outliers
- Flag but don't remove by default
- Let user decide on treatment
- Document removal if requested

### Date Handling
- Standardize to ISO format
- Handle timezone if present
- Create derived columns (year, month, season)

## Output: Data Profile Report

```markdown
# 数据概况报告

## 基本信息
- 文件名: [filename]
- 数据量: X 行 × Y 列
- 时间范围: [if applicable]

## 变量概览
| 变量 | 类型 | 缺失率 | 均值 | 标准差 |
|------|------|--------|------|--------|
| ... | ... | ... | ... | ... |

## 数据质量
- ⚠️ [Issue 1]
- ⚠️ [Issue 2]
- ✓ [Quality check passed]

## 处理建议
1. [Suggestion 1]
2. [Suggestion 2]
```

## Communication

Always inform user:
- What issues were found
- What processing was applied
- What alternatives exist
- If manual review is recommended
