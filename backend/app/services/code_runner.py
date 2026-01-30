"""
Code Execution Service
Safely execute Python code and capture outputs/figures
"""
import asyncio
import tempfile
import os
import sys
import base64
from typing import Dict, Any, List, Optional
from pathlib import Path
import subprocess
import json


# Timeout for code execution (seconds)
DEFAULT_TIMEOUT = 30
MAX_TIMEOUT = 120

# Figure DPI setting
FIGURE_DPI = 300

# Setup code injected before user code
SETUP_CODE = '''
import warnings
warnings.filterwarnings('ignore')

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Configure matplotlib for publication quality
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300
plt.rcParams['font.size'] = 10
plt.rcParams['axes.unicode_minus'] = False

# Try to set Chinese fonts
try:
    plt.rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans', 'Arial']
except:
    plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial']

import numpy as np
import pandas as pd

# Set working directory
import os
os.chdir("{workdir}")

'''

# Code to save all figures at the end
SAVE_FIGURES_CODE = '''

# Save all open figures
import matplotlib.pyplot as plt
import os

_fig_dir = "{workdir}"
_figs_saved = []

for _i, _fig_num in enumerate(plt.get_fignums()):
    _fig = plt.figure(_fig_num)
    _fig_path = os.path.join(_fig_dir, f"figure_{_i+1}.png")
    _fig.savefig(_fig_path, dpi=300, bbox_inches='tight', facecolor='white')
    _figs_saved.append(_fig_path)

plt.close('all')

# Output saved figure paths
if _figs_saved:
    print("\\n__FIGURES__:" + ",".join(_figs_saved))
'''


async def execute_code(
    code: str,
    timeout: int = DEFAULT_TIMEOUT,
    data_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Execute Python code in a sandboxed environment.

    Args:
        code: Python code to execute
        timeout: Maximum execution time in seconds
        data_context: Optional data to inject (dataframe, etc.)

    Returns:
        Dict with:
            - success: bool
            - output: stdout string
            - error: error message if failed
            - figures: list of base64 encoded images
            - data: any structured data output
    """
    timeout = min(timeout, MAX_TIMEOUT)

    with tempfile.TemporaryDirectory() as tmpdir:
        # Prepare full code with setup
        full_code = SETUP_CODE.format(workdir=tmpdir)

        # Add data context if provided
        if data_context:
            full_code += f"\n# Data context\n_data_context = {json.dumps(data_context)}\n"

        # Add user code
        full_code += f"\n# User code\n{code}\n"

        # Add figure saving code
        full_code += SAVE_FIGURES_CODE.format(workdir=tmpdir)

        # Write code to temp file
        code_file = Path(tmpdir) / "script.py"
        code_file.write_text(full_code, encoding="utf-8")

        try:
            # Execute code
            process = await asyncio.create_subprocess_exec(
                sys.executable, str(code_file),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=tmpdir
            )

            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=timeout
                )
            except asyncio.TimeoutError:
                process.kill()
                await process.communicate()
                return {
                    "success": False,
                    "output": "",
                    "error": f"Execution timed out after {timeout} seconds",
                    "figures": [],
                    "data": None
                }

            stdout_str = stdout.decode("utf-8", errors="replace")
            stderr_str = stderr.decode("utf-8", errors="replace")

            # Check for errors
            if process.returncode != 0:
                return {
                    "success": False,
                    "output": stdout_str,
                    "error": stderr_str or "Execution failed",
                    "figures": [],
                    "data": None
                }

            # Parse output to find figures
            figures = []
            output_lines = []
            figure_paths = []

            for line in stdout_str.split("\n"):
                if line.startswith("__FIGURES__:"):
                    figure_paths = line.replace("__FIGURES__:", "").split(",")
                else:
                    output_lines.append(line)

            # Read and encode figures
            for fig_path in figure_paths:
                fig_path = fig_path.strip()
                if fig_path and os.path.exists(fig_path):
                    with open(fig_path, "rb") as f:
                        img_data = base64.b64encode(f.read()).decode("utf-8")
                        figures.append({
                            "filename": os.path.basename(fig_path),
                            "data": img_data,
                            "mime_type": "image/png"
                        })

            return {
                "success": True,
                "output": "\n".join(output_lines).strip(),
                "error": None,
                "figures": figures,
                "data": None
            }

        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": str(e),
                "figures": [],
                "data": None
            }


async def execute_analysis(
    code: str,
    data_path: Optional[str] = None,
    timeout: int = DEFAULT_TIMEOUT
) -> Dict[str, Any]:
    """
    Execute analysis code with optional data file.

    Args:
        code: Python code to execute
        data_path: Path to data file to load
        timeout: Maximum execution time

    Returns:
        Execution result dict
    """
    # If data path provided, inject loading code
    if data_path:
        ext = Path(data_path).suffix.lower()
        if ext == ".csv":
            data_load = f'df = pd.read_csv("{data_path}")\n'
        elif ext in [".xlsx", ".xls"]:
            data_load = f'df = pd.read_excel("{data_path}")\n'
        elif ext == ".json":
            data_load = f'df = pd.read_json("{data_path}")\n'
        else:
            data_load = ""

        code = data_load + code

    return await execute_code(code, timeout)


def format_code_for_download(code: str, include_imports: bool = True) -> str:
    """
    Format code for user download with proper imports.

    Args:
        code: User code
        include_imports: Whether to add standard imports

    Returns:
        Formatted code string
    """
    if not include_imports:
        return code

    imports = '''"""
Generated by GeoMind 3.0
Earth Science Research Assistant
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Configure matplotlib
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300
plt.rcParams['font.size'] = 10

'''
    return imports + code
