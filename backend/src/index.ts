import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth'
import notFound from './middleware/notFound'
import errorHandler from './middleware/errorHandler'

const app = express()
const port = Number(process.env.PORT ?? 3001)

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/', authRouter)

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})