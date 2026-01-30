# Statistical Analysis Skill (Do Agent)

## Purpose
Perform statistical analysis on user data with proper methodology.

## Supported Methods

### 1. Descriptive Statistics
```python
import pandas as pd
import numpy as np

def descriptive_stats(df, columns=None):
    """Calculate descriptive statistics."""
    if columns is None:
        columns = df.select_dtypes(include=[np.number]).columns

    stats = df[columns].describe()
    stats.loc['skewness'] = df[columns].skew()
    stats.loc['kurtosis'] = df[columns].kurtosis()
    stats.loc['cv'] = df[columns].std() / df[columns].mean() * 100
    return stats
```

### 2. Correlation Analysis
```python
import seaborn as sns
import matplotlib.pyplot as plt

def correlation_analysis(df, method='pearson'):
    """Compute correlation matrix."""
    # Pearson, Spearman, or Kendall
    corr = df.corr(method=method)

    # Heatmap
    plt.figure(figsize=(10, 8))
    sns.heatmap(corr, annot=True, cmap='RdBu_r', center=0)
    plt.title(f'{method.capitalize()} Correlation Matrix')
    plt.tight_layout()
    return corr
```

### 3. Regression Analysis
```python
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error

def linear_regression(X, y):
    """Perform linear regression."""
    model = LinearRegression()
    model.fit(X, y)

    y_pred = model.predict(X)
    r2 = r2_score(y, y_pred)
    rmse = np.sqrt(mean_squared_error(y, y_pred))

    return {
        'coefficients': model.coef_,
        'intercept': model.intercept_,
        'r2': r2,
        'rmse': rmse
    }
```

### 4. ANOVA
```python
from scipy import stats

def one_way_anova(groups):
    """Perform one-way ANOVA."""
    f_stat, p_value = stats.f_oneway(*groups)
    return {'F': f_stat, 'p': p_value}
```

### 5. Principal Component Analysis
```python
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

def pca_analysis(df, n_components=None):
    """Perform PCA."""
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df)

    pca = PCA(n_components=n_components)
    X_pca = pca.fit_transform(X_scaled)

    return {
        'components': pca.components_,
        'explained_variance_ratio': pca.explained_variance_ratio_,
        'cumulative_variance': np.cumsum(pca.explained_variance_ratio_)
    }
```

## Output Format

```markdown
# 统计分析结果

## 1 描述性统计

| 变量 | 均值 | 标准差 | 最小值 | 最大值 | CV (%) |
|------|------|--------|--------|--------|--------|
| ... | ... | ... | ... | ... | ... |

## 2 相关性分析

[Correlation heatmap figure]

显著相关关系 (p < 0.05):
- X1 与 X2: r = 0.85, p < 0.001
- ...

## 3 结论
- ...
```

## Quality Checks
- Check for normality before parametric tests
- Report effect sizes, not just p-values
- Visualize distributions before analysis
- Handle missing values appropriately
