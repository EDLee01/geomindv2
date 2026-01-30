# GeoMind 3.0

Earth Science Intelligent Research Assistant - AI-powered platform for scientific research from literature search to paper writing.

## Overview

**GeoMind 3.0** helps researchers complete the full research workflow:
- **Literature Search**: 700,000+ verified papers with DOI validation
- **Data Analysis**: Statistical, time series, and spatial analysis
- **Code Execution**: Python code with visualization support
- **Paper Writing**: Full workflow from literature to draft

### Core Differentiators

| Feature | ChatGPT | Claude | GeoMind 3.0 |
|---------|---------|--------|-------------|
| Literature Search | May hallucinate | May hallucinate | 700k+ DOI verified |
| Code Execution | Yes | Yes | Yes + Geo libraries |
| Paper Writing | Single generation | Single generation | Full workflow |
| Project Memory | No | Limited | Cross-chat persistent |
| Domain Expertise | General | General | Earth Science focused |

## Architecture

### Dual Agent System

```
User Input → Intent Recognition → Route
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
    ┌─────────┐               ┌──────────┐              ┌──────────┐
    │  Chat   │               │  Task    │              │ Project  │
    │DeepSeek │               │ Claude   │              │ Claude   │
    │Stateless│               │+ Skills  │              │+ Memory  │
    └─────────┘               └──────────┘              └──────────┘
```

### Project Structure

```
geomindv2/
├── frontend/                    # Next.js 14 frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Main page with Project/Chat management
│   │   └── globals.css
│   ├── components/
│   │   ├── Chat/               # Chat components
│   │   ├── Sidebar/            # Project/Chat sidebar
│   │   ├── Artifact/           # Artifact preview panel
│   │   └── Literature/         # Literature search panel
│   └── lib/
│       └── api.ts              # API client
│
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── main.py             # Entry point
│   │   ├── config.py           # Configuration
│   │   ├── database/           # PostgreSQL models
│   │   │   ├── connection.py
│   │   │   └── models.py       # Project, Chat, Message, File
│   │   ├── routers/
│   │   │   ├── projects.py     # Project CRUD
│   │   │   ├── chats.py        # Chat management
│   │   │   ├── chat.py         # Legacy chat API
│   │   │   ├── literature.py   # Literature search
│   │   │   └── files.py        # File upload
│   │   ├── services/
│   │   │   ├── claude.py       # Claude AI service
│   │   │   ├── qdrant.py       # Vector search
│   │   │   ├── crossref.py     # DOI verification
│   │   │   ├── code_runner.py  # Code execution
│   │   │   ├── intent.py       # Intent detection
│   │   │   └── skills.py       # Skills loader
│   │   └── schemas/            # Pydantic models
│   │
│   └── skills/                  # SKILL.md knowledge files
│       ├── do/                  # GeoMind-Do skills
│       │   ├── literature_search.md
│       │   ├── gap_analysis.md
│       │   ├── visualization.md
│       │   └── data_preprocess.md
│       └── critic/              # GeoMind-Critic skills
│           └── verify_literature.md
│
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | FastAPI + Python 3.11 |
| Database | PostgreSQL |
| Vector DB | Qdrant Cloud (700k papers) |
| AI | Claude API (Zeabur AI Gateway) |
| Deployment | Zeabur |

## Features

### 1. Project Management
- Create research projects with persistent memory
- Track progress through 10 research stages
- Cross-chat memory for literature, methodology, results

### 2. Literature Search
- Semantic search across 700,000+ papers
- DOI verification via CrossRef API
- Sampling strategy: 3 random samples → full verification if needed
- BibTeX/RIS export

### 3. Skills System
- SKILL.md knowledge files for guided responses
- Auto-detection of relevant skills from user input
- Skills for: literature search, gap analysis, data preprocessing, visualization, paper writing

### 4. Code Execution
- Python code execution with timeout
- Figure generation at 300 DPI
- Chinese font support (SimHei)
- Output: code + figures + tables

### 5. Artifacts
- Code blocks with syntax highlighting
- Markdown documents
- Tables (three-line format)
- BibTeX references
- Image previews

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| CLAUDE_API_KEY | Zeabur AI Gateway key |
| CLAUDE_BASE_URL | `https://ai.zeabur.com/v1` |
| CLAUDE_MODEL | `claude-sonnet-4-5-20250514` |
| QDRANT_URL | Qdrant Cloud URL |
| QDRANT_API_KEY | Qdrant API key |
| QDRANT_COLLECTION | `geomind_papers` |

### Frontend

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_API_URL | Backend API URL |

## API Endpoints

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project with memory
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `PATCH /api/projects/{id}/memory` - Update memory
- `PATCH /api/projects/{id}/stages` - Update stages

### Chats
- `GET /api/chats` - List chats
- `POST /api/chats` - Create chat
- `GET /api/chats/{id}` - Get chat with messages
- `POST /api/chats/{id}/messages` - Send message

### Literature
- `GET /api/literature/search` - Search papers

### Files
- `POST /api/files/upload` - Upload file

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/geomind
export CLAUDE_API_KEY=your_key
# ... other variables

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Color Scheme

| Element | Color | Hex |
|---------|-------|-----|
| Primary (Deep Ocean Blue) | 深海蓝 | `#1e3a5f` |
| Accent (Earth Science Green) | 地学绿 | `#2d9d78` |
| Secondary (Sky Blue) | 天蓝 | `#4a90d9` |
| Background | 浅灰 | `#f5f7fa` |

## Research Workflow (8 Stages)

1. **Literature & Topic** - Search, filter, generate review, gap analysis
2. **Methodology Design** - Select methods from library, confirm data needs
3. **Data & Execution** - Preprocess data, run analysis, generate code
4. **Visualization** - Create figures (300dpi), three-line tables
5. **Results Writing** - Structure-based writing with user collaboration
6. **Discussion Writing** - Literature-supported discussion
7. **Integration** - References, merge sections, abstract
8. **Translation** (optional) - Chinese/English translation

## License

MIT
