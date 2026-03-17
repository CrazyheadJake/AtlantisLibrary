import express from 'express'
import path from 'path'
import hbs from 'express-handlebars'
import { pool, resetDb, getAuthors, getBooks, getGenres, getMembers, insertBook, getBorrows, getFullBorrows} from './db.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Set up the express app to use handlebars and run on a given port
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

/*
Beginning of backend routes 
*/

// Home page
app.get('/', (req, res) => {
    res.render('home', { currentPage: 'Home', success: req.query.success })
})

// Authors page
app.get('/authors', async (req, res) => {
    const authors = await getAuthors()
    res.render('authors', { currentPage: 'Authors', authors, error: req.query.error, success: req.query.success })
})

// Books page
app.get('/books', async (req, res) => {
    const [authors, books, genres] = await Promise.all([
        getAuthors(),
        getBooks(),
        getGenres()
    ]);
    res.render('books', { currentPage: 'Books', authors, books, genres, booksJSON: JSON.stringify(books), error: req.query.error, success: req.query.success })
})

// Members page
app.get('/members', async (req, res) => {
    const members = await getMembers()
    res.render('members', { currentPage: 'Members', members, error: req.query.error, success: req.query.success })
})

// Genres page
app.get('/genres', async (req, res) => {
    const genres = await getGenres()
    res.render('genres', { currentPage: 'Genres', genres, error: req.query.error, success: req.query.success })
})

// Borrows page
app.get('/borrows', async (req, res) => {
    // Get all of these simulatenously from the db rather than waiting one by one
    const [books, members, borrows, fullBorrows] = await Promise.all([
        getBooks(),
        getMembers(),
        getBorrows(),
        getFullBorrows()
    ]);
    res.render('borrows', { currentPage: 'Borrows', books, members, borrows, borrowsJSON: JSON.stringify(fullBorrows), error: req.query.error, success: req.query.success })
})

// Resets the database
app.post('/reset', async (req, res) => {
    await resetDb()
    res.redirect('/?success=Database+reset+successfully')
})

// Insert a book
app.post('/books', async (req, res) => {
    if (!req.body.title || !req.body.author || !req.body.genre) {
        res.redirect('/books?error=Please+fill+in+all+fields');
        return;
    }
    const { title, author, genre } = req.body
    await insertBook(title, author, genre)
    res.redirect('/books?success=Book+inserted+successfully')
})

// Insert an author
app.post('/authors', async (req, res) => {
    try {
        await pool.query('CALL insert_author(?, ?, ?);', [req.body.firstName, req.body.lastName, req.body.bio]);
        res.redirect('/authors?success=Author+inserted+successfully');
    } catch (error) {
        console.error("Error inserting author: ", error);
        res.redirect('/authors?error=You cannot insert a duplicate author');
    }
});

// Insert a member
app.post('/members', async (req, res) => {
    await pool.query('CALL insert_member(?, ?, ?);', [req.body.firstName, req.body.lastName, req.body.email]);
    res.redirect('/members?success=Member+inserted+successfully');
});

// Insert a genre
app.post('/genres', async (req, res) => {
    try {
        // Prevent empty string for a genre
        if (!req.body.genreName) {
            res.redirect('/genres?error=Please+fill+in+all+fields');
            return;
        }
        await pool.query('CALL insert_genre(?);', [req.body.genreName]);
    }
    catch (error) {
        // If there was a duplicate, catch the error cleanly and return an error
        res.redirect('/genres?error=You cannot insert a duplicate genre');
        return;
    }
    res.redirect('/genres?success=Genre+inserted+successfully');
});

// Insert a new borrow
app.post('/borrows/insert', async (req, res) => {
    let connection;
    try {
        // Prevent a borrow with no books selected
        if (!req.body.books) {
            res.redirect('/borrows?error=Please+select+at+least+1+book');
            return;
        }
        // Insert a new borrow with the corresponding member and start/end times
        connection = await pool.getConnection();
        await connection.query(
            'CALL insert_borrow(?, ?, ?, @borrowID);', 
            [req.body.member, req.body.startTime, req.body.dueTime]
        );
        // Add books one by one for each selected book
        const rows = await connection.query('SELECT @borrowID AS borrowID;');
        const borrowID = rows[0].borrowID;
        for (const bookID of req.body.books) {
            await pool.query('CALL add_book_to_borrow(?, ?);', [borrowID, bookID]);
        }
        res.redirect('/borrows?success=Borrow+inserted+successfully');
    } catch (err) {
        // If fields are missing (such as member), return a user readable error
        console.log("Error inserting borrow: ", err);
        res.redirect('/borrows?error=Failed+to+insert+borrow.+Please+ensure+all+fields+are+filled+out.');
    } finally {
        if (connection) connection.release();
    }
});

// Update a borrow with new information
app.post('/borrows/update', async (req, res) => {
    const { editborrowID, editmember, editstartTime, editreturnTime, editdueTime} = req.body
    // Update the member as well as the start, return, and due times
    await pool.query('CALL update_borrow(?, ?, ?, ?, ?);', [editborrowID, editmember, editstartTime, editreturnTime, editdueTime]);

    // Clear all existing books in the borrow and then re-add all of the books selected by the user
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
    res.redirect('/borrows?success=Borrow+updated+successfully');
});

// Delete an existing borrow
app.post('/borrows/delete', async (req, res) => {
    await pool.query('CALL delete_borrow(?);', [req.body.borrow]);
    res.redirect('/borrows?success=Borrow+deleted+successfully');
});

// Start the app
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
)
