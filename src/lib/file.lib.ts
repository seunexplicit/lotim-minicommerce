import fs from 'fs';
import util from 'util';

export default class FileManipulation {
     renameFile(path:string, newname:string) {
     }

     deleteFile(path: string) { }

     async getFile(path: string) {
          try {
               const readFile = util.promisify(fs.readFile);
               const file = await readFile(path);
               return file;
          }
          catch (err) {
               throw err;
          }
     }

     appendFile() {}
}