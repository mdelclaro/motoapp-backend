const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const motoqueiroLocationSchema = new Schema(
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
  { timestamps: true }
);

module.exports = mongoose.model("MotoqueiroLocation", motoqueiroLocationSchema);
