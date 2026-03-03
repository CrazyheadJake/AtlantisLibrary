DELIMITER //

DROP PROCEDURE IF EXISTS insert_book;
CREATE PROCEDURE insert_book (IN pTitle VARCHAR(50), IN pAuthorFirstName VARCHAR(50), IN pAuthorLastName VARCHAR(50), IN pGenreName VARCHAR(50))
BEGIN
    DECLARE pAuthorID INT;
    DECLARE pGenreCode INT;

    SELECT Authors.authorID
    INTO pAuthorID
    FROM Authors
    WHERE Authors.firstName = pAuthorFirstName AND Authors.lastName = pAuthorLastName;

    SELECT Genres.genreCode
    INTO pGenreCode
    FROM Genres
    WHERE Genres.genreName = pGenreName;

    START TRANSACTION;

    INSERT INTO Books (title, authorID, genreCode) VALUES
    (pTitle, pAuthorID, pGenreCode);

    COMMIT;
END //

DELIMITER ;