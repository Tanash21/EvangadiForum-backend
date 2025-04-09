// db connection
const dbConnection = require("../db/dbConfig");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");

// get All questions
async function get_questions(req, res) {
  try {
    // Execute a query to fetch all questions from the database
    const [allQuestions] = await dbConnection.execute(
      `SELECT q.*, u.username
FROM questions q
JOIN usertable u ON q.userid = u.userid
WHERE q.userid = u.userid`
    );
    // Respond with a JSON payload containing all questions and metadata
    if (allQuestions.length < 1) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "Not Found",
        message: "No questions found.",
      });
    }
    res.status(StatusCodes.OK).json(allQuestions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

// Post Question
async function post_question(req, res) {
  // get data from user
  const { title, description, tag } = req.body;
  const userid = req.user.userid;

  if (!title) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      msg: "please provide all required fields!",
    });
  }
  try {
    // send data to database
    const questionid = randomUUID();
    console.log({ "user ID": userid, QID: questionid });
    await dbConnection.query(
      "INSERT INTO questions(questionid , title, description, tag, userid ) VALUES (?, ?, ?,?,?)",
      [questionid, title, description, tag, userid]
    );
    return res.status(StatusCodes.CREATED).json({
      msg: "Question created successfully",
    });
  } catch (error) {
    console.error("Error during post question:", error);
    // Handle server errors with a 500 Internal Server Error
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

module.exports = {
  get_questions,
  post_question,
};
