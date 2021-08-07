import * as fs from 'fs'
import path from 'path'

export interface Diagnose {
  unique: string
  data: { posibility: number, index: number }[],
  symptoms: number[],
  date: string
}

export interface User {
  unique: string
  id: string
  password: string
  token?: string
}

export interface Comment {
  unique: string
  contents: string
  rating: number
}

export interface Hospital {
  comments: Comment[]
}

export default class DataManager {
  public static diagnoseData: Diagnose[] = []
  public static userData: User[] = []
  public static hospitalData: Hospital[] = []
  static init () {
    this.loadDiagnoseData()
    this.loadUserData()
    this.loadHospitalData()
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

  static saveHospitalData () {
    fs.writeFileSync(path.resolve('data/hospitalData.json'), JSON.stringify(this.hospitalData))
  }

  static loadHospitalData () {
    this.hospitalData = JSON.parse(fs.readFileSync(path.resolve('data/hospitalData.json')).toString())
  }
}
