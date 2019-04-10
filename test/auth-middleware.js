const expect = require("chai").expect;
const jwt = require("jsonwebtoken");
const sinon = require("sinon");

const authMiddleware = require("../src/middlewares/auth");

describe("Auth middleware", () => {
  it("should throw an error if no Authorization header is present", () => {
    const req = {
      get: function(headerName) {
        return null;
      }
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "Not authenticated."
    );
  });

  it("should throw an error if the Authorization header is not valid", () => {
    const req = {
      get: function(headerName) {
        return "bearer XYZ";
      }
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw;
  });

  it("should yield an userId after decoding the token", () => {
    const req = {
      get: function(headerName) {
        return "bearer XYZ";
      }
    };
    sinon.stub(jwt, "verify");
    jwt.verify.returns({ userId: "abc" });
    authMiddleware(req, {}, () => {});
    expect(req).to.have.property("userId");
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
  });
});
