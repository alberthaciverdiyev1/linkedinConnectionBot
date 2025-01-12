import express from 'express';





const app = express();
const port = process.env.PR_PORT || 3000;


app.set('view engine', 'ejs');
app.set('views', './src/Views');


app.use(express.json());
app.use('/', routes);
app.use((req, res, next) => { res.status(404).send('404 Not Found'); next(); });

app.use(async (err, req, res, next) => {
    const errorData = {
        title: 'Global Error',
        text: `${err.stack}`
    };
console.log(errorData);
    res.status(500).send('Something went wrong!');
});




app.listen(port, '0.0.0.0', () => { console.log(`Server is running at http://localhost:${port}`); });

