const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const corridaSchema = new Schema(
  {
    /**
     *  --- Status ---
     * 0 - Corrida Solicitada
     * 1 - Corrida Aceita
     * 2 - Corrida Finalizada
     * 3 - Corrida Cancelada
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
    idCliente: {
      type: String,
      required: true
    },
    idMotoqueiro: {
      type: String,
      required: false
    },
    status: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Corrida", corridaSchema);
