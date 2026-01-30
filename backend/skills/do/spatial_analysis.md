# Spatial Analysis Skill (Do Agent)

## Purpose
Perform spatial analysis including interpolation, autocorrelation, and hot spot analysis.

## Supported Methods

### 1. Kriging Interpolation
```python
from pykrige.ok import OrdinaryKriging
import numpy as np

def kriging_interpolation(x, y, z, grid_x, grid_y, variogram_model='linear'):
    """
    Perform Ordinary Kriging interpolation.

    Args:
        x, y: Coordinates of sample points
        z: Values at sample points
        grid_x, grid_y: Grid coordinates for interpolation
        variogram_model: 'linear', 'power', 'gaussian', 'spherical', 'exponential'
    """
    OK = OrdinaryKriging(
        x, y, z,
        variogram_model=variogram_model,
        verbose=False,
        enable_plotting=False
    )

    z_pred, ss_pred = OK.execute('grid', grid_x, grid_y)

    return {
        'z_interpolated': z_pred,
        'variance': ss_pred,
        'variogram_params': OK.variogram_model_parameters
    }
```

### 2. IDW Interpolation
```python
def idw_interpolation(x, y, z, grid_x, grid_y, power=2):
    """
    Inverse Distance Weighting interpolation.
    """
    from scipy.interpolate import Rbf

    # Create meshgrid
    XI, YI = np.meshgrid(grid_x, grid_y)

    # RBF with inverse multiquadric as IDW approximation
    rbf = Rbf(x, y, z, function='inverse', smooth=0)
    ZI = rbf(XI, YI)

    return ZI
```

### 3. Spatial Autocorrelation (Moran's I)
```python
from pysal.lib import weights
from pysal.explore import esda

def morans_i(values, coordinates):
    """
    Calculate Global Moran's I for spatial autocorrelation.
    """
    # Create spatial weights matrix
    w = weights.KNN.from_array(coordinates, k=8)
    w.transform = 'r'

    # Calculate Moran's I
    mi = esda.Moran(values, w)

    return {
        'I': mi.I,
        'p_value': mi.p_sim,
        'z_score': mi.z_sim,
        'interpretation': 'clustered' if mi.I > 0 and mi.p_sim < 0.05 else 'dispersed' if mi.I < 0 and mi.p_sim < 0.05 else 'random'
    }
```

### 4. Hot Spot Analysis (Getis-Ord Gi*)
```python
def hotspot_analysis(values, coordinates):
    """
    Getis-Ord Gi* hot spot analysis.
    """
    w = weights.KNN.from_array(coordinates, k=8)
    w.transform = 'b'

    # Calculate Gi*
    g = esda.G_Local(values, w, star=True)

    # Classify hot/cold spots
    hot_spots = g.Zs > 1.96  # 95% confidence
    cold_spots = g.Zs < -1.96

    return {
        'z_scores': g.Zs,
        'p_values': g.p_sim,
        'hot_spots': hot_spots,
        'cold_spots': cold_spots
    }
```

### 5. Geographically Weighted Regression
```python
from mgwr.gwr import GWR
from mgwr.sel_bw import Sel_BW

def gwr_analysis(y, X, coordinates):
    """
    Geographically Weighted Regression.
    """
    # Select bandwidth
    selector = Sel_BW(coordinates, y, X)
    bw = selector.search()

    # Fit GWR
    model = GWR(coordinates, y, X, bw)
    results = model.fit()

    return {
        'bandwidth': bw,
        'r2': results.R2,
        'local_r2': results.localR2,
        'coefficients': results.params,
        'tvalues': results.tvalues
    }
```

## Output Format

```markdown
# 空间分析结果

## 1 空间插值

[Interpolation map figure]

插值方法: Ordinary Kriging
变异函数模型: Spherical
交叉验证 RMSE: 0.45

## 2 空间自相关

全局 Moran's I = 0.65 (p < 0.001)
结论: 存在显著空间聚集

## 3 热点分析

[Hot spot map figure]

- 热点区域: 上游河段 (Z > 1.96)
- 冷点区域: 下游河段 (Z < -1.96)
```

## Data Requirements
- Coordinate reference system (CRS) should be specified
- Prefer projected coordinates for distance calculations
- Minimum 30 sample points for reliable Kriging
