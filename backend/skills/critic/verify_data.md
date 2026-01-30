# Data Verification Skill (Critic Agent)

## Purpose
Verify data quality and identify potential issues before analysis.

## Verification Checklist

### 1. Completeness Check

```python
def check_completeness(df):
    """Check for missing values."""
    missing = df.isnull().sum()
    missing_pct = (missing / len(df)) * 100

    issues = []
    for col, pct in missing_pct.items():
        if pct > 0:
            issues.append({
                'column': col,
                'missing_count': missing[col],
                'missing_percent': pct,
                'severity': 'high' if pct > 20 else 'medium' if pct > 5 else 'low'
            })
    return issues
```

### 2. Outlier Detection

```python
def detect_outliers(df, columns, method='iqr'):
    """Detect outliers using IQR or Z-score method."""
    outliers = {}

    for col in columns:
        if method == 'iqr':
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR
            mask = (df[col] < lower) | (df[col] > upper)
        else:  # z-score
            z = np.abs((df[col] - df[col].mean()) / df[col].std())
            mask = z > 3

        outliers[col] = {
            'count': mask.sum(),
            'indices': df[mask].index.tolist(),
            'values': df[mask][col].tolist()
        }
    return outliers
```

### 3. Data Type Validation

```python
def validate_types(df, expected_types):
    """Validate column data types."""
    issues = []
    for col, expected in expected_types.items():
        actual = df[col].dtype
        if not np.issubdtype(actual, expected):
            issues.append({
                'column': col,
                'expected': str(expected),
                'actual': str(actual)
            })
    return issues
```

### 4. Range Validation

```python
# Expected ranges for water quality parameters
EXPECTED_RANGES = {
    'DO': (0, 20),        # mg/L
    'pH': (0, 14),        # dimensionless
    'Temperature': (-5, 45),  # °C
    'COD': (0, 1000),     # mg/L
    'NH3-N': (0, 100),    # mg/L
    'TN': (0, 200),       # mg/L
    'TP': (0, 50),        # mg/L
    'Conductivity': (0, 10000),  # μS/cm
}

def validate_ranges(df, ranges=EXPECTED_RANGES):
    """Check if values are within expected ranges."""
    issues = []
    for col, (min_val, max_val) in ranges.items():
        if col in df.columns:
            below = df[df[col] < min_val]
            above = df[df[col] > max_val]
            if len(below) > 0 or len(above) > 0:
                issues.append({
                    'column': col,
                    'below_range': len(below),
                    'above_range': len(above),
                    'expected': f'{min_val} - {max_val}'
                })
    return issues
```

### 5. Temporal Consistency

```python
def check_temporal_consistency(df, date_col):
    """Check for temporal data issues."""
    issues = []

    # Check for duplicates
    duplicates = df[df.duplicated(subset=[date_col])]
    if len(duplicates) > 0:
        issues.append({
            'type': 'duplicate_dates',
            'count': len(duplicates)
        })

    # Check for gaps
    dates = pd.to_datetime(df[date_col])
    expected_freq = pd.infer_freq(dates)
    gaps = dates.diff().dropna()
    # ... gap detection logic

    return issues
```

## Output Report

```markdown
# 数据验证报告

## 1 数据概况
- 文件名: water_quality.xlsx
- 数据量: 432 行 × 15 列
- 时间范围: 2021-01 至 2023-12

## 2 问题检测

### 2.1 缺失值
| 列名 | 缺失数 | 缺失率 | 严重程度 |
|------|--------|--------|----------|
| DO | 10 | 2.3% | 低 ⚠️ |
| NH3-N | 45 | 10.4% | 中 ⚠️ |

### 2.2 异常值 (IQR 方法)
| 列名 | 异常数 | 异常值范围 |
|------|--------|------------|
| DO | 3 | 15.2, 16.8, 17.1 |

### 2.3 范围超限
| 列名 | 预期范围 | 超限数 |
|------|----------|--------|
| pH | 0-14 | 2 (值: 14.5, -0.3) |

## 3 处理建议

1. **DO 缺失值**: 建议删除或使用均值插补
2. **NH3-N 缺失**: 缺失率较高，建议检查数据来源
3. **pH 异常**: 可能为记录错误，建议核实原始数据

## 4 验证状态

✓ 数据类型正确
✓ 时间序列连续
⚠️ 存在缺失值需处理
⚠️ 存在异常值需核实
```

## Severity Levels

| Level | Criteria | Action |
|-------|----------|--------|
| 🔴 Critical | >20% missing OR data corruption | Cannot proceed |
| 🟡 High | 5-20% missing OR many outliers | Requires attention |
| 🟢 Low | <5% missing, few outliers | Proceed with caution |
