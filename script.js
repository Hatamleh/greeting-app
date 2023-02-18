const form = document.getElementById('form');
const body = document.getElementsByTagName('body')[0];

async function handleSubmit(event) {
	event.preventDefault();
	const status = document.getElementById('my-form-status');
	const data = new FormData(event.target);
	const username = data.get('username');
	const password = data.get('password');
	const email = data.get('email');

	if (username.length < 3) {
		status.innerHTML = 'Please enter a valid username';
		return;
	}

	if (password.length < 8) {
		status.innerHTML = 'Please enter a valid password';
		return;
	}

	fetch('http://localhost:8080/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			email,
			username,
			password,
		}),
	}).then((response) => {
		if (response.ok) {
			form.reset();
			location.reload();
		}
		if (response.status === 400) {
			status.innerHTML = 'Email is already regsitered in the DB';
			form.reset();
		}
	});
}

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

function deleteAllCookies() {
	const cookies = document.cookie.split(';');

	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i];
		const eqPos = cookie.indexOf('=');
		const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
		document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
	}
}

async function checkToken() {
	const token = getCookie('access_token');
	const header = document.getElementById('header');
	if (token) {
		const response = await fetch('http://localhost:8080/name', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				authorization: `bearer ${token}`,
			},
		});

		const data = await response.json();
		const name = data.name;
		console.log(name);
		const displayedName = name.length >= 7 ? 'User' : name;

		form.style.display = 'none';
		header.innerHTML = `${getWelcome()} ${displayedName}!`;
		const signoutButton = createButton();
		body.append(signoutButton);

		signoutButton.addEventListener('click', () => {
			deleteAllCookies();
			location.reload();
		});
	}
}

function createButton() {
	const button = document.createElement('button');
	button.setAttribute('class', 'signout');
	button.innerHTML = 'Signout';
	return button;
}

const getWelcome = () => {
	const currentHour = new Date().getHours();

	if (currentHour >= 0 && currentHour <= 5) {
		return 'Good night';
	}
	if (currentHour > 5 && currentHour <= 12) {
		return 'Good morning';
	}

	if (currentHour > 12 && currentHour <= 17) {
		return 'Good afternoon';
	}

	if (currentHour > 17) {
		return 'Good Evening';
	}
};

document.onload = checkToken();

form.addEventListener('submit', handleSubmit);
