import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, query, validationResult } from "express-validator";
import e from "express";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const fs = require("fs");
const saltRounds = 10;

const PORT = process.env.PORT || 3000;
const SECRET = "SIMPLE_SECRET";

interface JWTPayload {
  username: string;
  password: string;
}

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  // Use username and password to create token.
  const { users } = JSON.parse(
    fs.readFileSync("./users.json", { encoding: "utf-8" })
  ); //Write file
  const user = users.find(
    (user: { username: any; password: string }) =>
      user.username === username && bcrypt.compareSync(password, user.password) //เดิม password
  );
  if (user) {
    const token = jwt.sign(
      { username: user.username, password: user.password },
      "SIMPLE_SECRET"
    );
    return res.json({
      message: "Login successfully",
      token,
    });
  } else {
    return res.status(400).json({ message: "Invalid username or password" });
  }
});

app.post("/register", (req, res) => {
  const { username, password, firstname, lastname, balance } = req.body;
  const file = JSON.parse(
    fs.readFileSync("./users.json", { encoding: "utf-8" })
  ); //Write file
  const { users } = file;
  // const array1 = [5, 12, 8, 130, 44];
  const existUser = file.users.find(
    (user: { username: any }) => user.username === username
  );
  console.log(existUser);
  if (!existUser) {
    let lastPersonId = 1;
    if (users.length > 0) {
      lastPersonId = users[users.length - 1].id;
    }
    const encryptedPassword = bcrypt.hashSync(password, saltRounds);
    const newUser = {
      username: username,
      password: encryptedPassword,
      firstname: firstname,
      lastname: lastname,
      balance: balance,
    };
    const updatedFile = file.users.push(newUser);
    fs.writeFileSync("./users.json", JSON.stringify(file));
    res.json({ message: "Register successfully" });
  } else {
    res.status(400).json({ message: "Username is already in used" });
  }

  // users.push(newUser);
});

app.get("/balance", (req, res) => {
  const token = req.query.token as string;

  try {
    const { username } = jwt.verify(token, SECRET) as JWTPayload;
    const { users } = JSON.parse(
      fs.readFileSync("./users.json", { encoding: "utf-8" })
    ); //Write file
    const user = users.find(
      (user: { username: any; password: string }) => user.username === username
    ); //เดิม password
    res.json({
      name: user.firstname + " " + user.lastname,
      balance: user.balance,
    });
  } catch (e) {
    //response in case of invalid token
    res.status(401).json({ message: "Invalid" });
  }
});

app.post("/deposit", body("amount").isInt({ min: 1 }), (req, res) => {
  //Is amount <= 0 ?
 
  if (!validationResult(req).isEmpty())
    return res.status(400).json({ message: "Invalid data" });
});

app.post("/withdraw", (req, res) => {});

app.delete("/reset", (req, res) => {
  //code your database reset here
  const file = JSON.parse(
    fs.readFileSync("./users.json", { encoding: "utf-8" })
  ); //Write file
  const { users } = file;
  file.users = [];
  fs.writeFileSync("./users.json", JSON.stringify(file));
  return res.status(200).json({
    message: "Reset database successfully",
  });
});

app.get("/me", (req, res) => {
  res.json({
    firstname: "Kasidej",
    lastname: "Kammool",
    code: 620610776,
    gpa: 3.45,
  });
});

app.get("/demo", (req, res) => {
  return res.status(200).json({
    message: "This message is returned from demo route.",
  });
});

app.listen(PORT, () => console.log(`Server is running at ${PORT}`));
