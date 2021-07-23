const { Schema, model } = require("mongoose");

const ProjectSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 200 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  userId: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = model("Project", ProjectSchema);
