import Handler from './Handler'
import * as core from 'express-serve-static-core'
import DataManager, { Hospital } from '../DataManager'
import LoginHandler from './LoginHandler'

export default class HospitalHandler extends Handler {
  static addListener (app: core.Express) {
    app.get('/hospital/info', (req, res) => this.getHospitalInfo(req, res))
    app.post('/hospital/comment', (req, res) => this.postComment(req, res))
  }

  static getHospitalInfo (req: core.Request, res: core.Response) {
    const id = parseInt(req.query.id, 10)
    if (!DataManager.hospitalData[id]) {
      DataManager.hospitalData[id] = { comments: [] }
    }
    const result = DataManager.hospitalData[id]
    const newResult: { id: string, contents: string, rating: number }[] = []
    result.comments.forEach((comment) => {
      const newComment = { id: 'unknown', contents: comment.contents, rating: comment.rating }
      for (const user of DataManager.userData) {
        if (user.unique === comment.unique) {
          newComment.id = user.id
          break
        }
      }
      newResult.push(newComment)
    })
    res.send({ success: true, result: newResult })
    res.end()
  }

  static postComment (req: core.Request, res: core.Response) {
    const user = LoginHandler.getUser(req)
    if (!user) {
      res.send({ success: false })
      res.end()
      return
    }
    const contents = req.body.contents as string
    const rating = parseFloat(req.body.rating)
    if (isNaN(rating)) {
      res.send({ success: false })
      res.end()
      return
    }
    const id = parseInt(req.body.id, 10)
    if (isNaN(id)) {
      res.send({ success: false })
      res.end()
      return
    }
    if (!DataManager.hospitalData[id]) {
      DataManager.hospitalData[id] = { comments: [] }
    }
    DataManager.hospitalData[id].comments.push({ unique: user.unique, contents, rating })
    DataManager.saveHospitalData()
    res.send({ success: true })
    res.end()
  }
}
