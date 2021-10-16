import express, { NextFunction, Request, RequestHandler, Response } from 'express';
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
                                   const filesDoc: File[] = await FileModel.insertMany(files);
                                   for (let file of filesDoc) {
                                        const relatedFiles: File[] = await FileModel.find({ originalname: file.originalname });

                                        if (relatedFiles.length > 1) {
                                             const compareResult = await (new FileManipulation()).compareFile(
                                                  file.path || '',
                                                  (relatedFiles.find(each => each._id !== file._id && (new FileManipulation()).fileExist(each.path)))?.path || ''
                                             )
                                             if (compareResult && compareResult.result > 0.8 && file.path) {
                                                  const fileIndex = filesDoc.findIndex(each => each._id == file._id);
                                                  filesDoc[fileIndex] = relatedFiles.find(each => each._id !== file._id && (new FileManipulation()).fileExist(each.path)) || new FileModel();
                                                  FileModel.deleteOne({ _id: file._id });
                                                  (new FileManipulation()).deleteFile(file.path);
                                             }
                                             console.log(compareResult, "comapreResult result");
                                        }
                                   }
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

     async getFiles(authMiddleware?: RequestHandler) {
          try {
               this.app.get('/file/:fileId',
                    this.middleware.authorized,
                    authMiddleware||this.middleware.authenticate,
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