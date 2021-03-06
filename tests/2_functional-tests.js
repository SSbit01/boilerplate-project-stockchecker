const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

//
const requester = chai.request(server).keepOpen();
//

suite('Functional Tests', function() {
  test("Viewing one stock: GET request to /api/stock-prices/", done => {
    requester
    .get("/api/stock-prices")
    .query({stock:"goog"})
    .end((err,res) => {
      assert.typeOf(res, "object");
      assert.equal(Object.keys(res.body).length, 1);
      let rbs = res.body.stockData;
      assert.equal(Object.keys(rbs).length, 3);
      assert.typeOf(rbs.stock, "string");
      assert.typeOf(rbs.price, "number");
      assert.typeOf(rbs.likes, "number");
      done();
    });
  });

  test("Viewing one stock and liking it: GET request to /api/stock-prices/", done => {
    requester
    .get("/api/stock-prices")
    .query({stock:"msft", like:true})
    .end((err,res) => {
      assert.typeOf(res, "object");
      assert.equal(Object.keys(res.body).length, 1);
      let rbs = res.body.stockData;
      assert.equal(Object.keys(rbs).length, 3);
      assert.typeOf(rbs.stock, "string");
      assert.typeOf(rbs.price, "number");
      assert.isAtLeast(rbs.likes, 1);
      done();
    });
  });

  test("Viewing the same stock and liking it again: GET request to /api/stock-prices/", done => {
    let stock = "msft";
    requester
    .get("/api/stock-prices")
    .query({stock:stock})
    .end((err,d) => {
      let rbs = d.body.stockData;
      let likes = rbs.likes;
      requester
      .get("/api/stock-prices")
      .query({stock:stock, like:true})
      .end((err,res) => {
        assert.equal(res.body.stockData.likes, likes+1);
        done();
      });
    });
  });

  test("Viewing two stocks: GET request to /api/stock-prices/", done => {
    requester
    .get("/api/stock-prices")
    .query({stock:["goog","aapl"]})
    .end((err,res) => {
      assert.typeOf(res, "object");
      assert.equal(Object.keys(res.body).length, 1);
      let rbs = res.body.stockData;
      assert.typeOf(rbs, "array");
      assert.equal(rbs.length, 2);
      for (let i in rbs) {
        let obj = rbs[i];
        assert.equal(obj.length, 3);
        assert.typeOf(obj.stock, "string");
        assert.typeOf(obj.price, "number");
        assert.typeOf(obj.rel_likes, "number");
      }
      done();
    });
  });

  test("Viewing two stocks and liking them: GET request to /api/stock-prices/", done => {
    requester
    .get("/api/stock-prices")
    .query({stock:["goog","aapl"], like:true})
    .end((err,res) => {
      assert.typeOf(res, "object");
      assert.equal(Object.keys(res.body).length, 1);
      let rbs = res.body.stockData;
      assert.typeOf(rbs, "array");
      assert.equal(rbs.length, 2);
      for (let i in rbs) {
        let obj = rbs[i];
        assert.equal(obj.length, 3);
        assert.typeOf(obj.stock, "string");
        assert.typeOf(obj.price, "number");
        assert.typeOf(obj.rel_likes, "number");
      }
      done();
    });
  });
});