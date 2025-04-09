const dbConnection = require("../db/dbConfig");

async function createDatabaseTables() {
  let usersTable = `
        CREATE TABLE IF NOT EXISTS userTable (
            userid INT AUTO_INCREMENT,
            username VARCHAR(255) NOT NULL,
            firstname VARCHAR(255) NOT NULL,
            lastname VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            PRIMARY KEY (userid)
        )
    `;

  let questionsTable = `
        CREATE TABLE IF NOT EXISTS questions (
            id INT AUTO_INCREMENT,
            questionid VARCHAR(255) NOT NULL UNIQUE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            tag VARCHAR(255),
            userid INT NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (userid) REFERENCES userTable(userid) ON DELETE CASCADE
        )
    `;

  let answersTable = `
        CREATE TABLE IF NOT EXISTS answers (
            answerid INT AUTO_INCREMENT,
            answer TEXT NOT NULL,
            userid INT NOT NULL,
            questionid VARCHAR(255) NOT NULL,
            PRIMARY KEY (answerid),
            FOREIGN KEY (userid) REFERENCES userTable(userid) ON DELETE CASCADE,
            FOREIGN KEY (questionid) REFERENCES questions(questionid) ON DELETE CASCADE
        )
    `;

  let connection;
  try {
    connection = await dbConnection.getConnection();
    await connection.execute(usersTable);
    console.log("Users table created");
    await connection.execute(questionsTable);
    console.log("Questions table created");
    await connection.execute(answersTable);
    console.log("Answers table created");
    return true; // Indicate success
  } catch (error) {
    console.error("Error creating tables:", error);
    return false; // Indicate failure
  } finally {
    if (connection) connection.release();
  }
}

// Export the function
module.exports = createDatabaseTables;
