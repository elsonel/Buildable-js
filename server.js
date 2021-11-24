/* server.js - Express server*/
'use strict';

const express = require('express')
const app = express();

const path = require('path');

// Setting up a static directory for the files in /pub
app.use(express.static(path.join(__dirname, '/pub')))

app.get('/', function(req, res) {
    res.sendFile('/pub/examples.html', { root: __dirname });
});

/*

app.get('/', (req, res) => {
	// sending a string
	//res.send('This should be the root route!')

	//sending some HTML
	res.send('<h1>This should be the root route!</h1>')
})

// Sending some JSON
app.get('/someJSON', (req, res) => {
	// object converted to JSON string
	res.send({
		name: 'John',
		year: 3,
		courses: ['csc309', 'csc301']
	})
})*/

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}...`));


