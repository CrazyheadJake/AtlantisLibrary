SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT = 0;


CREATE OR REPLACE TABLE Authors (
    authorID INT AUTO_INCREMENT,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    bio VARCHAR(800),
    PRIMARY KEY(authorID)
);

CREATE OR REPLACE TABLE Genres (
    genreCode INT AUTO_INCREMENT,
    genreName VARCHAR(50) NOT NULL,
    PRIMARY KEY(genreCode)
);

CREATE OR REPLACE TABLE Books (
    bookID INT AUTO_INCREMENT,
    title VARCHAR(50) NOT NULL,
    authorID INT NOT NULL,
    genreCode INT,
    FOREIGN KEY(authorID) REFERENCES Authors ON DELETE CASCADE,
    FOREIGN KEY(genreCode) REFERENCES Genres ON DELETE CASCADE,
    PRIMARY KEY(bookID)
);

CREATE OR REPLACE TABLE Members (
    memberID INT AUTO_INCREMENT,
    email VARCHAR(50) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    PRIMARY KEY(memberID)
);

CREATE OR REPLACE TABLE Borrows (
    borrowID INT AUTO_INCREMENT,
    memberID INT NOT NULL,
    startTime DATETIME NOT NULL,
    returnTime DATETIME,
    dueTime DATETIME NOT NULL,
    FOREIGN KEY(memberID) REFERENCES Members ON DELETE CASCADE,
    PRIMARY KEY(borrowID)
);

CREATE OR REPLACE TABLE Books_Borrows (
    bookBorrowID INT AUTO_INCREMENT,
    borrowID INT NOT NULL,
    bookID INT NOT NULL,
    FOREIGN KEY(borrowID) REFERENCES Borrows ON DELETE CASCADE,
    FOREIGN KEY(bookID) REFERENCES Books ON DELETE CASCADE,
    PRIMARY KEY(bookBorrowID)
);

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

SET FOREIGN_KEY_CHECKS=1;
COMMIT;