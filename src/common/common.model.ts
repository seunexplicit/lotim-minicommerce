import { Schema, model, Document, Model, Query } from 'mongoose';

export interface File extends Document, Express.Multer.File {
     location?: string,
     key?: string,
     bucket?:string
}

const FileSchema = new Schema<File>({
     fieldname: String,
     originalname: String,
     mimetype: String,
     size: String,
     destination: String,
     filename: String,
     path: String,
     location: String,
     key: String,
     bucket:String,
});

export const FileModel = model<File>('File', FileSchema);
