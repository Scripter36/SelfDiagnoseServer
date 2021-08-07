import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'
import DiagnoseHandler from './handlers/DiagnoseHandler'
import LoginHandler from './handlers/LoginHandler'
import DataManager from './DataManager'
import HospitalHandler from './handlers/HospitalHandler'

const app = express()
const server = app.listen(3005, () => {
  console.log('Listening on port 3005')
})

app.use(express.json())
app.use(cookieParser())
app.use(express.static('public'))

DataManager.init()

;(async () => {
  await DiagnoseHandler.addListener(app)
  LoginHandler.addListener(app)
  HospitalHandler.addListener(app)

  app.get('/download_app', (req, res) => {
    res.redirect('https://play.google.com/store/apps/details?id=io.github.scripter36.d_search')
  })

  app.get('/app_download', (req, res) => {
    res.redirect('https://play.google.com/store/apps/details?id=io.github.scripter36.d_search')
  })

  app.get('*', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
  })
})().catch((e) => {
  console.error(e)
})
