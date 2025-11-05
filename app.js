const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const noteRoutes = require("./routes/noteRoutes");

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

/*
  noteRoutes handles:
    GET  /          -> landing page (index.ejs)
    GET  /:pageId   -> notepad page
    POST /:pageId   -> save note content
    POST /:pageId/upload -> upload image
    POST /:pageId/passcode -> set/verify passcode
*/
app.use("/", noteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
