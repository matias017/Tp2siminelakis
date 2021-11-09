import dataProduct from '../data/products.js';
import express from 'express';
import joi from 'joi';
import auth from '../middleware/auth.js';
let router = express.Router();

router.get('/', async function (req, res) {
	const products = await dataProduct.getProducts();
	if (products) {
		res.json(products);
	} else {
		res.status(404).send('error ');
	}
});

router.get('/:id', async (req, res) => {
	const product = await dataProduct.getProduct(req.params.id);
	if (product) {
		res.json(product);
	} else {
		res.status(404).send('Producto no encontrado');
	}
});

router.get('/go-to/checkout', auth.auth, (req, res) => {
	res.send(true)
})

router.post('/', auth.authAdmin, async (req, res) => {
	const schema = joi.object({
		// Los campos name, description y brand van sin el alphanum() de joi para que se puedan contemplar espacios en la cadena
		name: joi.string().min(3).required(),
		description: joi.string().min(3).required(),
		price: joi.number().min(0, 0).required(),
		stock: joi.number().min(1).required(),
		brand: joi.string().min(3).required(),
		imageUrl: joi.string().uri().required(),
		categories: joi.array().items(joi.string().min(3).required())
	});
	const result = schema.validate(req.body);
	console.log(result);
	if (result.error) {
		res.status(400).send(result.error.details[0].message);
	} else {
		let product = req.body;
		console.log(product);
		await dataProduct.addProduct(product);
		res.status(200).json(product);
	}
});

router.put('/:id', async (req, res) => {
	const schema = joi.object({
		name: joi.string().min(3).required(),
		description: joi.string().min(3).required(),
		price: joi.number().min(0, 0).required(),
		stock: joi.number().min(1).required(),
		brand: joi.string().min(3).required(),
		imageUrl: joi.string().uri().required(),
		categories: joi.array().items(joi.string().min(3).required())
	});
	const result = schema.validate(req.body);
	if (result.error) {
		res.status(400).send(result.error.details[0].message);
	} else {
		let product = req.body;
		product._id = req.params.id;
		dataProduct.updateProduct(product);
		res.json(product);
	}
});

router.delete('/:id', async (req, res) => {
	const product = await dataProduct.getProduct(req.params.id);
	if (!product) {
		res.status(404).send('Producto no encontrado');
	} else {
		dataProduct.deleteProduct(req.params.id);
		res.status(200).send('Producto eliminado');
	}
});

export default router;