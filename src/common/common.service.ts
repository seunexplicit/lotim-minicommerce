import mailgun from 'mailgun-js';
import util from 'util';
import { FileModel, File } from './common.model';

export class MailService {

     mail: mailgun.Mailgun;
     from: string;

     constructor() {
          this.mail = new mailgun({ apiKey:process.env.MAILGUN_PUBLIC_APIKEY||'', domain: process.env.MAILGUN_DOMAIN||'' })
          this.from = process.env.MAILGUN_FROM ?? '';
     }

     async sendMessage(to:string|string[], text:string, subject?:string, from?:string) {
          try {
               return await this.mail.messages().send({ to, text, subject, from: from || this.from })
          }
          catch(err) {
               throw err;
          }
     }
     async sendMessageWAttachment(to: string | string[], text: string, attachment:any|any[], subject?: string, from?: string) {}
     async sendHTMLMessage() {

     }
     async sendHTMLMessageWAttachment() { }

     async removeSimilarFile(file: File[]) {
          try {

          }
          catch (err) {
               throw err
          }
     }
}



//export class