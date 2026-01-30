# GeoMind 2.0

Earth Science Online Computing Platform - AI-powered research assistant for geoscience professionals.

## Features

- **AI-Powered Chat**: Intelligent conversations powered by Claude AI with specialized knowledge in Earth Sciences
- **Literature Search**: Semantic search across scientific papers using Qdrant vector database
- **Data Analysis**: Upload Excel/CSV files for AI-assisted data analysis
- **Research Assistant**: Get relevant literature recommendations during conversations

## Tech Stack

| Layer | Technology | Description |
|-------|-----------|-------------|
| Frontend | Next.js 14 + Tailwind CSS + TypeScript | React framework |
| Backend | FastAPI + Python 3.11 | API service |
| AI | Claude API (Zeabur AI Gateway) | OpenAI-compatible format |
| Vector DB | Qdrant Cloud | Literature retrieval |
| Deployment | Zeabur | Frontend and backend hosting |

## Project Structure

```
geomind-2.0/
├── frontend/                    # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main page (chat interface)
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatWindow.tsx  # Chat window
│   │   │   ├── MessageBubble.tsx # Message bubble
│   │   │   └── InputArea.tsx   # Input area
│   │   ├── Sidebar/
│   │   │   └── Sidebar.tsx     # Sidebar
│   │   └── Literature/
│   │       └── LiteraturePanel.tsx # Literature panel
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   └── utils.ts            # Utilities
│   └── ...
│
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── main.py             # Entry point
│   │   ├── config.py           # Configuration
│   │   ├── routers/
│   │   │   ├── chat.py         # Chat API
│   │   │   ├── literature.py   # Literature API
│   │   │   └── files.py        # Files API
│   │   └── services/
│   │       ├── claude.py       # Claude service
│   │       └── qdrant.py       # Qdrant service
│   ├── requirements.txt
│   ├── Dockerfile
│   └── zeabur.json
│
└── README.md
```

## Deployment

### Prerequisites

- Zeabur account
- Qdrant Cloud instance with papers indexed
- Claude API key (via Zeabur AI Gateway)

### Environment Variables

#### Backend (geomind-api)

| Variable | Description | Example |
|----------|-------------|---------|
| CLAUDE_API_KEY | Zeabur AI Gateway key | sk-xxx |
| CLAUDE_BASE_URL | Claude API URL | https://ai.zeabur.com/v1 |
| CLAUDE_MODEL | Model name | claude-3-5-sonnet |
| QDRANT_URL | Qdrant Cloud URL | https://xxx.aws.cloud.qdrant.io:6333 |
| QDRANT_API_KEY | Qdrant API key | xxx |
| QDRANT_COLLECTION | Collection name | geomind_papers |

#### Frontend (geomind-web)

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | https://geomind-api.zeabur.app |

### Deploy to Zeabur

1. Create a new project in Zeabur console

2. Deploy Backend:
   - Add service → Git deployment → Select `backend/` directory
   - Service name: `geomind-api`
   - Domain: `geomind-api.zeabur.app`
   - Set environment variables

3. Deploy Frontend:
   - Add service → Git deployment → Select `frontend/` directory
   - Service name: `geomind-web`
   - Domain: `geomind.zeabur.app`
   - Set `NEXT_PUBLIC_API_URL=https://geomind-api.zeabur.app`

4. Verify:
   ```bash
   # Backend health check
   curl https://geomind-api.zeabur.app/health

   # Literature search test
   curl "https://geomind-api.zeabur.app/api/literature/search?q=water%20quality&limit=5"

   # Frontend
   open https://geomind.zeabur.app
   ```

## API Documentation

Once deployed, access the API documentation at:
- Swagger UI: https://geomind-api.zeabur.app/docs
- ReDoc: https://geomind-api.zeabur.app/redoc

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export CLAUDE_API_KEY=your_key
export QDRANT_API_KEY=your_key
# ... other variables

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## License

MIT
