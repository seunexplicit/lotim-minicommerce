import fs from 'fs';
import util from 'util';

export default class FileManipulation {
     renameFile(path:string, newname:string) {
     }

     async deleteFile(path: string) {
          try {
               const deleteFile = util.promisify(fs.unlink);
               await deleteFile(path);
               return true;
          }
          catch (err) {
               return false;
          }
     }

     fileExist(path:string) {
          try {
               return fs.existsSync(path);
          }
          catch (err) {
               return false;
          }
     }

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

     appendFile() { }

     async compareFile(pathOne: string, pathTwo: string) {
          try {
               const fileOne = await this.getFile(pathOne);
               const fileTwo = await this.getFile(pathTwo);
               let compareResult:any = {same:0, difference:0};
               fileOne.forEach((value, index) => {
                    if (value === fileTwo[index]) compareResult.same++;
                    else if (compareResult.difference === 0) {
                         compareResult["divergentPoint"] = index;
                         compareResult.difference++;
                    }
                    else compareResult.difference++
               })
               compareResult = {
                    ...compareResult,
                    fileOneLength: fileOne.byteLength,
                    fileTwoLength: fileTwo.byteLength,
                    result: compareResult.same / fileOne.byteLength
               }
               return compareResult;
          }
          catch (err) {

          }
     }
}