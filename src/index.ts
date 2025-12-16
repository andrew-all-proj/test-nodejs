import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import { config } from './config'
import authRoutes from './modules/auth/auth.route'
import fileRoutes from './modules/file/file.route'
import { errorHandler } from './middleware/errorHandler'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger'

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Ensure uploads directory exists
const uploadsDir = config.uploadsDir
fs.mkdirSync(uploadsDir, { recursive: true })

app.use('/file', fileRoutes)
app.use('/', authRoutes)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`)
})
