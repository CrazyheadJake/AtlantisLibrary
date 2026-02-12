const express = require('express')
const path = require('path')
const hbs = require('express-handlebars')

const app = express()
const PORT = 5173

app.use(express.static(path.join(__dirname, '../public')));
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '../views/layouts'),
    partialsDir: path.join(__dirname, '../views/partials'),
    helpers: {
        navActive: (targetPage, currentPage) => {
            console.log(`Comparing targetPage: ${targetPage} with activePage: ${currentPage}`);
            return targetPage === currentPage ? 'active' : '';
        }
    }
}))

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

app.get('/', (req, res) => {
    res.render('home', { currentPage: 'Home' })
})

app.get('/authors', (req, res) => {
    res.render('authors', { currentPage: 'Authors' })
})

app.get('/books', (req, res) => {
    res.render('books', { currentPage: 'Books' })
})

app.get('/members', (req, res) => {
    res.render('members', { currentPage: 'Members' })
})

app.get('/genres', (req, res) => {
    res.render('genres', { currentPage: 'Genres' })
})

app.get('/borrows', (req, res) => {
    res.render('borrows', { currentPage: 'Borrows' })
})

app.post('/reset', (req, res) => {
    res.redirect('/');
})
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
)
