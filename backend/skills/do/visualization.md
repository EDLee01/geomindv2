# Visualization Skill

## Purpose
Generate publication-quality figures and tables for scientific papers.

## Figure Standards

### Resolution
- DPI: 300 (required for journals)
- Format: PNG (default), PDF for vector graphics

### Fonts
- Ask user preference before generating
- **中文**: SimHei (黑体)
- **English**: Times New Roman or Arial
- Size: 10pt minimum for readability

### Color Schemes
- Default: Academic style (muted colors)
- Nature-style: Clean, professional
- Avoid: Jet/rainbow colormap for continuous data

## Common Figure Types

### 1. Time Series
```python
fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(dates, values, 'b-', linewidth=1.5)
ax.set_xlabel('Time')
ax.set_ylabel('Variable (unit)')
ax.grid(True, alpha=0.3)
```

### 2. Spatial Distribution (Heatmap)
```python
fig, ax = plt.subplots(figsize=(10, 8))
im = ax.contourf(X, Y, Z, levels=20, cmap='viridis')
plt.colorbar(im, label='Variable (unit)')
```

### 3. Scatter with Regression
```python
fig, ax = plt.subplots(figsize=(8, 8))
ax.scatter(x, y, alpha=0.5)
ax.plot(x, fitted, 'r-', label=f'R² = {r2:.3f}')
ax.legend()
```

### 4. Box Plot Comparison
```python
fig, ax = plt.subplots(figsize=(10, 6))
ax.boxplot(data, labels=groups)
ax.set_ylabel('Variable (unit)')
```

## Table Standards

### Three-line Table Format
```markdown
**表 X [Title]**

| Column 1 | Column 2 | Column 3 |
|:--------:|:--------:|:--------:|
| data | data | data |
```

- Use center alignment for numbers
- Include units in headers
- Round to appropriate significant figures

## Process

1. Ask user for:
   - Figure type needed
   - Font preference (中文/English)
   - Any specific styling requirements

2. Generate code
3. Execute and display figure
4. Offer adjustments if needed

## Output

- Figures saved as PNG at 300 DPI
- Code provided for reproducibility
- Tables in Markdown format

## Package as ZIP

When user requests all figures:
```
figure_scripts.zip
├── figure_1.png
├── figure_2.png
├── table_1.md
└── all_code.py
```
