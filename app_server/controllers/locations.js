var db = require('../models/db');
var mysqlconn = db.mysqlconn();
var userId = 0;


function Account(id, ammount, name, userId, type, limit, spent) {
    this.id = id;
    this.ammount = ammount;
    this.name = name;
    this.userId = userId;
    this.type = type;
    this.limit = limit;
    this.spent = spent;
}


/* GET 'home' page */
module.exports.homelist = function(req, res) {
    getAccounts(function(accounts, categories) {
        console.log(accounts);
        res.render('index', {
                accountInfo: {title: 'Доходы', info: accounts},
                categories: {title: 'Расходы', info: categories},
            });
    });
};

function getAccounts(handler) {
    var accounts = [];
    var categories = [];
    var getAccountsQuery = 'SELECT * FROM Account WHERE Account.userId = '+userId+'';
    var query = mysqlconn.query(getAccountsQuery);
    query
        .on('error', function(err) {
            console.log('MySQL error: ' + err);
        })
        .on('result', function(row) {
            if (row.type == "Доходы") {
                 var account = new Account(row.id, row.ammount, row.name, row.userId, row.type, row.limit, row.spent);
                 accounts.push(account);
            } else if (row.type == "Расходы") {
                 var category = new Account(row.id, row.ammount, row.name, row.userId, row.type, row.limit, row.spent);
                 categories.push(category);
            }
        })
        .on('end', function(err) {
            console.log(accounts);
            handler(accounts, categories);
        });

}


/* GET 'Add review' page */
// module.exports.addReview = function(req, res) {
//     res.render('location-review-form', {
//         title: 'Review Starcups on Loc8r',
//         pageHeader: {
//             title: 'Review Starcups'
//         }
//     });
// };