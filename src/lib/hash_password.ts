import crypto from 'crypto';

export default function (password: string) {
     return crypto.createHash('sha512')
          .update(password)
          .digest('hex')
}