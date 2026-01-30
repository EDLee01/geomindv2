# Calculation Verification Skill (Critic Agent)

## Purpose
Verify the correctness and reasonableness of analysis results.

## Verification Areas

### 1. Statistical Results

```python
def verify_correlation(r, n, p):
    """Verify correlation coefficient and p-value."""
    issues = []

    # Check r is in valid range
    if not -1 <= r <= 1:
        issues.append("Correlation coefficient out of range [-1, 1]")

    # Verify p-value calculation
    from scipy import stats
    t_stat = r * np.sqrt((n - 2) / (1 - r**2))
    expected_p = 2 * stats.t.sf(abs(t_stat), n - 2)

    if abs(p - expected_p) > 0.001:
        issues.append(f"P-value mismatch: reported {p}, calculated {expected_p:.4f}")

    return issues
```

### 2. Model Metrics

```python
def verify_r2(y_true, y_pred, reported_r2):
    """Verify R² calculation."""
    from sklearn.metrics import r2_score
    calculated_r2 = r2_score(y_true, y_pred)

    if abs(reported_r2 - calculated_r2) > 0.01:
        return f"R² mismatch: reported {reported_r2}, calculated {calculated_r2:.3f}"
    return None
```

### 3. Reasonableness Checks

**Water Quality Domain Knowledge:**

| Metric | Reasonable Range | Flag If |
|--------|------------------|---------|
| DO prediction R² | 0.6 - 0.95 | > 0.99 (overfitting) or < 0.5 |
| Temperature correlation with DO | -0.9 to -0.5 | Positive correlation |
| RMSE for DO | 0.3 - 2.0 mg/L | < 0.1 (suspicious) |
| CV for water quality | 10-50% | > 100% (check data) |

```python
def check_reasonableness(metric, value, domain='water_quality'):
    """Check if result is within reasonable bounds."""
    BOUNDS = {
        'water_quality': {
            'r2': (0.5, 0.99),
            'rmse_do': (0.3, 2.0),
            'correlation_temp_do': (-0.9, -0.3),
        }
    }

    bounds = BOUNDS.get(domain, {})
    if metric in bounds:
        min_val, max_val = bounds[metric]
        if value < min_val or value > max_val:
            return f"Warning: {metric}={value} outside expected range [{min_val}, {max_val}]"
    return None
```

### 4. Reproducibility Check

```python
def verify_reproducibility(code, expected_output):
    """Re-run analysis code and compare results."""
    # Execute code
    actual_output = execute_code(code)

    # Compare key metrics
    discrepancies = []
    for key in expected_output:
        if key in actual_output:
            if abs(expected_output[key] - actual_output[key]) > 0.001:
                discrepancies.append({
                    'metric': key,
                    'expected': expected_output[key],
                    'actual': actual_output[key]
                })

    return discrepancies
```

### 5. Consistency Check

```python
def check_consistency(results_data):
    """Check internal consistency of results."""
    issues = []

    # R² should equal 1 - (SS_res / SS_tot)
    if 'r2' in results_data and 'ss_res' in results_data and 'ss_tot' in results_data:
        calculated_r2 = 1 - results_data['ss_res'] / results_data['ss_tot']
        if abs(results_data['r2'] - calculated_r2) > 0.01:
            issues.append("R² inconsistent with SS values")

    # Sum of explained variance should equal total
    # ... other consistency checks

    return issues
```

## Verification Report

```markdown
# 计算验证报告

## 1 统计检验验证

| 指标 | 报告值 | 验算值 | 状态 |
|------|--------|--------|------|
| Pearson r | 0.85 | 0.85 | ✓ |
| p-value | 0.001 | 0.0012 | ✓ |
| R² | 0.89 | 0.89 | ✓ |

## 2 合理性检验

| 指标 | 值 | 预期范围 | 状态 |
|------|-----|----------|------|
| 预测 R² | 0.89 | 0.5-0.99 | ✓ |
| RMSE | 0.45 | 0.3-2.0 | ✓ |
| 温度-DO 相关 | -0.72 | -0.9 to -0.3 | ✓ |

## 3 可复现性检验

代码执行结果与报告一致 ✓

## 4 一致性检验

所有指标内部一致 ✓

## 5 验证结论

✅ 所有计算验证通过
```

## Red Flags

| Warning Sign | Possible Issue |
|--------------|----------------|
| R² > 0.99 | Overfitting or data leakage |
| R² increases with more complex model | May not generalize |
| Training >> Test performance | Overfitting |
| Perfect correlation (r = 1.0) | Data error or circular reference |
| Impossible values | Calculation error |
