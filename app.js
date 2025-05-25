import express from 'express';
import {sendConnectionRequests} from "./src/connection.js";

const app = express();
const port = process.env.PR_PORT || 3500;

app.set('view engine', 'ejs');
app.set('views', './src');

app.use(express.json());

app.get('/', (req, res) => {
    res.render('main', { title: 'Main Page', message: 'Welcome to the Main Page!' });
});
app.post('/send-request', (req, res) => {
    sendConnectionRequests(req.body);
    console.log('Request received');
});

app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).render('error', {
        title: 'Global Error',
        text: `${err.stack}`
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${port}`);
});
