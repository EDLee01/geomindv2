"""
Skills Service
Loads and manages SKILL.md knowledge files for the agents
"""
import os
from typing import Optional, List, Dict
from pathlib import Path


# Skills directory path
SKILLS_DIR = Path(__file__).parent.parent.parent / "skills"


# Skill metadata registry
SKILLS_REGISTRY = {
    # Do Agent Skills
    "literature_search": {
        "path": "do/literature_search.md",
        "description": "Search and retrieve scientific literature",
        "trigger_keywords": ["文献", "paper", "literature", "搜索", "检索"]
    },
    "literature_review": {
        "path": "do/literature_review.md",
        "description": "Generate literature review report",
        "trigger_keywords": ["综述", "review", "调研报告"]
    },
    "gap_analysis": {
        "path": "do/gap_analysis.md",
        "description": "Identify research gaps",
        "trigger_keywords": ["gap", "空白", "创新点"]
    },
    "methodology_design": {
        "path": "do/methodology_design.md",
        "description": "Design research methodology",
        "trigger_keywords": ["方案", "methodology", "方法", "技术路线"]
    },
    "data_preprocess": {
        "path": "do/data_preprocess.md",
        "description": "Data preprocessing and cleaning",
        "trigger_keywords": ["数据处理", "预处理", "清洗", "preprocess"]
    },
    "statistical_analysis": {
        "path": "do/statistical_analysis.md",
        "description": "Statistical analysis methods",
        "trigger_keywords": ["统计", "相关性", "regression", "ANOVA"]
    },
    "timeseries_analysis": {
        "path": "do/timeseries_analysis.md",
        "description": "Time series analysis",
        "trigger_keywords": ["时序", "趋势", "Mann-Kendall", "小波"]
    },
    "spatial_analysis": {
        "path": "do/spatial_analysis.md",
        "description": "Spatial analysis methods",
        "trigger_keywords": ["空间", "插值", "Kriging", "GIS"]
    },
    "machine_learning": {
        "path": "do/machine_learning.md",
        "description": "Machine learning methods",
        "trigger_keywords": ["机器学习", "ML", "LSTM", "随机森林", "XGBoost"]
    },
    "visualization": {
        "path": "do/visualization.md",
        "description": "Generate figures and plots",
        "trigger_keywords": ["图", "可视化", "plot", "figure", "画"]
    },
    "results_writing": {
        "path": "do/results_writing.md",
        "description": "Write Results section",
        "trigger_keywords": ["results", "结果", "写结果"]
    },
    "discussion_writing": {
        "path": "do/discussion_writing.md",
        "description": "Write Discussion section",
        "trigger_keywords": ["discussion", "讨论", "写讨论"]
    },
    "reference_format": {
        "path": "do/reference_format.md",
        "description": "Format references",
        "trigger_keywords": ["参考文献", "references", "BibTeX", "引用"]
    },
    "translation": {
        "path": "do/translation.md",
        "description": "Translation and polishing",
        "trigger_keywords": ["翻译", "translate", "润色", "polish"]
    },
    # Critic Agent Skills
    "verify_literature": {
        "path": "critic/verify_literature.md",
        "description": "Verify literature DOIs",
        "trigger_keywords": ["验证", "verify", "DOI"]
    },
    "verify_data": {
        "path": "critic/verify_data.md",
        "description": "Verify data quality",
        "trigger_keywords": ["数据验证", "data quality"]
    },
    "verify_calculation": {
        "path": "critic/verify_calculation.md",
        "description": "Verify calculations",
        "trigger_keywords": ["计算验证", "verify calculation"]
    },
    "verify_report": {
        "path": "critic/verify_report.md",
        "description": "Verify report quality",
        "trigger_keywords": ["报告验证", "审核"]
    }
}


def get_skill_content(skill_name: str) -> Optional[str]:
    """
    Load skill content from SKILL.md file.

    Args:
        skill_name: Name of the skill to load

    Returns:
        Skill content as string, or None if not found
    """
    if skill_name not in SKILLS_REGISTRY:
        return None

    skill_path = SKILLS_DIR / SKILLS_REGISTRY[skill_name]["path"]

    if not skill_path.exists():
        return None

    try:
        with open(skill_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception:
        return None


def get_skill_prompt(skills: List[str]) -> str:
    """
    Build system prompt addition from requested skills.

    Args:
        skills: List of skill names to activate

    Returns:
        Combined skill content as prompt string
    """
    if not skills:
        return ""

    prompt_parts = ["\n\n## Active Skills\n"]

    for skill_name in skills:
        content = get_skill_content(skill_name)
        if content:
            prompt_parts.append(f"\n### {skill_name}\n{content}\n")

    return "".join(prompt_parts)


def detect_skills_from_content(content: str) -> List[str]:
    """
    Auto-detect relevant skills from message content.

    Args:
        content: User message content

    Returns:
        List of detected skill names
    """
    content_lower = content.lower()
    detected = []

    for skill_name, skill_info in SKILLS_REGISTRY.items():
        for keyword in skill_info.get("trigger_keywords", []):
            if keyword.lower() in content_lower:
                detected.append(skill_name)
                break

    return detected


def list_available_skills() -> Dict[str, str]:
    """
    List all available skills with descriptions.

    Returns:
        Dict of skill_name -> description
    """
    return {
        name: info["description"]
        for name, info in SKILLS_REGISTRY.items()
    }
