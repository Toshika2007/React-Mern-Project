
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Groq = require("groq-sdk");
const { PDFParse } = require("pdf-parse");

const Document = require("./models/Document");

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// 1. CONFIGURATION
// =====================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDirectory = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

// Allow access to uploaded files
app.use("/uploads", express.static(uploadsDirectory));

// Groq AI configuration
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// =====================================
// 2. MONGODB CONNECTION
// =====================================

mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb://127.0.0.1:27017/legalDocumentDB"
  )
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

// =====================================
// 3. MULTER FILE UPLOAD CONFIGURATION
// =====================================

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadsDirectory);
  },

  filename: (req, file, callback) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    const extension = path.extname(file.originalname);

    callback(
      null,
      path.basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9_-]/g, "_") +
        "-" +
        uniqueSuffix +
        extension
    );
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isPdf =
      extension === ".pdf" ||
      file.mimetype === "application/pdf";

    if (!isPdf) {
      return callback(new Error("Only PDF files are allowed"));
    }

    callback(null, true);
  }
});

// =====================================
// 4. HOME / HEALTH CHECK
// =====================================

app.get("/", (req, res) => {
  res.status(200).json({
    message: "AI Legal Document Simplifier backend is running"
  });
});

// =====================================
// 5. UPLOAD DOCUMENT
// =====================================

app.post("/upload", upload.any(), async (req, res) => {
  let uploadedFile;

  try {
    uploadedFile =
      req.files && req.files.length > 0 ? req.files[0] : null;

    if (!uploadedFile) {
      return res.status(400).json({
        message: "Please select a PDF file to upload"
      });
    }

    const { userId } = req.body;

    if (!userId) {
      fs.unlinkSync(uploadedFile.path);

      return res.status(400).json({
        message: "User ID is required"
      });
    }

    // Save uploaded document details in MongoDB
    const document = await Document.create({
      originalName: uploadedFile.originalname,
      filename: uploadedFile.filename,
      uploadedAt: new Date(),
      status: "Uploaded",
      fileSize: uploadedFile.size,
      userId: userId,
      analysis: null
    });

    return res.status(201).json({
      message: "Document uploaded successfully",
      document: document,
      filename: document.filename,
      originalName: document.originalName,
      fileSize: document.fileSize,
      status: document.status
    });
  } catch (error) {
    console.error("Upload error:", error);

    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }

    return res.status(500).json({
      message: "Failed to upload document",
      error: error.message
    });
  }
});

// =====================================
// 6. ANALYZE DOCUMENT USING GROQ AI
//    AND SAVE ANALYSIS IN MONGODB
// =====================================

