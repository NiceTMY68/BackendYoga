const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
const port = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
    db.get("SELECT 1", (err, result) => {
        if (err) {
            res.status(500).json({ status: 'error', message: 'Database connection failed' });
            return;
        }
        res.json({ status: 'success', message: 'Database connected successfully' });
    });
});

app.use(cors());
app.use(bodyParser.json());

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
