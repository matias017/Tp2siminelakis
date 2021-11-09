import express from 'express';
import joi from 'joi';
import datapayments from '../data/payments';
import auth from '../middleware/auth.js';
let router = express.Router();

/* Post payment. */
router.post('/', auth.auth, async (req, res) => {
	const schema = joi.object({
		trxAmount: joi
			.object({
				total: joi.number().positive().required(),
				currency: joi.string().alphanum().required().max(3)
			})
			.required(),
		paymentCard: joi
			.object({
				cardNumber: joi.number().positive().required(),
				expiryMonth: joi.number().positive().min(1).max(12).required(),
				expiryYear: joi.number().positive().min(2021).required(),
				cardCode: joi.number().min(100).max(9999).required()
			})
			.required(),
		shippingDetails: {
			address: joi.string().required(),
			city: joi.string().required(),
			state: joi.string().required(),
			zipCode: joi.string().required()
		},
		billingDetails: {
			address: joi.string().required(),
			city: joi.string().required(),
			state: joi.string().required(),
			zipCode: joi.string().required()
		}
	});
	const result = schema.validate(req.body);

	if (result.error) {
		res.status(400).send(result.error.details[0].message);
	} else {
		let payment = req.body;
		//En el orders tendría que agarrar la respuesta del startTrx (que va a
		//ser el response del gateway) y tomar el res.body.result, res.body.orderId y así.
		let result = await datapayments.addpayments(payment);
		res.status(200).json(result);
	}
});
g
export default router;
