import express, { NextFunction, Request, RequestHandler, Response } from 'express';
import multer from 'multer';
import { CommonMiddleware } from './common.middleware';
import path from 'path';
import { FileModel, File } from './common.model';
import FileManipulation from '../lib/file.lib';
import aws from 'aws-sdk';
import multerS3 from 'multer-s3';
import util from 'util';


export abstract class CommonRoute {
     name: String;
     app: express.Application;
     middleware: CommonMiddleware;
     upload: multer.Multer;
     uploadS3: multer.Multer;
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
          this.upload = multer({ dest: __filepath__, limits: { fileSize: this.fileSize, files: this.filesCount } });
          this.uploadS3 = multer(this.s3Config()!)
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

     s3Config() {
          try {
               const s3: aws.S3 = new aws.S3({
                    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
                    region: process.env.BUCKETEER_AWS_REGION
               })
               const storage = multerS3({
                    s3: s3,
                    bucket: process.env.BUCKETEER_BUCKET_NAME || '',
                    contentType: multerS3.AUTO_CONTENT_TYPE,
                    metadata: function (req, file, cb) {
                         cb(null, { fieldName: file.fieldname });
                    },
                    key: function (req, file, cb) {
                         cb(null, Date.now().toString()+(Math.random()*1000000000))
                    }
               });

               const limit = { fileSize: this.fileSize, files: this.filesCount }
               return {storage, limit}
          }
          catch (err) {
          }
     }

     async uploadFilesAWS() {
          try {
               const upload = this.uploadS3.any();
               this.app.post('/file/uploadAWS',
                    this.middleware.authorized,
                    this.middleware.authenticate,
                    upload,
                    async (req: Request, res: Response, next: NextFunction) => {
                         try {
                              if ((req?.files as Array<any>)[0]) {
                                   const files = (req.files as Array<any>).map((value) => {
                                        return {
                                             key: value.key,
                                             location: value.location,
                                             bucket:value.bucket
                                        }
                                   })
                                   const filesDoc: File[] = await FileModel.insertMany(files);
                                   res.status(200).send({ status: true, message: "success", data: filesDoc })
                              }
                         }
                         catch (err) {
                              next(err)
                         }
                    })
          }
          catch (err) {
          }
     }

     async getFilesAWS(authMiddleware?: RequestHandler) {
          try {
               const s3: aws.S3 = new aws.S3({
                    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
                    region: process.env.BUCKETEER_AWS_REGION
               })

               this.app.get('/fileAWS/:fileId',
                    this.middleware.authorized,
                    authMiddleware || this.middleware.authenticate,
                    async (req: Request, res: Response, next: NextFunction) => {
                         try {
                              const { params } = req;
                              const files = await FileModel.findById(params.fileId);
                              if (files) {
                                   s3.getObject({
                                        Key: files?.key || '',
                                        Bucket: files?.bucket || ''
                                   }, (error, data) => {
                                        if (data) res.status(200).send({ status: true, message: "success", data: data });
                                        else res.status(200).send({ status: true, message: "success", data: '' });
                                   });
                              }
                              else res.status(404).send({ status: false, message: "file not found"})
                         }
                         catch (err) {
                              next(err)
                         }
                    }
               )
          }
          catch (err) {
          }
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