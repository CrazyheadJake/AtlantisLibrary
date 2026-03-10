import express from 'express'
import path from 'path'
import hbs from 'express-handlebars'
import { pool, resetDb, getAuthors, getBooks, getGenres, getMembers, insertBook, getBorrows, getFullBorrows} from './db.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
    res.render('books', { currentPage: 'Books', authors, books, genres, booksJSON: JSON.stringify(books) })
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
    const borrows = await getBorrows()
    res.render('borrows', { currentPage: 'Borrows', books, members, borrows, borrowsJSON: JSON.stringify(await getFullBorrows()) })
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

app.post('/authors', async (req, res) => {
    await pool.query('CALL insert_author(?, ?, ?);', [req.body.firstName, req.body.lastName, req.body.bio]);
    res.redirect('/authors');
});

app.post('/members', async (req, res) => {
    await pool.query('CALL insert_member(?, ?, ?);', [req.body.firstName, req.body.lastName, req.body.email]);
    res.redirect('/members');
});

app.post('/genres', async (req, res) => {
    await pool.query('CALL insert_genre(?);', [req.body.genreName]);
    res.redirect('/genres');
});

app.post('/borrows', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query(
            'CALL insert_borrow(?, ?, ?, @borrowID);', 
            [req.body.member, req.body.startTime, req.body.dueTime]
        );
        
        const rows = await connection.query('SELECT @borrowID AS borrowID;');
        const borrowID = rows[0].borrowID;
        for (const bookID of req.body.books) {
            await pool.query('CALL add_book_to_borrow(?, ?);', [borrowID, bookID]);
        }
        res.redirect('/borrows');
    } catch (err) {
        console.error("Error processing borrow: ", err);
    } finally {
        if (connection) connection.release();
    }
});

app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
)
