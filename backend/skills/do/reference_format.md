# Reference Format Skill (Do Agent)

## Purpose
Organize and format references for the final manuscript.

## Default Format

**APA 7th Edition**

### Journal Article
```
Author, A. A., Author, B. B., & Author, C. C. (Year). Title of article.
Title of Periodical, volume(issue), page–page. https://doi.org/xxxxx
```

### Book
```
Author, A. A. (Year). Title of work: Capital letter also for subtitle.
Publisher. https://doi.org/xxxxx
```

### Book Chapter
```
Author, A. A. (Year). Title of chapter. In E. E. Editor (Ed.), Title of
book (pp. xx–xx). Publisher. https://doi.org/xxxxx
```

## Output Formats

### 1. Markdown References
```markdown
## References

[1] Zhang, W., Li, H., & Wang, Y. (2023). LSTM-based dissolved oxygen
prediction in urban rivers. *Water Research*, 45(2), 123–135.
https://doi.org/10.1016/j.watres.2023.xxx

[2] Wang, L., Chen, X., Liu, J., & Zhou, M. (2022). Machine learning
approaches for water quality forecasting: A comprehensive review.
*Journal of Hydrology*, 589, 125–140.
https://doi.org/10.1016/j.jhydrol.2022.xxx
```

### 2. BibTeX Export
```bibtex
@article{zhang2023lstm,
  title={LSTM-based dissolved oxygen prediction in urban rivers},
  author={Zhang, Wei and Li, Hua and Wang, Yang},
  journal={Water Research},
  volume={45},
  number={2},
  pages={123--135},
  year={2023},
  doi={10.1016/j.watres.2023.xxx}
}

@article{wang2022machine,
  title={Machine learning approaches for water quality forecasting},
  author={Wang, Lei and Chen, Xiao and Liu, Jun and Zhou, Ming},
  journal={Journal of Hydrology},
  volume={589},
  pages={125--140},
  year={2022},
  doi={10.1016/j.jhydrol.2022.xxx}
}
```

### 3. RIS Export
```ris
TY  - JOUR
AU  - Zhang, Wei
AU  - Li, Hua
AU  - Wang, Yang
TI  - LSTM-based dissolved oxygen prediction in urban rivers
JO  - Water Research
VL  - 45
IS  - 2
SP  - 123
EP  - 135
PY  - 2023
DO  - 10.1016/j.watres.2023.xxx
ER  -
```

## Deduplication Logic

### Same DOI
- Merge entries
- Keep the one with more complete information

### Similar Titles (>90% similarity)
- Flag for user confirmation
- Display both entries for comparison

### Unused References
- Scan manuscript for citations
- List references not cited
- Prompt user to confirm deletion

## Process

```
1. Read all references from:
   - literature_list (from memory)
   - Supplementary citations added during writing

2. Verify each reference:
   - Check DOI exists
   - Verify metadata matches

3. Check for duplicates:
   - Same DOI → auto-merge
   - Similar title → flag for user

4. Cross-reference with manuscript:
   - Find all [X] citations
   - Mark unused references

5. Generate output:
   - Markdown for manuscript
   - BibTeX for LaTeX users
   - RIS for reference managers
```

## Quality Checks

- All DOIs verified via CrossRef
- Citation numbers match in-text references
- Consistent formatting throughout
- Complete author lists (not truncated incorrectly)
- Proper title capitalization
