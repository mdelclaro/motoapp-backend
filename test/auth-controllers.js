const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { mongodbUrlTest } = require("../src/utils/config");

// testar controller cliente
// const User = require("../src/models/cliente");
// const AuthController = require("../src/controllers/auth-cliente");

// testar controller motoqueiro
const User = require("../src/models/motoqueiro");
const AuthController = require("../src/controllers/auth-motoqueiro");

describe("Auth controller", () => {
  let _stub;

  before(done => {
    mongoose
      .connect(mongodbUrlTest, { useNewUrlParser: true })
      .then(() => {
        const user = new User({
          nome: "test",
          sobrenome: "user",
          email: "test@email.com",
          senha: "test",
          status: 1
        });
        return user.save();
      })
      .then(() => done())
      .catch(err => {
        console.log("Erro mongodb: " + err);
      });
  });

  describe("Login", () => {
    it("should throw an error with code 500 if accessing the DB fails", done => {
      _stub = sinon.stub(User, "findOne").throws();

      const req = {
        body: {
          email: "test@email.com",
          senha: "test"
        }
      };

      AuthController.login(req, {}, () => {}).then(res => {
        expect(res).to.be.an("error");
        expect(res).to.have.property("statusCode", 500);
        done();
      });
    });

    it("should throw an error with code 401 if no user was found", done => {
      // mocking chained function -> User.findOne({ username }).select("+senha")
      _stub = sinon.stub(User, "findOne").returns({
        select: sinon.stub().returns(null)
      });

      const req = {
        body: {
          email: "test@email.com",
          senha: "test"
        }
      };

      AuthController.login(req, {}, () => {}).then(res => {
        expect(res).to.be.an("error");
        expect(res).to.have.property("statusCode", 401);
        done();
      });
    });

    it("should throw an error with code 401 if password is wrong", done => {
      _stub = sinon.stub(bcrypt, "compare").returns(false);

      const req = {
        body: {
          email: "test@email.com",
          senha: "test"
        }
      };

      AuthController.login(req, {}, () => {}).then(res => {
        expect(res).to.be.an("error");
        expect(res.statusCode).to.be.equal(401);
        done();
      });
    });

    it("should return an object with code 200, token, refreshToken and expiry-date if credentials were correct", done => {
      _stub = sinon.stub(bcrypt, "compare").returns(true);

      const req = {
        body: {
          email: "test@email.com",
          senha: "test"
        }
      };

      const res = {
        token: null,
        refreshToken: null,
        expiryDate: null,
        statusCode: 500,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.token = data.token;
          this.refreshToken = data.refreshToken;
          this.expiryDate = data.expiryDate;
        }
      };

      AuthController.login(req, res, () => {}).then(() => {
        expect(res).to.be.an("object");
        expect(res.statusCode).to.be.equal(200);
        expect(res).to.have.property("token");
        expect(res).to.have.property("refreshToken");
        expect(res).to.have.property("expiryDate");
        done();
      });
    });
  });

  describe("Refresh Token", () => {
    it("should throw an error with code 500 if accessing the DB fails", done => {
      _stub = sinon.stub(User, "findOne").throws();

      AuthController.login({}, {}, () => {}).then(res => {
        expect(res).to.be.an("error");
        expect(res).to.have.property("statusCode", 500);
        done();
      });
    });

    it("should throw an error with code 500 if JWT is invalid", done => {
      _stub = sinon.stub(jwt, "verify").throws();

      const req = {
        body: {
          refreshToken: "test"
        }
      };

      AuthController.refreshToken(req, {}, () => {}).then(res => {
        expect(res).to.be.an("error");
        expect(res).to.have.property("statusCode", 500);
        done();
      });
    });

    it("should return an object with token and expiry-date if refresh token was valid", done => {
      _stub = sinon.stub(jwt, "verify").returns({ email: "test@email.com" });

      const req = {
        body: {
          refreshToken: "test"
        }
      };

      const res = {
        token: null,
        expiryDate: null,
        statusCode: 500,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.token = data.token;
          this.expiryDate = data.expiryDate;
        }
      };

      AuthController.refreshToken(req, res, () => {}).then(() => {
        expect(res).to.be.an("object");
        expect(res.statusCode).to.be.equal(200);
        expect(res).to.have.property("token");
        expect(res).to.have.property("expiryDate");
        done();
      });
    });
  });

  after(done => {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => done());
  });

  afterEach(() => {
    _stub.restore();
  });
});
