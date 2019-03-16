const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const corridaSchema = new Schema(
  {
    /**
     *  --- Status ---
     * 0 - Corrida Solicitada
     * 1 - Corrida Aceita
     * 2 - Corrida em Andamento
     * 3 - Corrida Finalizada
     * 4 - Corrida Cancelada
     * ---------------
     */
    origem: {
      type: Object,
      required: true
    },
    destino: {
      type: Object,
      required: true
    },
    distancia: {
      type: Number,
      required: true
    },
    tempo: {
      type: Number,
      required: true
    },
    idCliente: {
      type: Schema.Types.ObjectId,
      ref: "Cliente",
      required: true
    },
    idMotoqueiro: {
      type: Schema.Types.ObjectId,
      ref: "Motoqueiro",
      required: false
    },
    status: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Corrida", corridaSchema);
