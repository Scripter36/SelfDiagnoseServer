import Handler from './Handler'
import * as core from 'express-serve-static-core'
import crypto from 'crypto'
import DataManager, { User } from '../DataManager'

export default class LoginHandler extends Handler {
  private static salt = 'S$AS#'
  static addListener (app: core.Express) {
    app.post('/user/signin', (req, res) => this.signin(req, res))
    app.post('/user/signup', (req, res) => this.signup(req, res))
    app.get('/user/checkid', (req, res) => this.checkIdHandler(req, res))
    app.get('/user/info', (req, res) => this.getUserInfo(req, res))
  }

  static signin (req: core.Request, res: core.Response) {
    const id = req.body.id as string
    const password = crypto.createHash('sha256').update(req.body.password + this.salt).digest('base64')
    const found = DataManager.userData.some((user) => {
      if (user.id === id && user.password === password) {
        user.token = user.unique + crypto.randomBytes(20).toString('hex')
        res.cookie('token', user.token, { maxAge: 2592000000 }) // 1 Month
        res.redirect('/')
        res.end()
        return true
      }
      return false
    })
    if (!found) {
      res.send({ success: false })
      res.end()
    }
  }

  static signup (req: core.Request, res: core.Response) {
    const id = req.body.id as string
    const password = crypto.createHash('sha256').update(req.body.password + this.salt).digest('base64')
    if (this.checkId(id)) {
      const newUser: User = { unique: `U${this.getNewUniqueId()}`, id, password }
      DataManager.userData.push(newUser)
      DataManager.saveUserData()
      this.signin(req, res)
    } else {
      res.send({ success: false, reason: '이미 존재하는 아이디입니다.' })
      res.end()
    }
  }

  static checkIdHandler (req: core.Request, res: core.Response) {
    const id = req.body.id as string
    res.send({ success: true, result: this.checkId(id) })
    res.end()
  }

  static getUserInfo (req: core.Request, res: core.Response) {
    const user = this.getUser(req)
    if (user) {
      const qualifiedUser = {
        id: user.id,
        unique: user.unique
      }
      res.send({ success: true, result: qualifiedUser })
      res.end()
    } else {
      res.send({ success: false })
      res.end()
    }
  }

  static checkId (id: string) {
    return !DataManager.userData.some((user) => user.id === id)
  }

  static getUser (req: core.Request) {
    const token = req.cookies.token
    if (!token) return
    for (const user of DataManager.userData) {
      if (user.token === token) return user
    }
  }

  static getNewUniqueId () {
    let max = -1
    DataManager.userData.forEach((user) => {
      const uniqueNumber = parseInt(user.unique.substr(2), 10)
      if (max < uniqueNumber) max = uniqueNumber
    })
    return max + 1
  }
}
