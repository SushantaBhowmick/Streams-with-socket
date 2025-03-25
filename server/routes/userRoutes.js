const express = require("express");
const {
  getUsers,
  createUsers,
  updateUsers,
  getUserById,
} = require("../controllers/userController");
const router = express.Router();

router.route("/users").get(getUsers);
router.route("/create").post(createUsers);
router.route("/update/:id").put(updateUsers);
router.route("/user/:id").get(getUserById);

module.exports = router;
