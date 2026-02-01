# Report Verification Skill (Critic Agent)

## Purpose
Verify the quality and consistency of generated reports and manuscripts.

## Verification Areas

### 1. Citation Verification

```python
def verify_citations(text, references):
    """Check all citations have corresponding references."""
    import re

    # Find all citations [1], [2], etc.
    citations = set(re.findall(r'\[(\d+)\]', text))

    # Check against reference list
    issues = []
    for cite in citations:
        if int(cite) > len(references) or int(cite) < 1:
            issues.append(f"Citation [{cite}] has no corresponding reference")

    # Check for uncited references
    cited_nums = set(int(c) for c in citations)
    for i in range(1, len(references) + 1):
        if i not in cited_nums:
            issues.append(f"Reference [{i}] is not cited in text")

    return issues
```

### 2. Data Consistency

```python
def verify_data_in_text(text, results_data):
    """Verify data values in text match source data."""
    import re

    issues = []

    # Extract numbers from text
    numbers = re.findall(r'(\d+\.?\d*)\s*(mg/L|%|°C|μS/cm)', text)

    # Cross-reference with results_data
    # ... verification logic

    return issues
```

### 3. Figure/Table References

```python
def verify_figure_table_refs(text, figures, tables):
    """Check figure and table references."""
    import re

    issues = []

    # Find figure references
    fig_refs = set(re.findall(r'(?:Fig\.|Figure)\s*(\d+)', text, re.I))
    for ref in fig_refs:
        if f"figure_{ref}.png" not in figures:
            issues.append(f"Figure {ref} referenced but not found")

    # Find table references
    table_refs = set(re.findall(r'Table\s*(\d+)', text, re.I))
    for ref in table_refs:
        if f"table_{ref}.md" not in tables:
            issues.append(f"Table {ref} referenced but not found")

    return issues
```

### 4. Logical Flow Check

```python
def check_logical_flow(sections):
    """Check manuscript follows logical structure."""
    expected_order = [
        'introduction',
        'methods',
        'results',
        'discussion',
        'conclusion'
    ]

    issues = []
    section_order = list(sections.keys())

    # Check order
    for i, section in enumerate(expected_order):
        if section in sections:
            actual_pos = section_order.index(section)
            if actual_pos != i:
                issues.append(f"{section} appears in wrong position")

    return issues
```

### 5. Terminology Consistency

```python
def check_terminology(text):
    """Check for consistent terminology usage."""
    # Common inconsistencies
    TERM_VARIANTS = {
        'dissolved oxygen': ['DO', 'D.O.', 'dissolved O2'],
        'random forest': ['RF', 'random forests', 'RandomForest'],
        'r squared': ['R²', 'R2', 'R-squared', 'coefficient of determination']
    }

    issues = []
    for standard, variants in TERM_VARIANTS.items():
        used = [v for v in variants if v.lower() in text.lower()]
        if len(used) > 1:
            issues.append(f"Inconsistent terminology: {', '.join(used)} used for {standard}")

    return issues
```

### 6. Language Quality

```python
def check_language(text):
    """Basic language quality checks."""
    issues = []

    # Check for common mistakes
    AVOID_PHRASES = [
        ('very unique', 'unique'),
        ('more better', 'better'),
        ('most optimal', 'optimal'),
        ('close proximity', 'proximity'),
        ('past history', 'history'),
    ]

    for wrong, right in AVOID_PHRASES:
        if wrong.lower() in text.lower():
            issues.append(f"Avoid '{wrong}', use '{right}'")

    # Check sentence length
    sentences = text.split('.')
    long_sentences = [s for s in sentences if len(s.split()) > 40]
    if long_sentences:
        issues.append(f"{len(long_sentences)} sentences exceed 40 words")

    return issues
```

## Verification Report

```markdown
# 报告验证结果

## 1 引用一致性

✓ 所有引用有对应参考文献
✓ 所有参考文献都被引用

## 2 数据一致性

| 位置 | 文中数据 | 源数据 | 状态 |
|------|----------|--------|------|
| 3.1节 | R² = 0.89 | 0.89 | ✓ |
| 3.2节 | 7.85 mg/L | 7.85 | ✓ |

## 3 图表引用

✓ Figure 1-5 均已引用且存在
✓ Table 1-3 均已引用且存在

## 4 逻辑结构

✓ 章节顺序正确
✓ 层次结构合理

## 5 术语一致性

⚠️ 发现术语不一致:
- "DO" 和 "dissolved oxygen" 混用 (建议统一)

## 6 语言质量

✓ 无常见语法错误
⚠️ 3 个句子超过 40 词，建议简化

## 7 验证结论

总体状态: ⚠️ 有轻微问题需修正

建议修改:
1. 统一 DO 术语表达
2. 简化长句子
```

## Quality Score

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Citation accuracy | 25% | 100% | 25% |
| Data consistency | 25% | 100% | 25% |
| Figure/Table refs | 15% | 100% | 15% |
| Logical flow | 15% | 100% | 15% |
| Terminology | 10% | 80% | 8% |
| Language | 10% | 90% | 9% |
| **Total** | 100% | - | **97%** |
