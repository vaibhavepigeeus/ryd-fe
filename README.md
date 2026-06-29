# RYD Form Builder

A drag-and-drop page and form builder for client-specific websites, built with React and Vite.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

- **Component palette** — drag Title, Text, Image, Button, Contact Form, Newsletter Form, Section, Divider, and Spacer onto the canvas
- **WYSIWYG canvas** — click to select elements, inline-edit text, move up/down, delete
- **Desktop / mobile preview** toggle
- **Top navigation** — Build, Pages, Theme, Apps, Settings tabs (UI shell for future work)

## Project Structure

```
src/
├── components/
│   ├── layout/     TopBar, Sidebar, Canvas
│   ├── canvas/     CanvasElement with selection controls
│   └── elements/   Individual component renderers
├── constants/      Component types and palette config
└── context/        Builder state (elements, selection)
```

## Questionnaires (backend integration)

Questionnaires are loaded from the Django backend at `D:\DEP\Kumar\RYD\BE`.

| Endpoint | Purpose |
|----------|---------|
| `GET /api/forms/types/` | List available forms |
| `GET /api/forms/types/:id/full/` | Full nested questionnaire for the builder |

### Local setup

1. Start the backend: `python manage.py runserver` (port 8000)
2. Start the frontend: `npm run dev` (port 5173)
3. The Vite dev server proxies `/api` → `http://localhost:8000`

Ensure `ALLOWED_ORIGINS` in the backend `.env` includes `http://localhost:5173`.

In `DEBUG` mode, GET requests to `/api/forms/*` are allowed without login so the builder can load form definitions.

### Environment

```
VITE_API_URL=/api
```

For production builds pointing directly at the API server, set the full URL instead, e.g. `VITE_API_URL=https://your-api.com/api`.

| Command         | Description          |
|-----------------|----------------------|
| `npm run dev`   | Start dev server     |
| `npm run build` | Production build     |
| `npm run preview` | Preview production build |
"# ryd-fe" 
