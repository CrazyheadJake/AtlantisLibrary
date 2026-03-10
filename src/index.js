import express from 'express'
import path from 'path'
import hbs from 'express-handlebars'
import { pool, resetDb, getAuthors, getBooks, getGenres, getMembers, insertBook, getBorrows, getFullBorrows} from './db.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { error } from 'console';

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
    res.render('authors', { currentPage: 'Authors', authors, error: req.query.error })
})

app.get('/books', async (req, res) => {
    const [authors, books, genres] = await Promise.all([
        getAuthors(),
        getBooks(),
        getGenres()
    ]);
    res.render('books', { currentPage: 'Books', authors, books, genres, booksJSON: JSON.stringify(books), error: req.query.error})
})

app.get('/members', async (req, res) => {
    const members = await getMembers()
    res.render('members', { currentPage: 'Members', members })
})

app.get('/genres', async (req, res) => {
    const genres = await getGenres()
    res.render('genres', { currentPage: 'Genres', genres, error: req.query.error })
})

app.get('/borrows', async (req, res) => {
    const [books, members, borrows, fullBorrows] = await Promise.all([
        getBooks(),
        getMembers(),
        getBorrows(),
        getFullBorrows()
    ]);
    res.render('borrows', { currentPage: 'Borrows', books, members, borrows, borrowsJSON: JSON.stringify(fullBorrows), error: req.query.error })
})

app.post('/reset', async (req, res) => {
    await resetDb()
    res.redirect('/')
})

app.post('/books', async (req, res) => {
    if (!req.body.title || !req.body.author || !req.body.genre) {
        res.redirect('/books?error=Please+fill+in+all+fields');
        return;
    }
    const { title, author, genre } = req.body
    await insertBook(title, author, genre)
    res.redirect('/books')
})

app.post('/authors', async (req, res) => {
    try {
        await pool.query('CALL insert_author(?, ?, ?);', [req.body.firstName, req.body.lastName, req.body.bio]);
        res.redirect('/authors');
    } catch (error) {
        console.error("Error inserting author: ", error);
        res.redirect('/authors?error=You cannot insert a duplicate author');
    }
});

app.post('/members', async (req, res) => {
    await pool.query('CALL insert_member(?, ?, ?);', [req.body.firstName, req.body.lastName, req.body.email]);
    res.redirect('/members');
});

app.post('/genres', async (req, res) => {
    try {
        if (!req.body.genreName) {
            res.redirect('/genres?error=Please+fill+in+all+fields');
            return;
        }
        await pool.query('CALL insert_genre(?);', [req.body.genreName]);
    }
    catch (error) {
        res.redirect('/genres?error=You cannot insert a duplicate genre');
        return;
    }
    res.redirect('/genres');
});

app.post('/borrows/insert', async (req, res) => {
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
        res.redirect('/borrows?error=Failed+to+insert+borrow.+Please+ensure+all+fields+are+filled+out.');
    } finally {
        if (connection) connection.release();
    }
});

app.post('/borrows/update', async (req, res) => {
    const { editborrowID, editmember, editstartTime, editreturnTime, editdueTime} = req.body
    await pool.query('CALL update_borrow(?, ?, ?, ?, ?);', [editborrowID, editmember, editstartTime, editreturnTime, editdueTime]);

    await pool.query('CALL clear_books_borrows(?);', [editborrowID]);

    let books = req.body.editbookName;
    if (!books) {
        books = [];
    } 
    else if (!Array.isArray(books)) {
        books = [books];
    }
    
    for (const bookID of books) {
        await pool.query('CALL add_book_to_borrow(?, ?);', [editborrowID, bookID]);
    }
    res.redirect('/borrows');
});

app.post('/borrows/delete', async (req, res) => {
    await pool.query('CALL delete_borrow(?);', [req.body.borrow]);
    res.redirect('/borrows');
});

app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
)
