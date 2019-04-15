const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const locationSchema = new Schema(
  {
    idMotoqueiro: {
      type: Schema.Types.ObjectId,
      ref: "Motoqueiro",
      required: true
    },
    location: {
      type: Object,
      required: true
    }
  },
  { collection: "location", timestamps: true }
);

module.exports = mongoose.model("Location", locationSchema);
