const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const mysql = require('mysql2');
const crypto = require('crypto');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

// Connect to DB
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'TestDB',
});

connection.connect();

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

app.post('/register', async (req, res) => {
	const { username, email, password } = req.body;

	if (!username || !email || !password) {
		return res.status(400).send('Enter a valid data');
	}
	if (username.length < 3) {
		return res.status(400).send('Enter a valid UserName');
	}
	if (password.length < 8) {
		return res.status(400).send('Enter a valid Password');
	}

	// Check if the email exists
	const emailQuery = `SELECT * FROM Users WHERE email="${email}"`;
	connection.query(emailQuery, async function (err, result) {
		if (result.length > 0) {
			return res.status(400).send('Email is already exisits');
		} else {
			//Hash the password
			const sault = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, sault);

			// Save to SQL
			const userId = crypto.randomBytes(16).toString('hex');
			const query = `INSERT INTO Users (id, username, email, password) VALUES ('${userId}', '${username}',  '${email}','${hashedPassword}')`;

			connection.query(query);

			const token = jwt.sign(
				{
					id: userId,
					username,
				},
				'iLoveQAcart'
			);

			res.cookie('access_token', token);
			return res.status(201).json({
				token,
			});
		}
	});
});

app.get('/name', authenticateToken, (req, res) => {
	const query = `SELECT userName FROM Users WHERE id="${req.user.id}"`;
	connection.query(query, function (err, result) {
		return res.status(200).json({
			name: result[0].userName,
		});
	});
});

app.listen(8080, () => console.log('server is up and running'));

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token)
		return res.status(401).json({
			message: 'Unauthorized, please insert a correct token',
		});

	jwt.verify(token, 'iLoveQAcart', (err, user) => {
		if (err)
			return res.status(403).json({
				message: 'Forbidden to access this resource',
			});
		req.user = user;
		next();
	});
}
