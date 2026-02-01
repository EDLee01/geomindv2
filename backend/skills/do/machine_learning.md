# Machine Learning Skill (Do Agent)

## Purpose
Apply machine learning methods for classification, regression, and prediction tasks.

## Supported Methods

### 1. Random Forest
```python
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score

def random_forest_regression(X, y, n_estimators=100, test_size=0.2):
    """
    Random Forest for regression with feature importance.
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=n_estimators,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Predictions
    y_pred = model.predict(X_test)

    # Feature importance
    importance = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)

    return {
        'model': model,
        'r2_train': model.score(X_train, y_train),
        'r2_test': r2_score(y_test, y_pred),
        'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
        'feature_importance': importance
    }
```

### 2. XGBoost
```python
import xgboost as xgb
from sklearn.model_selection import GridSearchCV

def xgboost_regression(X, y, params=None):
    """
    XGBoost regression with hyperparameter tuning.
    """
    if params is None:
        params = {
            'max_depth': [3, 5, 7],
            'learning_rate': [0.01, 0.1, 0.3],
            'n_estimators': [100, 200]
        }

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = xgb.XGBRegressor(random_state=42)

    # Grid search
    grid_search = GridSearchCV(
        model, params, cv=5, scoring='r2', n_jobs=-1
    )
    grid_search.fit(X_train, y_train)

    best_model = grid_search.best_estimator_
    y_pred = best_model.predict(X_test)

    return {
        'model': best_model,
        'best_params': grid_search.best_params_,
        'r2_test': r2_score(y_test, y_pred),
        'rmse': np.sqrt(mean_squared_error(y_test, y_pred))
    }
```

### 3. Support Vector Machine
```python
from sklearn.svm import SVR, SVC
from sklearn.preprocessing import StandardScaler

def svm_regression(X, y, kernel='rbf'):
    """
    SVM for regression.
    """
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    model = SVR(kernel=kernel)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    return {
        'model': model,
        'scaler': scaler,
        'r2_test': r2_score(y_test, y_pred),
        'rmse': np.sqrt(mean_squared_error(y_test, y_pred))
    }
```

### 4. Neural Network (MLP)
```python
from sklearn.neural_network import MLPRegressor

def mlp_regression(X, y, hidden_layers=(100, 50)):
    """
    Multi-layer Perceptron regression.
    """
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    model = MLPRegressor(
        hidden_layer_sizes=hidden_layers,
        max_iter=1000,
        random_state=42
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    return {
        'model': model,
        'scaler': scaler,
        'r2_test': r2_score(y_test, y_pred),
        'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
        'loss_curve': model.loss_curve_
    }
```

## Output Format

```markdown
# 机器学习分析结果

## 1 模型选择

| 模型 | R² (训练) | R² (测试) | RMSE |
|------|-----------|-----------|------|
| Random Forest | 0.95 | 0.87 | 0.45 |
| XGBoost | 0.93 | 0.89 | 0.42 |
| SVM | 0.88 | 0.85 | 0.52 |

最优模型: XGBoost

## 2 特征重要性

[Feature importance bar chart]

Top 5 重要特征:
1. Temperature (25.3%)
2. pH (18.7%)
3. ...

## 3 模型验证

[Scatter plot: predicted vs actual]

交叉验证结果: R² = 0.86 ± 0.03

## 4 可解释性

[SHAP values plot - if applicable]
```

## Best Practices
- Always scale features for SVM and Neural Networks
- Use cross-validation for model selection
- Report both training and test metrics
- Consider model interpretability requirements
