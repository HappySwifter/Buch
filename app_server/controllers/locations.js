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

function Transaction(id, source, destination, userId, date, amount) {
    this.id = id;
    this.source = source;
    this.destination = destination;
    this.userId = userId;
    this.date = date;
    this.amount = amount;
}

/* GET 'home' page */
module.exports.homelist = function(req, res) {
    getAccounts(function(accounts, categories) {
        getTransactions(function(transactions) {
            // console.log(accounts);
            res.render('index', {
                accountInfo: {title: 'Доходы', info: accounts},
                categories: {title: 'Лимиты', info: categories},
                transactions: {title: 'Транзакции', info: transactions},
            });
        });

    });
};


module.exports.updateInfo = function(req, res) {
    var action = req.body.name;
    console.log('post action is - ' + action);
    if (action == 'insertNewTransaction') {
        insertNewTransaction(function() {
            console.log('inserting done');
            getAccounts(function(accounts, categories) {
                console.log('sending new data');
                res.send(accounts)
           });
        });
    }
};


module.exports.getCategories = function(req, res) {
    var categories = [];
     // mysqlconn.query("SELECT iduser, isdelete, isblocked, nameuser FROM v_user WHERE iddevice = ? LIMIT 1", UDID)

    // var queryStr = 'SELECT name FROM Account WHERE Account.type = ?';
    var query = mysqlconn.query('SELECT name FROM Account WHERE Account.type = ?', "Расход");
    query
        .on('error', function(err) {
            console.log('MySQL error: ' + err);
        })
        .on('result', function(row) {
             categories.push(row.name);
        })
        .on('end', function(err) {
            console.log(categories);
            res.send(categories);
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
            if (row.type == "Доход") {
                 var account = new Account(row.id, row.ammount, row.name, row.userId, row.type, row.limit, row.spent);
                 accounts.push(account);
            } else if (row.type == "Расход") {
                 var category = new Account(row.id, row.ammount, row.name, row.userId, row.type, row.limit, row.spent);
                 categories.push(category);
            }
        })
        .on('end', function(err) {
            // console.log(accounts);
            handler(accounts, categories);
        });
}

function getTransactions(handler) {
    var transactions = [];
    var getTransactionsQuery = 'CALL select_transactions';
    var query = mysqlconn.query(getTransactionsQuery);
    query
        .on('error', function(err) {
            console.log('MySQL error: ' + err);
        })
        .on('result', function(row) {
             var transaction = new Transaction(row.id, row.source, row.destination, row.userId, row.date, row.amount);
              

              console.log(row);
              transactions.push(transaction);
            
        })
        .on('end', function(err) {
            // console.log(transactions);
            handler(transactions);
        });
}


function insertNewTransaction(handler) {


// amount int, sourceId int, destinationId int, userId int, transDate date



    var queryStr = "CALL InsertTransaction("+ 300 +", "+ 5 +", "+ 5 +", "+ 0 +")";
    var query = mysqlconn.query(queryStr);
    query
        .on('error', function(err) {
            console.log('MySQL error: ' + err);
        })
        .on('result', function(row) {
            
        })
        .on('end', function(err) {
            handler();
        });
}


function timeUTC(timeZ) {
    if (!timeZ) return (new Date()).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    return timeZ.toISOString().replace(/T/, ' ').replace(/\..+/, '');
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