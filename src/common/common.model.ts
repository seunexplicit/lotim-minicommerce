import { Schema, model, Document, Model, Query } from 'mongoose';

export interface File extends Document, Express.Multer.File {
}

const FileSchema = new Schema<File>({
     fieldname: String,
     originalname: String,
     mimetype: String,
     size: String,
     destination: String,
     filename: String,
     path: String
});

export const FileModel = model<File>('File', FileSchema);
