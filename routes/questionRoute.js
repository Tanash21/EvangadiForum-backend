const express = require("express");
const router = express.Router();
const {
  get_questions,
  post_question,
} = require("../controller/questionController");

router.get("/all-questions", get_questions);

// Post Question
router.post("/", post_question);
module.exports = router;
