const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    pageId: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        default: ""
    },
    passcode: {
        type: String,
        default: ""
    },
    // store an array of image relative URLs (e.g. /uploads/123.png)
    images: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model("Note", noteSchema);
