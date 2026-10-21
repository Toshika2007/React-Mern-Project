# AI Legal Document Simplifier

An AI-powered web application that helps users understand complex legal documents through simplified summaries, important clause extraction, legal risk identification, and an AI chat assistant.

## Features

- **User Authentication** — Sign in and access the application using Firebase Authentication.
- **PDF Upload** — Upload legal documents in PDF format.
- **AI-Powered Summarization** — Convert complex legal language into easier-to-understand summaries.
- **Important Clause Extraction** — Identify and display important clauses from legal documents.
- **Legal Risk Detection** — Highlight potential risks and noteworthy terms in uploaded documents.
- **AI Legal Chat Assistant** — Ask questions about an uploaded document and receive AI-generated explanations.
- **Document Management** — View uploaded documents and their analysis results.
- **Document History** — Search and filter previously uploaded documents.
- **Reports** — View available document analysis results and risk summaries.
- **Settings and Profile** — Access account information and application preferences.

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- REST API

### Database and Authentication
- MongoDB
- Mongoose
- Firebase Authentication

### AI Integration
- Groq API
- `openai/gpt-oss-20b`

### Document Processing
- PDF parsing with `pdf-parse`
- PDF viewing with `react-pdf`

## Application Workflow

1. Register or sign in.
2. Upload a legal document in PDF format.
3. Request AI analysis.
4. Review the simplified summary, important clauses, and potential risks.
5. Ask document-related questions through the AI chat assistant.
6. Revisit saved documents and available reports.

## Getting Started

### Prerequisites
- Node.js and npm
- MongoDB
- Firebase project with Authentication configured
- Groq API key

### 1. Clone the repository

```bash
git clone https://github.com/Toshika2007/React-Mern-Project.git
cd React-Mern-Project
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the backend directory and configure the variable names expected by your backend code, including your Groq API key and MongoDB connection string.

Do not commit `.env` files or expose API keys publicly.

Configure Firebase Authentication using your Firebase project settings.

### 5. Start the backend

```bash
node server.js
```

### 6. Start the frontend

Open another terminal in the project root and run:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Security Note

AI-generated explanations are intended for informational purposes only and are not a substitute for advice from a qualified legal professional. Always verify important legal interpretations independently.

## Future Enhancements

- Downloadable PDF reports
- Enhanced document comparison
- Stronger server-side authentication and authorization
- Improved document privacy and storage controls
- Additional language support

## Author

**Toshika Sakthivel**

GitHub: [Toshika2007](https://github.com/Toshika2007)

---

*Built as an academic project to make complex legal documents easier to understand using AI.*
