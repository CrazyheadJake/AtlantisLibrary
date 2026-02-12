-- All variables that will have data from the backend programming
-- are denoted with the @ symbol before their name.

-- Searching for books by title
SELECT b.title, a.lastName, g.genreName
FROM Books AS b
JOIN Authors AS a ON a.authorID=b.authorID
JOIN Genres AS g ON g.genreCode=b.genreCode
WHERE b.title = @bookTitleSearchInput;

-- Listing all books
SELECT b.title, a.lastName, g.genreName
FROM Books AS b
JOIN Authors AS a ON a.authorID=b.authorID
JOIN Genres AS g ON g.genreCode=b.genreCode;

-- Listing all authors
SELECT genreName
FROM Genres;

-- Listing all genres
SELECT firstName, lastName, bio
FROM Authors;

-- Listing all members
SELECT firstName, lastName, email
FROM Members;

-- Listing all borrow entries
SELECT m.lastName, b.startTime, b.dueTime
FROM Borrows AS b
JOIN Members AS m ON m.memberID=b.memberID;

-- Listing all book borrows associated with a specific borrow entry
SELECT b.title
FROM Borrows_Borrows AS bb
JOIN Books AS b ON b.bookID=bb.bookID
WHERE bb.borrowID = @borrowIDFromDropdownInput;

-- Adding a new book
INSERT INTO Books (title, authorID, genreCode)
VALUES (@titleInput, @authorIDFromDropdownInput, @genreIDFromDropdownInput);

-- Adding a new author
INSERT INTO Authors (firstName, lastName, bio)
VALUES (@firstNameInput, @lastNameInput, @bioInput);

-- Adding a new genre
INSERT INTO Genres (genreName)
VALUES (@genreNameInput);

-- Adding a new member
INSERT INTO Members (email, firstName, lastName)
VALUES (@emailInput, @firstNameInput, @lastNameInput);

-- Adding a new borrow
INSERT INTO Borrows (memberID, startTime, dueTime)
VALUES (@memberIDFromDropdownInput, @startTimeInput, @dueTimeInput);

-- Runs in the backend whenever a new borrow is added in order to facilitate the M:M relationship
INSERT INTO Books_Borrows (borrowID, bookID)
VALUES (@borrowIDFromBorrowInsertion, @bookIDFromOneOfDropdownInputsInBorrowInsertion);

-- Updating the information of an existing borrow
UPDATE Borrows
SET memberID = @memberIDFromDropdownInput, startTime = @startTimeInput, dueTime = @dueTimeInput
WHERE borrowID = @borrowIDFromDropdownInput;

-- Runs in the backend whenever a borrow is updated in order to facilitate the M:M relationship
UPDATE Books_Borrows
SET borrowID = @borrowIDFromBorrowUpdate, bookID = @bookIDFromOneOfDropdownInputsInBorrowUpdate;

-- Deleting an existing borrow.
-- This deletion will also cascade to Books_Borrows, eliminating the need for a second delete query
DELETE FROM Borrows
WHERE (borrowID = @borrowIDFromDropdownInput);