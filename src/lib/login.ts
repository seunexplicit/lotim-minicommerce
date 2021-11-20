import jwt from 'jsonwebtoken';

export default function (
     password: string,
     email: string,
     id: string,
     secondToExp: number,
     secretKey:string
) {
     const expiresTime = new Date(new Date().getTime() + (secondToExp*1000));
     const token = jwt.sign(
          { password, email, id, expiresTime },
          secretKey,
          { expiresIn: secondToExp, algorithm: 'HS256' });
     return { expiresTime, token };
}

export const DecryptToken = (
     token: string,
     secretKey: string,
) => {
     try {
          return jwt.verify(token, secretKey || '');
     }
     catch (err) {
          throw err;
     }
}
