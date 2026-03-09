DROP PROCEDURE IF EXISTS insert_book;
DELIMITER //

CREATE PROCEDURE insert_book (IN pTitle VARCHAR(50), IN pAuthorID INT, IN pGenreCode VARCHAR(50))
BEGIN
    START TRANSACTION;

    INSERT INTO Books (title, authorID, genreCode) VALUES
    (pTitle, pAuthorID, pGenreCode);

    COMMIT;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS insert_author;
DELIMITER //

CREATE PROCEDURE insert_author (IN firstName VARCHAR(50), IN lastName VARCHAR(50), IN bio TEXT)
BEGIN
    START TRANSACTION;

    INSERT INTO Authors (firstName, lastName, bio) VALUES
    (firstName, lastName, bio);

    COMMIT;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS insert_genre;
DELIMITER //

CREATE PROCEDURE insert_genre (IN pGenreName VARCHAR(50))
BEGIN
    START TRANSACTION;

    INSERT INTO Genres (genreName) VALUES
    (pGenreName);

    COMMIT;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS insert_member;
DELIMITER //

CREATE PROCEDURE insert_member (IN pFirstName VARCHAR(50), IN pLastName VARCHAR(50), IN pEmail VARCHAR(100))
BEGIN
    START TRANSACTION;

    INSERT INTO Members (firstName, lastName, email) VALUES
    (pFirstName, pLastName, pEmail);

    COMMIT;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS insert_borrow;
DELIMITER //
CREATE PROCEDURE insert_borrow (IN pMemberID INT, IN pStartTime DATETIME, IN pDueTime DATETIME, OUT pBorrowID INT)
BEGIN
    START TRANSACTION;

    INSERT INTO Borrows (memberID, startTime, dueTime) VALUES
    (pMemberID, pStartTime, pDueTime);

    SET pBorrowID = LAST_INSERT_ID();

    COMMIT;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS add_book_to_borrow;
DELIMITER //
CREATE PROCEDURE add_book_to_borrow (IN pBorrowID INT, IN pBookID INT)
BEGIN
    START TRANSACTION;

    INSERT INTO Books_Borrows (borrowID, bookID) VALUES
    (pBorrowID, pBookID);

    COMMIT;
END //
DELIMITER ;
