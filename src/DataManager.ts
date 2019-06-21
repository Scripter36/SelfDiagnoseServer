import * as fs from 'fs'
import path from 'path'

export interface Diagnose {
  unique: string
  data: { posibility: number, index: number }[]
}

export interface User {
  unique: string
  id: string
  password: string
  token?: string
}

export default class DataManager {
  public static diagnoseData: Diagnose[] = []
  public static userData: User[] = []
  static init () {
    this.loadDiagnoseData()
    this.loadUserData()
  }

  static saveDiagnoseData () {
    fs.writeFileSync(path.resolve('data/diagnoseData.json'), JSON.stringify(this.diagnoseData))
  }

  static loadDiagnoseData () {
    this.diagnoseData = JSON.parse(fs.readFileSync(path.resolve('data/diagnoseData.json')).toString())
  }

  static saveUserData () {
    fs.writeFileSync(path.resolve('data/userData.json'), JSON.stringify(this.userData))
  }

  static loadUserData () {
    this.userData = JSON.parse(fs.readFileSync(path.resolve('data/userData.json')).toString())
  }
}
