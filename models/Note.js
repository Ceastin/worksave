const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
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
// Hash passcode before saving if modified
noteSchema.pre("save", async function (next) {
  if (this.isModified("passcode") && this.passcode !== "") {
    const salt = await bcrypt.genSalt(10);
    this.passcode = await bcrypt.hash(this.passcode, salt);
  }
  next();
});

//method to verify passcode
noteSchema.methods.comparePasscode = async function (enteredPasscode) {
  return await bcrypt.compare(enteredPasscode, this.passcode);
};

module.exports = mongoose.model("Note", noteSchema);
