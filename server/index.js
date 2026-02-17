import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import OpenAI from 'openai'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

dotenv.config()

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// Serve static files from dist
app.use(express.static(path.join(__dirname, '../dist')))

const PORT = process.env.PORT || 3000
const SECRET_KEY = process.env.SECRET_KEY || 'secret-classplay'

// --- OpenAI ---
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- Database Setup ---
let db
(async () => {
    db = await open({
        filename: 'edugames.db',
        driver: sqlite3.Database
    })

    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT,
      role TEXT DEFAULT 'teacher',
      school TEXT,
      subscription_end TEXT,
      generated_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      grade TEXT,
      topic TEXT,
      interests TEXT,
      language TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER,
      name TEXT,
      FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS saved_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT, -- 'math' or 'crossword'
      name TEXT,
      data TEXT, -- JSON content
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `)

    // Migration: Check if generated_count exists
    try {
        await db.run("ALTER TABLE users ADD COLUMN generated_count INTEGER DEFAULT 0")
        console.log("Migration: Added generated_count column")
    } catch (e) {
        // Column likely exists
    }

    // Seeding
    const admin = await db.get("SELECT * FROM users WHERE email = 'admin@classplay.uz'")
    if (!admin) {
        const hash = await bcrypt.hash('admin123', 10)
        await db.run("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
            'admin@classplay.uz', hash, 'Администратор', 'admin')
    }

    const teacher = await db.get("SELECT * FROM users WHERE email = 'teacher@classplay.uz'")
    if (!teacher) {
        const hash = await bcrypt.hash('demo123', 10)
        await db.run("INSERT INTO users (email, password, name, role, school, subscription_end) VALUES (?, ?, ?, ?, ?, ?)",
            'teacher@classplay.uz', hash, 'Учитель Демо', 'teacher', 'Школа №1', '2025-12-31')
    }

    console.log('Database ready.')
})()

// --- Middleware ---

// Database readiness check
const checkDbReady = (req, res, next) => {
    if (!db) {
        console.error("Database not ready yet!")
        return res.status(503).json({ error: 'Service temporarily unavailable, database initializing' })
    }
    next()
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) return res.sendStatus(401)

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

// --- Routes ---

// Login
app.post('/api/auth/login', checkDbReady, async (req, res) => {
    const { email, password } = req.body
    const user = await db.get("SELECT * FROM users WHERE email = ?", email)

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, SECRET_KEY)
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
})

// Generate Math (AI)
app.post('/api/generate/math', checkDbReady, authenticateToken, async (req, res) => {
    try {
        const { settings, classContext } = req.body

        const prompt = `
      Создай рабочий лист по математике для учителя.
      Контекст класса: ${classContext || 'Обычный класс'}.
      Настройки: ${settings.numQuestions} примеров, операции: ${settings.operations.join(', ')}, сложность: ${settings.difficulty}.
      Если выбран "includeWordProblems", включи 1-2 текстовые задачи в конце, соответствующие интересам класса.
      Верни JSON формат: { "title": "Название", "problems": [ { "question": "2 + 2", "answer": 4 } ] }
      Для примеров просто "число операция число".
    `

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant that generates JSON." }, { role: "user", content: prompt }],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }
        });

        res.json(JSON.parse(completion.choices[0].message.content))
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'AI generation failed' })
    }
})

// Generate Crossword (AI)
app.post('/api/generate/crossword', checkDbReady, authenticateToken, async (req, res) => {
    console.log("POST /api/generate/crossword")
    try {
        const { topic, wordsCount, language, grade } = req.body

        const prompt = `
      Generates a crossword puzzle word list.
      Topic: "${topic}"
      Target Audience: Grade ${grade || '1-4'} students (Simple vocabulary).
      Language: ${language === 'uz' ? 'Uzbek' : 'Russian'}
      Count: ${(wordsCount || 10) + 5} words (Generate extra for better grid fit)
      
      Output ONLY strict JSON:
      {
        "words": [
          { "word": "WORD", "clue": "Clue definition" }
        ]
      }
      Words must be nouns.
    `
        console.log("Sending prompt to OpenAI...")

        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a crossword generator. Output strict JSON only. No markdown formatting." },
                    { role: "user", content: prompt }
                ],
                model: "gpt-4o-mini",
                response_format: { type: "json_object" },
                temperature: 0.7,
            });

            const content = completion.choices[0].message.content
            console.log("AI Response:", content)

            if (!content) throw new Error("Empty AI response")

            const aiData = JSON.parse(content)

            // Increment Stats
            await db.run("UPDATE users SET generated_count = generated_count + 1 WHERE id = ?", req.user.id)

            res.json(aiData)
        } catch (aiError) {
            console.error("AI Error:", aiError)
            res.status(200).json({
                words: [],
                error: "AI_FAILED",
                message: aiError.message
            })
        }
    } catch (error) {
        console.error("Server Error:", error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// Generate Jeopardy (AI)
app.post('/api/generate/jeopardy', checkDbReady, authenticateToken, async (req, res) => {
    try {
        const { topic, difficulty, grade, language } = req.body

        const prompt = `
            Create a Jeopardy-style quiz game content.
            Topic: "${topic}"
            Target Audience: Grade ${grade || 'Any'} students.
            Difficulty: ${difficulty} (easy/medium/hard).
            Language: ${language === 'uz' ? 'Uzbek' : 'Russian'}
            
            Generate 5 categories.
            For each category, generate 5 questions with increasing difficulty (100 to 500 points).
            
            Output STRICT JSON format:
            {
                "categories": [
                    {
                        "name": "Category Name",
                        "questions": [
                            { "points": 100, "q": "Question text", "a": "Answer text" },
                            ... (200, 300, 400, 500)
                        ]
                    }
                ]
            }
        `

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a quiz generator. Output strict JSON only." },
                { role: "user", content: prompt }
            ],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(completion.choices[0].message.content)

        // Increment Stats
        await db.run("UPDATE users SET generated_count = generated_count + 1 WHERE id = ?", req.user.id)

        res.json(content)
    } catch (error) {
        console.error("Jeopardy Generation Error:", error)
        res.status(500).json({ error: 'AI generation failed' })
    }
})

// --- Admin Routes ---

// Get All Users (Admin Only)
app.get('/api/admin/users', checkDbReady, authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403)

    try {
        const users = await db.all("SELECT id, name, email, role, school, subscription_end, generated_count FROM users ORDER BY id DESC")
        res.json(users)
    } catch (e) {
        console.error("GET Users Error:", e)
        res.sendStatus(500)
    }
})

// Create User (Admin Only)
app.post('/api/admin/users', checkDbReady, authenticateToken, async (req, res) => {
    console.log("POST /api/admin/users", req.body)
    if (req.user.role !== 'admin') return res.sendStatus(403)

    const { name, email, password, school, role } = req.body

    try {
        const existing = await db.get("SELECT id FROM users WHERE email = ?", email)
        if (existing) return res.status(400).json({ error: 'User already exists' })

        const hash = await bcrypt.hash(password || '123456', 10)

        await db.run(
            "INSERT INTO users (name, email, password, school, role, subscription_end) VALUES (?, ?, ?, ?, ?, ?)",
            name, email, hash, school || '', role || 'teacher', '2025-12-31'
        )

        res.json({ success: true })
    } catch (e) {
        console.error("CREATE User Error:", e)
        res.status(500).json({ error: 'Create failed' })
    }
})

// Update User (Admin Only)
app.put('/api/admin/users/:id', checkDbReady, authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403)

    const { id } = req.params
    const { name, email, password, school } = req.body

    try {
        if (password) {
            const hash = await bcrypt.hash(password, 10)
            await db.run("UPDATE users SET name = ?, email = ?, password = ?, school = ? WHERE id = ?", name, email, hash, school, id)
        } else {
            await db.run("UPDATE users SET name = ?, email = ?, school = ? WHERE id = ?", name, email, school, id)
        }
        res.json({ success: true })
    } catch (e) {
        console.error("UPDATE User Error:", e)
        res.status(500).json({ error: 'Update failed' })
    }
})

// Save Item
app.post('/api/save', checkDbReady, authenticateToken, async (req, res) => {
    const { type, name, data } = req.body
    const userId = req.user.id

    await db.run("INSERT INTO saved_items (user_id, type, name, data) VALUES (?, ?, ?, ?)",
        userId, type, name, JSON.stringify(data))

    res.json({ success: true })
})

// List Saved
app.get('/api/saved/:type', checkDbReady, authenticateToken, async (req, res) => {
    const { type } = req.params
    const userId = req.user.id

    const items = await db.all("SELECT id, name, created_at FROM saved_items WHERE user_id = ? AND type = ? ORDER BY created_at DESC", userId, type)
    res.json(items)
})

// Load Saved
app.get('/api/saved/item/:id', checkDbReady, authenticateToken, async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    const item = await db.get("SELECT * FROM saved_items WHERE id = ? AND user_id = ?", id, userId)
    if (item) {
        item.data = JSON.parse(item.data)
        res.json(item)
    } else {
        res.status(404).json({ error: 'Not found' })
    }
})

// --- Class Management Routes ---

// Get User's Classes
app.get('/api/classes', checkDbReady, authenticateToken, async (req, res) => {
    try {
        const classes = await db.all("SELECT * FROM classes WHERE user_id = ? ORDER BY id DESC", req.user.id)
        res.json(classes)
    } catch (e) {
        console.error("GET Classes Error:", e)
        res.status(500).json({ error: 'Failed to fetch classes' })
    }
})

// Update a class
app.put('/api/classes/:id', checkDbReady, authenticateToken, async (req, res) => {
    try {
        const { grade, topic, interests, language } = req.body
        const { id } = req.params

        // Verify ownership
        const cls = await db.get("SELECT * FROM classes WHERE id = ? AND user_id = ?", id, req.user.id)
        if (!cls) return res.status(404).json({ error: "Class not found" })

        await db.run(
            `UPDATE classes SET grade = COALESCE(?, grade), topic = COALESCE(?, topic), 
             interests = COALESCE(?, interests), language = COALESCE(?, language) 
             WHERE id = ?`,
            grade, topic, interests, language, id
        )

        res.json({ success: true })
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: "Failed to update class" })
    }
})

// Create Class
app.post('/api/classes', checkDbReady, authenticateToken, async (req, res) => {
    const { grade, topic, interests, language } = req.body

    try {
        const result = await db.run(
            "INSERT INTO classes (user_id, grade, topic, interests, language) VALUES (?, ?, ?, ?, ?)",
            req.user.id, grade, topic || '', interests || '', language || 'ru'
        )
        res.json({ success: true, id: result.lastID })
    } catch (e) {
        console.error("CREATE Class Error:", e)
        res.status(500).json({ error: 'Failed to create class' })
    }
})

// Delete Class
app.delete('/api/classes/:id', checkDbReady, authenticateToken, async (req, res) => {
    const { id } = req.params

    try {
        await db.run("DELETE FROM classes WHERE id = ? AND user_id = ?", id, req.user.id)
        res.json({ success: true })
    } catch (e) {
        console.error("DELETE Class Error:", e)
        res.status(500).json({ error: 'Failed to delete class' })
    }
})

// --- Students API ---

// Get Students for a class
app.get('/api/classes/:classId/students', checkDbReady, authenticateToken, async (req, res) => {
    try {
        const { classId } = req.params
        // Verify class ownership
        const cls = await db.get("SELECT * FROM classes WHERE id = ? AND user_id = ?", classId, req.user.id)
        if (!cls) return res.status(403).json({ error: 'Access denied' })

        const students = await db.all("SELECT * FROM students WHERE class_id = ?", classId)
        res.json(students)
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch students' })
    }
})

// Add Student(s)
app.post('/api/classes/:classId/students', checkDbReady, authenticateToken, async (req, res) => {
    try {
        const { classId } = req.params
        const { name, names } = req.body // Support single 'name' or array 'names'

        const cls = await db.get("SELECT * FROM classes WHERE id = ? AND user_id = ?", classId, req.user.id)
        if (!cls) return res.status(403).json({ error: 'Access denied' })

        if (names && Array.isArray(names)) {
            for (const n of names) {
                if (n.trim()) await db.run("INSERT INTO students (class_id, name) VALUES (?, ?)", classId, n.trim())
            }
        } else if (name) {
            await db.run("INSERT INTO students (class_id, name) VALUES (?, ?)", classId, name.trim())
        }

        const students = await db.all("SELECT * FROM students WHERE class_id = ?", classId)
        res.json(students)
    } catch (e) {
        res.status(500).json({ error: 'Failed to add student' })
    }
})

// Delete Student
app.delete('/api/students/:id', checkDbReady, authenticateToken, async (req, res) => {
    try {
        // We should verify ownership via class linkage, but for speed logic:
        // Get student -> check class -> check user
        const student = await db.get("SELECT s.id, c.user_id FROM students s JOIN classes c ON s.class_id = c.id WHERE s.id = ?", req.params.id)

        if (!student || student.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' })
        }

        await db.run("DELETE FROM students WHERE id = ?", req.params.id)
        res.json({ success: true })
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete student' })
    }
})

// SPA Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`)
})
