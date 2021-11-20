import { request } from "https";

export const VerifyPTransaction = async (reference:string)=> {

	try {
		return new Promise((resolve, reject) => {
			var option1 = {
				url: "https://api.paystack.co",
				hostname: 'api.paystack.co',
				port: 443,
				method: 'GET',
				path: '/transaction/verify/' + reference,
				headers: {
					Authorization: 'Bearer ' + process.env.PAYSTACK_PRIVATE_KEY
				}
			}
			var reply = '';
			var httpReq = request(option1, (response) => {
				response.setEncoding('utf8');
				response.on('data', (chunk) => {
					reply += chunk.toString();
				});
				response.on('end', () => {
					resolve(JSON.parse(reply))
				})
			});
			httpReq.on('error', (error) => {
				reject(error);
			});

			httpReq.end()
		});
	}
	catch (err) {
		throw new err
     }
}
