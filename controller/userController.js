// db connection
const dbConnection = require("../db/dbConfig");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

// registration
async function register(req, res) {
  const { username, firstname, lastname, email, password } = req.body;
  if (!username || !firstname || !lastname || !email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "please provide all required fields!",
    });
  }

  try {
    const [user] = await dbConnection.query(
      "SELECT userid, username FROM userTable WHERE username= ? or email= ?",
      [username, email]
    );
    if (user.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "user  already exists",
      });
    }
    if (password.length < 8) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "password must be at least 8 characters",
      });
    }

    // encrypt the password using salt
    const salt = await bcrypt.genSalt(10);

    // hash password
    const hashedPassword = await bcrypt.hash(password, salt);

    await dbConnection.query(
      "INSERT INTO userTable(username, firstname, lastname, email, password) VALUES (?, ?, ?,?,?)",
      [username, firstname, lastname, email, hashedPassword]
    );
    return res.status(StatusCodes.CREATED).json({
      msg: "user registered",
    });
  } catch (error) {
    // server error
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "something went wrong, try again latter",
    });
  }
}

// login
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "please provide all required fields!",
    });
  }

  try {
    const [user] = await dbConnection.query(
      "SELECT userid, username, password FROM userTable WHERE email= ?",
      [email]
    );
    if (user.length == 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid credential",
      });
    }

    //  compare password
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid credential",
      });
    }

    // token
    const username = user[0].username;
    const userid = user[0].userid;
    const token = jwt.sign({ username, userid }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(StatusCodes.OK).json({
      msg: "user logged successfully",
      token,
      username,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "something went wrong, try again latter",
    });
  }
}

async function checkUser(req, res) {
  const username = req.user.username;
  const userid = req.user.userid;
  res.status(StatusCodes.OK).json({
    msg: "valid user",
    username,
    userid,
  });
}

module.exports = { register, login, checkUser };
