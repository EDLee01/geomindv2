# Time Series Analysis Skill (Do Agent)

## Purpose
Perform time series analysis for trend detection, change point analysis, and forecasting.

## Supported Methods

### 1. Mann-Kendall Trend Test
```python
import pymannkendall as mk

def mann_kendall_test(data):
    """
    Perform Mann-Kendall trend test.
    Returns: trend, p-value, slope (Sen's slope)
    """
    result = mk.original_test(data)
    return {
        'trend': result.trend,  # 'increasing', 'decreasing', 'no trend'
        'p_value': result.p,
        'z_score': result.z,
        'sens_slope': result.slope,
        'intercept': result.intercept
    }
```

### 2. Pettitt Change Point Test
```python
def pettitt_test(data):
    """
    Detect change point in time series.
    """
    n = len(data)
    U = np.zeros(n)

    for t in range(n):
        for j in range(t):
            U[t] += np.sign(data[t] - data[j])

    K = np.max(np.abs(U))
    change_point = np.argmax(np.abs(U))

    # p-value approximation
    p_value = 2 * np.exp(-6 * K**2 / (n**3 + n**2))

    return {
        'change_point': change_point,
        'K_statistic': K,
        'p_value': p_value
    }
```

### 3. Wavelet Analysis
```python
import pywt

def wavelet_analysis(data, wavelet='db4', level=None):
    """
    Perform discrete wavelet decomposition.
    """
    if level is None:
        level = pywt.dwt_max_level(len(data), wavelet)

    coeffs = pywt.wavedec(data, wavelet, level=level)

    # Reconstruct each level
    reconstructed = []
    for i in range(level + 1):
        coeff_list = [np.zeros_like(c) for c in coeffs]
        coeff_list[i] = coeffs[i]
        reconstructed.append(pywt.waverec(coeff_list, wavelet)[:len(data)])

    return {
        'coefficients': coeffs,
        'reconstructed': reconstructed,
        'levels': level
    }
```

### 4. ARIMA Forecasting
```python
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller

def arima_forecast(data, order=(1,1,1), forecast_steps=12):
    """
    ARIMA time series forecasting.
    """
    # Stationarity test
    adf_result = adfuller(data)

    # Fit model
    model = ARIMA(data, order=order)
    fitted = model.fit()

    # Forecast
    forecast = fitted.forecast(steps=forecast_steps)

    return {
        'adf_statistic': adf_result[0],
        'adf_pvalue': adf_result[1],
        'aic': fitted.aic,
        'bic': fitted.bic,
        'forecast': forecast,
        'residuals': fitted.resid
    }
```

### 5. LSTM Prediction
```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

def build_lstm_model(input_shape, units=50):
    """
    Build LSTM model for time series prediction.
    """
    model = Sequential([
        LSTM(units, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(units, return_sequences=False),
        Dropout(0.2),
        Dense(25),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse')
    return model
```

## Output Format

```markdown
# 时序分析结果

## 1 趋势分析 (Mann-Kendall)

| 变量 | 趋势 | Z值 | p值 | Sen斜率 |
|------|------|-----|-----|---------|
| DO | 下降 | -2.45 | 0.014 | -0.05 |

## 2 突变检测 (Pettitt)

检测到突变点: 2018年7月 (p = 0.023)

## 3 多尺度分析 (小波)

[Wavelet decomposition figure]

## 4 预测结果

[Forecast figure with confidence intervals]

未来12期预测值: ...
```

## Best Practices
- Check stationarity before ARIMA
- Use appropriate lag for Mann-Kendall (seasonal data)
- Report confidence intervals for forecasts
- Validate predictions with hold-out data
