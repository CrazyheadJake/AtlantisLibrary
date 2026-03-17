import { createPool } from 'mariadb'
import 'dotenv/config'; 

// Open up a connection pool to the MariaDB database
const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_USERNAME,
    connectionLimit: 5
});
console.log("db: ", process.env.DB_HOST)
console.log("user: ", process.env.DB_USERNAME)
console.log("password: ", process.env.DB_PASSWORD)

// Reset the database to just the original test data
async function resetDb() {
    await pool.query('CALL reset_database();');
}

// Get authors for the authors page
async function getAuthors() {
    const authors = await pool.query('SELECT * FROM Authors;');
    return authors;
}

// Get books as well as their respective authors and genres
async function getBooks() {
    const books = await pool.query('SELECT b.bookID, b.title, a.firstName, a.lastName, g.genreName FROM Books AS b JOIN Authors AS a ON a.authorID=b.authorID JOIN Genres AS g ON g.genreCode=b.genreCode;');
    return books;
}

// Insert a book into the system
async function insertBook(title, authorID, genreCode) {
    await pool.query('CALL insert_book(?, ?, ?);', [title, authorID, genreCode]);
}

// Get all members for the members page
async function getMembers() {
    const members = await pool.query('SELECT * FROM Members;');
    return members;
}

// Get all genres for the genres page
async function getGenres() {
    const genres = await pool.query('SELECT * FROM Genres;');
    return genres;
}

// Get all borrows for the borrows dropdown
async function getBorrows() {
    const borrows = await pool.query('SELECT b.borrowID, m.firstName, m.lastName, b.startTime, b.dueTime FROM Borrows AS b JOIN Members AS m ON m.memberID=b.memberID;');
    return borrows;
}

// Get all borrows for the borrows update page
async function getFullBorrows() {
    const borrows = await pool.query('SELECT * from Borrows;');
    const books = await pool.query('SELECT * FROM Books_Borrows;');
    for (const book of books) {
        borrows.find(b => b.borrowID === book.borrowID).books = borrows.find(b => b.borrowID === book.borrowID).books || [];
        borrows.find(b => b.borrowID === book.borrowID).books.push({bookID: book.bookID});
    }
    return borrows;
}


export {pool, resetDb, getAuthors, getBooks, getMembers, getGenres, insertBook, getBorrows, getFullBorrows};