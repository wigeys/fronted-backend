const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/submit', (req, res) => {
    const formData = req.body;
    const recaptchaToken = req.body['g-recaptcha-response'];
    const secretKey = '6Les7-cpAAAAAOD7-x8pPHZQW8jEPOVfFNbqokLi';

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    axios.post(verifyUrl)
        .then(response => {
            if (response.data.success) {
                fs.readFile('bd.json', 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Ошибка при чтении файла базы данных.');
                    }
                    let database = JSON.parse(data);
                    database.push(formData);
                    fs.writeFile('bd.json', JSON.stringify(database, null, 2), (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send('Ошибка при записи в файл базы данных.');
                        }
                        res.redirect('index.html');
                    });
                });
            } else {
                return res.status(400).send('Ошибка проверки reCAPTCHA.');
            }
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send('Ошибка при проверке reCAPTCHA.');
        });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
