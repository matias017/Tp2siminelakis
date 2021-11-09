import express from 'express';
import joi from 'joi';
import dataUsers from '../data/users.js';
import auth from '../middleware/auth.js';
let router = express.Router();

/* GET users listing. */
router.get('/', auth.authAdmin, async function (req, res, next) {
	const users = await dataUsers.getUsers();
	res.send(users);
});

router.get('/:id', async (req, res) => {
	const user = await dataUsers.getUser(req.params.id);
	if (user) {
		res.json(user);
	} else {
		res.status(404).send('Usuario no encontrado');
	}
});

router.post('/', async (req, res) => {
	const schema = joi.object({
		name: joi.string().alphanum().required(),
		surname: joi.string().alphanum().required(),
		email: joi.string().email().required(),
		username: joi.string().alphanum().min(4).max(20).required(),
		password: joi
			.string()
			.pattern(new RegExp('[a-zA-Z0-9]{3,30}'))
			.required(),
		role: joi.string().alphanum().allow('user', 'admin')
	});
	const body = req.body;

	if (!body.role) {
		body.role = 'user';
	}

	const result = schema.validate(body);

	if (result.error) {
		res.status(400).send(result.error.details[0].message);
	} else {
		let user = body;
		await dataUsers.addUser(user);
		res.status(200).json(user);
	}
});

router.put('/:id', async (req, res) => {
    const schema = joi.object({
        name: joi.string().alphanum().min(3).required(),
        surname: joi.string().alphanum().min(3).required(),
        email: joi.string().email().required(),
        username: joi.string().alphanum().min(4).max(20).required(),
        password: joi
            .string()
            .pattern(new RegExp('[a-zA-Z0-9]{3,30}'))
            .required(),
        role: joi.string().alphanum().allow('user', 'admin')
    });
    const body = req.body;
    const result = schema.validate(body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
    } else {
        let user = body;
    user._id= req.params.id;
        await dataUsers.updateUser(user);
        res.status(200).json(user);
    }
});


router.post('/login', async (req, res) => {
	try {
		const user = await dataUsers.findByCredentials(
			req.body.username,
			req.body.password
		);
		const token = dataUsers.generateAuthToken(user);
		res.send({ user, token });
	} catch (error) {
		res.status(401).send(error.message);
	}
});

router.delete('/:id', auth.authAdmin, async (req, res) => {
	const user = await dataUsers.deleteUser(req.params.id);

	if (!user) {
		res.status(400).send(error.message);
	} else {
		res.json(user);
	}
});

export default router;
