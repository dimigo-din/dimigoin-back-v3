import express from 'express'
import mongoose from 'mongoose'

import bodyParser from 'body-parser'
import cors from 'cors'
import bearerToken from 'express-bearer-token'
import fileUpload from 'express-fileupload'
import helmet from 'helmet'
import { AttachUserInfo, ErrorHandler } from './middlewares'
import controllers from './controllers'

class App {
  public app: express.Application;

  constructor() {
    this.app = express()
    this.initializeMiddlewares()
    this.connectMongoDB()
    this.initializeRouter()
    this.initializeErrorhandlers()
  }

  private initializeRouter() {
    const router: express.Router = express.Router()
    controllers.forEach((controller) => {
      this.app.use(controller.basePath, controller.router)
    })
    this.app.use(router)
  }

  private initializeMiddlewares() {
    this.app.use(helmet())
    this.app.use(cors())
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(fileUpload())

    this.app.use(bearerToken({
      headerKey: 'Bearer',
      reqKey: 'token',
    }))
    this.app.use(AttachUserInfo)
  }

  private initializeErrorhandlers() {
    this.app.use(ErrorHandler)
  }

  private connectMongoDB() {
    const {
      MONGO_PATH,
      MONGO_PORT,
      MONGO_NAME,
      MONGO_ID,
      MONGO_PW,
    } = process.env;
    const mongooseOption = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    };
    mongoose.connect(`mongodb://${MONGO_ID}:${MONGO_PW}@${MONGO_PATH}:${MONGO_PORT}/${MONGO_NAME}`, mongooseOption)
  }
}

export default App
