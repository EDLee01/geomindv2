# Skill Creator (Meta Skill)

## Purpose
Guide the creation of new skills for GeoMind's self-evolution capability.

## When to Create New Skills

1. **Repeated Patterns**: Same type of task requested multiple times
2. **Domain Expansion**: New research area not well covered
3. **Method Addition**: New analysis method becomes common
4. **User Feedback**: Users request specific capabilities

## Skill Template

```markdown
# [Skill Name] Skill ([Do/Critic] Agent)

## Purpose
[One sentence description of what this skill does]

## Input
- [Required input 1]
- [Required input 2]
- [Optional input (optional)]

## Process

### 1. [Step 1 Name]
[Description]

```python
# Example code if applicable
def step_1_function():
    pass
```

### 2. [Step 2 Name]
[Description]

### 3. [Step 3 Name]
[Description]

## Output Format

```markdown
# [Output Title]

## Section 1
[Template]

## Section 2
[Template]
```

## Quality Criteria
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

## Examples

### Example Input
[Example]

### Example Output
[Example]

## Notes
- [Important note 1]
- [Important note 2]
```

## Skill Categories

### Do Agent Skills
Located in: `/skills/do/`

| Category | Purpose | Examples |
|----------|---------|----------|
| Search | Find information | literature_search |
| Analysis | Process data | statistical_analysis, timeseries_analysis |
| Writing | Generate text | results_writing, discussion_writing |
| Utility | Support tasks | translation, reference_format |

### Critic Agent Skills
Located in: `/skills/critic/`

| Category | Purpose | Examples |
|----------|---------|----------|
| Verification | Check correctness | verify_literature, verify_data |
| Validation | Ensure quality | verify_calculation, verify_report |

## Skill Naming Convention

- Use snake_case: `literature_search.md`
- Be descriptive: `timeseries_analysis.md` not `ts.md`
- Indicate action: `verify_`, `generate_`, `analyze_`

## Quality Requirements

1. **Completeness**: Cover all aspects of the task
2. **Code Examples**: Include working Python code
3. **Output Template**: Show expected output format
4. **Error Handling**: Document edge cases
5. **Domain Knowledge**: Include relevant domain expertise

## Self-Evolution Process

```
1. Detect skill gap
   └── User asks for unsupported analysis
   └── Task fails due to missing knowledge

2. Analyze requirement
   └── What is the task?
   └── What knowledge is needed?
   └── What code is required?

3. Create skill draft
   └── Follow template
   └── Include examples
   └── Add quality criteria

4. Validate skill
   └── Test with sample inputs
   └── Check output quality
   └── Verify code works

5. Deploy skill
   └── Save to appropriate directory
   └── Update skill index
   └── Log creation
```

## Skill Index Update

When creating a new skill, update `/skills/index.json`:

```json
{
  "do": {
    "literature_search": {
      "triggers": ["文献", "论文", "paper", "literature"],
      "description": "Search and retrieve academic papers"
    },
    "new_skill_name": {
      "triggers": ["trigger1", "trigger2"],
      "description": "Description of new skill"
    }
  },
  "critic": {
    "verify_literature": {
      "triggers": ["verify", "check", "validate"],
      "description": "Verify DOI and paper existence"
    }
  }
}
```

## Maintenance

- Review skills quarterly
- Update outdated code examples
- Add new domain knowledge
- Improve based on user feedback