app.post("/analyze", async (req, res) => {
  let parser;

  try {
    const { filename, userId } = req.body;

    if (!filename) {
      return res.status(400).json({
        message: "Filename is required"
      });
    }

    if (!userId) {
  return res.status(400).json({
    message: "User ID is required"
  });
}

    // Prevent directory traversal
    if (
      path.basename(filename) !== filename ||
      filename.includes("..")
    ) {
      return res.status(400).json({
        message: "Invalid filename"
      });
    }

    // Find document record in MongoDB
   const existingDocument = await Document.findOne({
  filename: filename,
  userId: userId
});
    if (!existingDocument) {
      return res.status(404).json({
        message: "Document record not found in MongoDB"
      });
    }

    // Locate uploaded PDF
    const filePath = path.join(uploadsDirectory, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "PDF file not found"
      });
    }

    // Read PDF file
    const pdfBuffer = fs.readFileSync(filePath);

    // Extract PDF text
    parser = new PDFParse({
      data: pdfBuffer
    });

    const result = await parser.getText();

    const extractedText = result.text || "";

    if (!extractedText.trim()) {
      return res.status(400).json({
        message: "No readable text found in this PDF"
      });
    }

    // Send extracted text to Groq AI
    console.log("Sending document to Groq AI...");

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
You are an AI legal document assistant.

Analyze the provided document carefully.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not add any text outside the JSON.

Use exactly this structure:

{
  "summary": "A simple and easy-to-understand summary of the document.",
  "importantClauses": [
    {
      "title": "Clause or section name",
      "explanation": "Explain this section in simple language."
    }
  ],
  "legalRisks": [
    {
      "risk": "Risk name",
      "explanation": "Explain the potential risk simply.",
      "severity": "Low"
    }
  ],
  "disclaimer": "This is an AI-generated explanation and is not professional legal advice."
}

Rules:
- If the document is not a legal document, analyze it honestly.
- Do not invent clauses that are not present in the document.
- If there are no meaningful legal risks, return an empty legalRisks array.
- Severity must be exactly one of: Low, Medium, High.
- Keep explanations concise and easy to understand.
`
        },
        {
          role: "user",
          content: extractedText
        }
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.3,
      max_completion_tokens: 1500,
      reasoning_effort: "low",
      include_reasoning: false,
      stream: false
    });

    console.log("Groq AI response received!");

    const aiAnalysis =
      completion.choices[0]?.message?.content || "";

    if (!aiAnalysis.trim()) {
      return res.status(502).json({
        message: "AI returned an empty response"
      });
    }

    // Convert AI response into an object
    let parsedAnalysis;

    try {
      parsedAnalysis = JSON.parse(aiAnalysis);
    } catch (parseError) {
      console.error("Invalid AI JSON response:", aiAnalysis);

      return res.status(502).json({
        message: "AI returned an invalid analysis format"
      });
    }

    // Validate expected response fields
    if (
      typeof parsedAnalysis.summary !== "string" ||
      !Array.isArray(parsedAnalysis.importantClauses) ||
      !Array.isArray(parsedAnalysis.legalRisks)
    ) {
      return res.status(502).json({
        message: "AI returned an unexpected analysis structure"
      });
    }

    // Save analysis and update status in MongoDB
    const savedDocument = await Document.findByIdAndUpdate(
      existingDocument._id,
      {
        $set: {
          analysis: parsedAnalysis,
          status: "Analyzed"
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!savedDocument) {
      return res.status(500).json({
        message: "Failed to save analysis in MongoDB"
      });
    }

    console.log("AI analysis saved in MongoDB successfully!");

    // Return the same analysis format expected by the frontend
    return res.status(200).json({
      message: "AI analysis completed and saved successfully",
      filename: filename,
      pages: result.total,
      extractedText: extractedText,
      analysis: aiAnalysis
    });
  } catch (error) {
    console.error("AI analysis error:", error);

    return res.status(500).json({
      message: "Failed to analyze document",
      error: error.message
    });
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch (cleanupError) {
        console.error(
          "PDF parser cleanup error:",
          cleanupError.message
        );
      }
    }
  }
});

// =====================================
// 7. GET DOCUMENTS FOR A USER
// =====================================

app.get("/documents", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required"
      });
    }

    const documents = await Document.find({
      userId: userId
    }).sort({
      uploadedAt: -1
    });

    return res.status(200).json({
      documents: documents
    });
  } catch (error) {
    console.error("Fetch documents error:", error);

    return res.status(500).json({
      message: "Failed to fetch documents",
      error: error.message
    });
  }
});


/* =====================================
   8. AI CHAT WITH OPTIONAL PDF CONTEXT
===================================== */

app.post("/chat", async (req, res) => {
  let parser;

  try {
    const { message, filename, userId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a message"
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required"
      });
    }

    let documentContext = "";

    // If a PDF is selected, verify ownership and read its text.
    if (filename) {
      if (
        path.basename(filename) !== filename ||
        filename.includes("..")
      ) {
        return res.status(400).json({
          message: "Invalid filename"
        });
      }

      const document = await Document.findOne({
        filename,
        userId
      });

      if (!document) {
        return res.status(404).json({
          message: "Document not found for this user"
        });
      }

      const filePath = path.join(uploadsDirectory, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          message: "The uploaded PDF file could not be found"
        });
      }

      const pdfBuffer = fs.readFileSync(filePath);

      parser = new PDFParse({ data: pdfBuffer });

      const result = await parser.getText();
      const extractedText = result.text || "";

      if (!extractedText.trim()) {
        return res.status(400).json({
          message: "No readable text found in this PDF"
        });
      }

      // Limit context to avoid sending an excessively large prompt.
      documentContext = extractedText.slice(0, 18000);
    }

    const systemPrompt = documentContext
      ? `You are an AI assistant for the AI Legal Document Simplifier.
Answer the user's questions using the provided PDF text as context.
Explain legal terms in simple, clear language.
Do not invent clauses, facts, or legal provisions.
If the PDF does not contain the answer, say so clearly.
You may provide general information when useful, but distinguish it
from information explicitly stated in the document.
You are not a lawyer and your answer is not professional legal advice.

DOCUMENT TEXT:
${documentContext}`
      : `You are an AI assistant for the AI Legal Document Simplifier.
Answer questions about legal documents and legal concepts in simple,
clear language. Do not invent facts or claim to have read a document
unless its text has been provided. Explain that your response is
general information, not professional legal advice.`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message.trim()
        }
      ],
      temperature: 0.3,
      max_completion_tokens: 1000,
      reasoning_effort: "low",
      stream: false
    });

    const reply =
      completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        message: "AI returned an empty response"
      });
    }

    return res.status(200).json({
      reply,
      filename: filename || null
    });
  } catch (error) {
    console.error("AI chat error:", error);

    return res.status(500).json({
      message: "Failed to get an AI response",
      error: error.message
    });
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch (cleanupError) {
        console.error(
          "PDF parser cleanup error:",
          cleanupError.message
        );
      }
    }
  }
});


// =====================================
// 8. ERROR HANDLER
// =====================================

app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "PDF file must be smaller than 10 MB"
      });
    }

    return res.status(400).json({
      message: error.message
    });
  }

  return res.status(500).json({
    message: error.message || "Internal server error"
  });
});

// =====================================
// 9. START SERVER
// =====================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
