import { request } from "http";

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
			var httpReq = request(option1);
			httpReq.on('response', (response) => {
				response.on('data', (chunk) => {
					reply += chunk.toString();
				});
				response.on('end', () => {
					resolve(JSON.parse(reply))
				});
			});

			httpReq.on('error', (error) => {
				reject(error);
			});
		});
	}
	catch (err) {

     }
}
