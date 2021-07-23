const { Schema, model } = require("mongoose");

const TaskSchema = new Schema({
  description: { type: String, required: true, maxlength: 100 },
  status: {
    type: String,
    enum: ["A fazer", "Fazendo", "Feito"],
    default: "A fazer",
  },
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
});

module.exports = model("Task", TaskSchema);
