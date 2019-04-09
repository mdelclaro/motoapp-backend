const express = require("express");
const { body } = require("express-validator/check");

const avaliacaoController = require("../controllers/avaliacao");
const auth = require("../middlewares/auth");

const router = express.Router();

// GET motoapp/v1/avaliacao/
router.get("/", auth, avaliacaoController.getAvaliacoes);

// GET motoapp/v1/avaliacao/id
router.get("/:idAvaliacao", auth, avaliacaoController.getAvaliacao);

// POST motoapp/v1/avaliacao/
router.post(
  "/",
  [
    body("nota")
      .isNumeric()
      .not()
      .isEmpty(),
    body("comentario")
      .trim()
      .optional(),
    body("idMotoqueiro")
      .not()
      .isEmpty()
  ],
  auth,
  avaliacaoController.createAvaliacao
);

// DELETE motoapp/v1/avaliacao/id
// router.delete(
//   "/:idAvaliacao",
//   [
//     param("idAvaliacao")
//       .not()
//       .isEmpty()
//   ],
//   auth,
//   corridaController.deleteCorrida
// );

module.exports = router;
