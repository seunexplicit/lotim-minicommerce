import { OrderProduct } from "../users/users.model";

export const RandomValue = (type: 'number' | 'alphabet' | 'alphanumeric', length: number) => {
     let [lower, upper] = [48, 57];
     if (type == 'alphabet') [lower, upper] = [65, 90];
     else if (type == 'alphanumeric') [lower, upper] = [32, 90];
     let randomValue = '';

     while (randomValue.length !== length) {
          const code = Math.floor(Math.random() * (upper - lower)) + lower;
          if (![32, 34, 39, 42, 43, 44, 45].includes(code) && (code < 58 || code > 64)) {
               const rand = Math.floor(Math.random() * 3) + 1;
               randomValue += rand == 3 ? String.fromCodePoint(code) : String.fromCodePoint(code).toLocaleLowerCase();
          }
     }

     return randomValue;
}

export const calculateTotalPrice = (order:OrderProduct)=>{    
     const cost = order.discount ? Number(order.price) - (Number(order.discount) * Number(order.price)) : Number(order.price)
     return { cost, totalCost:cost*order.quantity }
     
}