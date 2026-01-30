# Literature Verification Skill (Critic Agent)

## Purpose
Verify the validity of literature references to prevent citation of non-existent papers.

## Verification Strategy

### Sampling Approach
1. For search results with >3 papers:
   - Randomly sample 3 DOIs
   - Verify via CrossRef API
   - If 3/3 pass → Return results with verification note
   - If any fail → Full verification + remove invalid

2. For ≤3 papers:
   - Verify all DOIs

### CrossRef API
```python
async def verify_doi(doi: str) -> bool:
    url = f"https://api.crossref.org/works/{doi}"
    response = await httpx.get(url, timeout=10)
    return response.status_code == 200
```

## Verification Process

1. **Extract DOI**
   - Handle full URLs: `https://doi.org/10.1016/xxx`
   - Handle DOI only: `10.1016/xxx`

2. **API Call**
   - Respect rate limits
   - Timeout: 10 seconds per DOI
   - Retry once on failure

3. **Validate Response**
   - Check title matches (fuzzy match acceptable)
   - Check year is plausible
   - Check author names present

## Output

### Verification Passed
```
✓ 文献验证完成
- 已验证: 25/25 篇
- 建议: 重要引用请自行复核 DOI
```

### Verification Found Issues
```
⚠️ 文献验证发现问题
- 已移除: 3 篇无效文献
- 剩余: 22 篇已验证

移除的文献:
1. [Title] - DOI 不存在
2. [Title] - 信息不匹配
```

## Quality Checks

Beyond DOI existence:
- Title should roughly match database entry
- Year should be within ±1 year tolerance
- At least one author name should match

## Limitations

- CrossRef may not have all DOIs (especially older papers)
- Some publishers may block requests
- Chinese papers may have incomplete CrossRef records

## Recommendations to User

- Always spot-check a few DOIs manually
- Download full PDFs for key references
- Use institutional library resources for verification
