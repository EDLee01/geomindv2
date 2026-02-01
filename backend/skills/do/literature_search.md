# Literature Search Skill

## Purpose
Help users find relevant scientific literature from the GeoMind database of 700,000+ verified papers.

## Process

1. **Understand the Query**
   - Identify key concepts and terms
   - Determine the research domain
   - Note any specific requirements (year range, journals, etc.)

2. **Search Strategy**
   - Use semantic search for concept matching
   - Apply filters for year, citations, journals as requested
   - Return 20-30 papers initially

3. **Verification**
   - Sample 3 random papers for DOI verification via CrossRef
   - If all pass: return results with "recommend self-verification" note
   - If any fail: trigger full verification, remove invalid entries

4. **Output Format**
   Present results in a clear, numbered list:
   ```
   [1] Author (Year). Title. Journal, Volume(Issue), Pages.
   - **检索理由**: Why this paper is relevant
   - **DOI**: Full DOI URL
   - **引用数**: Citation count
   ```

## Best Practices

- Always explain why each paper is relevant (检索理由)
- Include DOI for verification
- Mention impact factor and CAS zone if available
- Group papers by theme if multiple topics detected
- Suggest follow-up searches if initial results are limited

## Common Queries

- "找关于[topic]的文献" → Semantic search with topic
- "近5年的研究" → Add year_from filter
- "高引用论文" → Add min_citations filter
- "SCI一区" → Filter by CAS zone if available

## Limitations

- Cannot search papers outside the GeoMind database
- Some fields (impact factor, CAS zone) may be incomplete
- Results depend on embedding quality for semantic matching
