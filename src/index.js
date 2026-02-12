const express = require('express')
const path = require('path');

const app = express();
const PORT = 5723

app.use(express.static(path.join(__dirname, '../public')));

// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })

app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
)
