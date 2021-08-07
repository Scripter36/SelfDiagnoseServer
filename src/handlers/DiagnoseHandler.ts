import Handler from './Handler'
import * as core from 'express-serve-static-core'
import * as tf from '@tensorflow/tfjs-node'
import DataManager from '../DataManager'
import LoginHandler from './LoginHandler'

const inputSize = 832

export default class DiagnoseHandler extends Handler {
  private static model: tf.LayersModel | null = null

  static async addListener (app: core.Express) {
    this.model = await tf.loadLayersModel('file://model_deep1_bigger_v1/model.json')

    app.get('/submit', (req, res) => this.submit(req, res))
    app.get('/diagnose/data', (req, res) => this.getDiagnoseData(req, res))
    app.get('/user/diagnoselist', (req, res) => this.getDiagnoseList(req, res))
  }

  static async submit (req: core.Request, res: core.Response) {
    if (this.model === null) {
      res.sendStatus(403).send('Forbidden')
      res.end()
      return
    }
    const symptoms = JSON.parse(req.query.symptoms) as number[]
    const data = new Array(inputSize).fill(0)
    symptoms.forEach(symptom => data[symptom] = 1)
    const prediction = this.model.predict(tf.tensor2d(data, [1, inputSize])) as tf.Tensor<tf.Rank>
    const posibilities = (await prediction.array() as number[][])[0]
    const beforeSort: { posibility: number, index: number }[] = []
    posibilities.forEach((posibility, index) => {
      beforeSort.push({ posibility, index })
    })
    const afterSort = beforeSort.sort((a, b) => {
      return b.posibility - a.posibility
    })
    const result: { posibility: number, index: number }[] = []
    for (let i = 0; i < 5; i++) {
      result.push(afterSort[i])
    }
    const user = LoginHandler.getUser(req)
    DataManager.diagnoseData.push({ unique: user ? user.unique : 'G', data: result, symptoms, date: this.getDate() })
    DataManager.saveDiagnoseData()
    res.redirect(`/result?id=${DataManager.diagnoseData.length - 1}`)
    res.end()
  }

  static getDate () {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  }

  static getDiagnoseData (req: core.Request, res: core.Response) {
    const id = parseInt(req.query.id, 10)
    res.send({ success: true, result: DataManager.diagnoseData[id].data })
    res.end()
  }

  static getDiagnoseList (req: core.Request, res: core.Response) {
    const user = LoginHandler.getUser(req)
    const list: {index: number, data: { posibility: number, index: number }[], symptoms: number[], date: string }[] = []
    if (user) {
      DataManager.diagnoseData.forEach((diagnose, index) => {
        if (diagnose.unique === user.unique) list.push({ index, data: diagnose.data, symptoms: diagnose.symptoms, date: diagnose.date })
      })
      res.send({ success: true, list })
      res.end()
    } else {
      res.send({ success: false })
      res.end()
    }
  }
}
