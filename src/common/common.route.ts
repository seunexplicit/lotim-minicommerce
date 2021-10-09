import express, { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { CommonMiddleware } from './common.middleware';
import path from 'path';
import { FileModel, File } from './common.model';
import FileManipulation from '../lib/file.lib';


export abstract class CommonRoute {
     name: String;
     app: express.Application;
     middleware: CommonMiddleware;
     upload: multer.Multer;
     fileSize: number = Number(process.env.CLIENT_FILE_SIZE);
     filesCount: number = Number(process.env.CLIENT_FILE_COUNT);

     constructor(
          app: express.Application,
          name: String,
          middleware: CommonMiddleware
     ) {
          this.app = app;
          this.name = name;
          this.middleware = middleware;
          this.configureRoutes();
          const __filepath__ = path.resolve(__dirname, '../public/files');
          this.upload = multer({ dest: __filepath__, limits: { fileSize: this.fileSize, files: this.filesCount } })
     }

     getName() {
          return this.name;
     }

     set fileOpts({ fileSize, filesCount }) {
          this.fileSize = fileSize;
          this.filesCount = filesCount;
     }

     get fileOpts() {
          return { fileSize: this.fileSize, filesCount: this.filesCount }
     }

     async uploadFiles() {
          try {
               const upload = this.upload.any()
              this.app.post('/file/upload',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    upload,
                    async (req: Request, res: Response, next: NextFunction) => {
                         try {
                              const files: Express.Multer.File[] = (req['files'] ?? []) as Express.Multer.File[];
                              if (files[0]) {
                                   const filesDoc: File[] = await FileModel.insertMany(files)
                                   res.status(200).send({
                                        status: true, data: filesDoc.map((value) => {
                                             return {
                                                  _id: value._id,
                                                  filename: value.filename,
                                                  originalname: value.originalname,
                                                  mimetype: value.mimetype,
                                                  destination: value.destination
                                             }
                                        })
                                   })
                              }
                         }
                         catch (err) {
                              next(err);
                         }
                   })
          }
          catch (err) {}
     }

     async getFiles() {
          try {
               this.app.get('/file/:fileId',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    async (req: Request, res: Response, next: NextFunction) => {
                         const { params } = req;
                         const file = await FileModel.findById(params.fileId);
                         const fileBuffer = await new FileManipulation().getFile(file?.path ?? '');
                         res.status(200).send({ status: true, data: fileBuffer })
                    }
               )
          }
          catch (err) {
          }
     }

     abstract configureRoutes(): express.Application
}