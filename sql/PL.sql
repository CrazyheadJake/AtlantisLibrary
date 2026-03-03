DELIMITER //

DROP PROCEDURE IF EXISTS reset_database;
CREATE PROCEDURE reset_database ()
BEGIN
    START TRANSACTION;

    SET FOREIGN_KEY_CHECKS = 0;

    DELETE FROM Books_Borrows;
    DELETE FROM Borrows;
    DELETE FROM Books;
    DELETE FROM Genres;
    DELETE FROM Authors;
    DELETE FROM Members;

    SET FOREIGN_KEY_CHECKS = 1;
    
    INSERT INTO Authors (firstName, lastName, bio) VALUES
    ("Brandon", "Sanderson", "Prolific contemporary fantasy author."),
    ("Fonda", "Lee", "Canadian-American author best known for the Green Bone Saga."),
    ("James", "Corey", NULL),
    ("Eric", "Carle", "Beloved author of many children’s books.");

    INSERT INTO Genres (genreName) VALUES
    ("Fantasy"),
    ("Science Fiction"),
    ("Picture Book");

    INSERT INTO Books (title, authorID, genreCode) VALUES
    ("Wind and Truth", 1, 1),
    ("Jade City", 2, 1),
    ("Leviathan Wakes", 3, 2),
    ("Bands of Mourning", 1, 1),
    ("The Very Hungry Caterpillar", 4, 3);

    INSERT INTO Members (email, firstName, lastName) VALUES
    ("mscout@gmail.com", "Mark", "Scout"),
    ("happyhelly@gmail.com", "Helly", "Riggs"),
    ("dgeorge@hotmail.com", "Dylan", "George"),
    ("theirving@gmail.com", "Irving", "Bailing");

    INSERT INTO Borrows (memberID, startTime, returnTime, dueTime) VALUES
    (1, "2026-01-03", "2026-01-17", "2026-01-24"),
    (3, "2026-01-15", "2026-01-25", "2026-02-05"),
    (1, "2026-02-02", NULL, "2026-02-23");

    INSERT INTO Books_Borrows (borrowID, bookID) VALUES
    (1, 2),
    (2, 5),
    (2, 3),
    (3, 5),
    (3, 4);

    COMMIT;
END //

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