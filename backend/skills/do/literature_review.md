# Literature Review Skill (Do Agent)

## Purpose
Generate comprehensive literature review reports based on selected papers.

## Input
- Selected literature list from memory (literature_list)
- User's research direction/topic

## Output Format

```markdown
# 文献调研报告

## 1 研究背景
[Background description with citations]

## 2 研究现状

### 2.1 [Theme 1]
[Content with citations like [1][3]]

### 2.2 [Theme 2]
[Content with citations]

### 2.3 [Theme 3]
[Content with citations]

## 3 研究不足
1. [Gap 1]
2. [Gap 2]
3. [Gap 3]

## 参考文献
[1] Author et al. (Year). Title. Journal.
...
```

## Process

1. **Organize by Theme**
   - Group papers by research theme/method
   - Identify main research directions
   - Note temporal development trends

2. **Extract Key Points**
   - Main findings from each paper
   - Methods used
   - Limitations acknowledged

3. **Synthesize**
   - Connect findings across papers
   - Identify consensus and debates
   - Highlight research gaps

4. **Citation Format**
   - Use numbered citations [1][2]
   - Full reference list at end
   - Include DOI for verification

## Quality Criteria

- All claims supported by citations
- Logical flow between sections
- Clear identification of gaps
- Balanced coverage of themes
- Proper citation of all sources

## Notes

- One-time generation (no online editing)
- Output as Artifact (literature_review.md)
- User can request regeneration with feedback
