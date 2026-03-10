import { createPool } from 'mariadb'

const pool = createPool({
    host: 'classmysql.engr.oregonstate.edu',
    user: 'cs340_moleskij',
    password: '1768',
    database: 'cs340_moleskij',
    connectionLimit: 5
});

async function resetDb() {
    await pool.query('CALL reset_database();');
}

async function getAuthors() {
    const authors = await pool.query('SELECT * FROM Authors;');
    return authors;
}

async function getBooks() {
    const books = await pool.query('SELECT b.bookID, b.title, a.firstName, a.lastName, g.genreName FROM Books AS b JOIN Authors AS a ON a.authorID=b.authorID JOIN Genres AS g ON g.genreCode=b.genreCode;');
    return books;
}

async function insertBook(title, authorID, genreCode) {
    await pool.query('CALL insert_book(?, ?, ?);', [title, authorID, genreCode]);
}

async function getMembers() {
    const members = await pool.query('SELECT * FROM Members;');
    return members;
}

async function getGenres() {
    const genres = await pool.query('SELECT * FROM Genres;');
    return genres;
}

async function getBorrows() {
    const borrows = await pool.query('SELECT b.borrowID, m.firstName, m.lastName, b.startTime, b.dueTime FROM Borrows AS b JOIN Members AS m ON m.memberID=b.memberID;');
    return borrows;
}

async function getFullBorrows() {
    const borrows = await pool.query('SELECT * from Borrows;');
    const books = await pool.query('SELECT bb.borrowID, bk.bookID FROM Books_Borrows AS bb JOIN Books AS bk ON bk.bookID=bb.bookID;');
    for (const book of books) {
        borrows.find(b => b.borrowID === book.borrowID).books = borrows.find(b => b.borrowID === book.borrowID).books || [];
        borrows.find(b => b.borrowID === book.borrowID).books.push({bookID: book.bookID});
    }
    return borrows;
}


export {pool, resetDb, getAuthors, getBooks, getMembers, getGenres, insertBook, getBorrows, getFullBorrows};