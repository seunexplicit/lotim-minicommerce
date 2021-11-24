
import mailgun from 'mailgun-js';
import { ProductsModel } from 'src/products/products.model';
import { OrderProduct, Orders } from 'src/users/users.model';
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


export const productResetByCancelOrder = async (order:Orders, body:any)=>{
     try{
          const products = await ProductsModel.find({
               _id: {
                    $in: [...(order.orders?.map((value: OrderProduct) => value.product))]
               }
          });

          products.forEach((product, productIndex)=>{
               const productOrder = order.orders?.find(each=>each.product==product._id)
               product.varieties?.forEach((variety, varietyIndex)=>{
                    if((variety as any)?._id===productOrder?.variety){
                         if(body.staus==='cancel') products[productIndex].varieties[varietyIndex].canceledOrder++
                         else if(body.staus==='rejected') products[productIndex].varieties[varietyIndex].rejectedOrder++
                         else if(body.staus==='completed') products[productIndex].varieties[varietyIndex].completedOrder++

                         if(body.status==='cancel'||body.status==='rejected'){
                              if(variety.discount){
                                   const discount = products[productIndex].varieties[varietyIndex].discount!
                                   if(discount>productOrder!.quantity){
                                        (products[productIndex].varieties[varietyIndex].discount as number)-= productOrder!.quantity
                                   }
                                   else{
                                        (products[productIndex].varieties[varietyIndex].discount as number)=0;
                                        (products[productIndex].varieties[varietyIndex].quantity as number)+=(productOrder!.quantity - Math.abs(discount))
                                   }
                                   
                              } else (products[productIndex].varieties[varietyIndex].quantity as number)+=productOrder!.quantity
                              
                              if(order.paid){
                                   products[productIndex].varieties[varietyIndex].totalPurchasedPrice-=productOrder!.price
                              }
                         }
                    }
               })
               products[productIndex].save()
          })
     }
     catch(err:any){
          throw new err
     }
}