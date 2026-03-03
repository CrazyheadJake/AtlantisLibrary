const express = require('express')
const path = require('path')
const hbs = require('express-handlebars')
const { pool, resetDb, getAuthors, getBooks, getGenres, getMembers, insertBook } = require('./db')

const app = express()
const PORT = 5172

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')))
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '../views/layouts'),
    partialsDir: path.join(__dirname, '../views/partials'),
    helpers: {
        navActive: (targetPage, currentPage) => {
            return targetPage === currentPage ? 'active' : ''
        }
    }
}))

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, '../views'))

app.get('/', (req, res) => {
    res.render('home', { currentPage: 'Home' })
})

app.get('/authors', async (req, res) => {
    const authors = await getAuthors()
    res.render('authors', { currentPage: 'Authors', authors })
})

app.get('/books', async (req, res) => {
    const authors = await getAuthors()
    const books = await getBooks()
    const genres = await getGenres()
    res.render('books', { currentPage: 'Books', authors, books, genres })
})

app.get('/members', async (req, res) => {
    const members = await getMembers()
    res.render('members', { currentPage: 'Members', members })
})

app.get('/genres', async (req, res) => {
    const genres = await getGenres()
    res.render('genres', { currentPage: 'Genres', genres })
})

app.get('/borrows', async (req, res) => {
    const books = await getBooks()
    const members = await getMembers()
    res.render('borrows', { currentPage: 'Borrows', books, members })
})

app.post('/reset', async (req, res) => {
    await resetDb()
    res.redirect('/')
})

app.post('/books', async (req, res) => {
    const { title, author, genre } = req.body
    console.log("Inserting book: ", title, author, genre)
    await insertBook(title, author, genre)
    res.redirect('/books')
})

app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
)
