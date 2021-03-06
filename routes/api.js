'use strict';
const fetch = require("node-fetch");

const mongoose = require("mongoose");
mongoose.connect(
  process.env.DB,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
);
const schema = new mongoose.Schema({
  symbol: {type:String, required:true},
  likes: {type:Number, default:0}
});
const s_l = mongoose.model("symbol_likes", schema);

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(function (req, res) {
      let rq = req.query;
      if (typeof rq.stock == "string") {rq.stock = [rq.stock]}
      let stock = rq.stock.map(i => fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${i}/quote`).then(response => response.json()));
      Promise.all(stock).then(data => {
        var arr = [];
        let like = rq.like=="true"?1:0;
        data = data.filter(a => typeof a == "object");
        if (data.length == 0) {
          res.send("ERROR!");
          return false;
        }
        for (let i in data) {
          let obj = data[i];
          s_l.findOneAndUpdate(
            {symbol: obj.symbol}, 
            {$inc: {likes:like}}, 
            {returnOriginal: false},
            (err,d1) => {
              if (d1 === null) {
                new s_l({
                  symbol: obj.symbol,
                  likes:like
                }).save((err,d2) => {
                  arr.push({stock:obj.symbol,price:obj.latestPrice,likes:d2.likes});
                });
              } else {
                arr.push({stock:obj.symbol,price:obj.latestPrice,likes:d1.likes});
              }
              if (arr.length == data.length) {
                if (arr.length == 1) {
                  arr = arr[0];
                } else {
                  arr[0].rel_likes = arr[1].likes-arr[0].likes;
                  delete arr[0].likes;
                  arr[1].rel_likes = -arr[0].rel_likes;
                  delete arr[1].likes;
                }
                res.json({stockData: arr});
              }
            }
          );
        }
      });
    });
};