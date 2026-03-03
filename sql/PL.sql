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