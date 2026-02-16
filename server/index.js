import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import OpenAI from 'openai'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

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
        const { topic, wordsCount, language } = req.body

        const prompt = `
      Generates a crossword puzzle word list.
      Topic: "${topic}"
      Language: ${language === 'uz' ? 'Uzbek' : 'Russian'}
      Count: ${wordsCount || 10} words
      
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
