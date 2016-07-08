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
    getMainData(function(data) {
        console.log('sending home list');
        res.render('index', data);
    });

};


module.exports.updateInfo = function(req, res) {
    var actionName = req.body.name;
    console.log('apply action');
    console.log(actionName)
    if (actionName == 'insertNewCategory') {
        insertNewCategory(req.body, function() {
            console.log('insertNewCategory done');
        });
    } else if (actionName == 'insertNewTransaction') {
        insertNewOutgoing(req.body, function() {
            console.log('insertNewOutgoing done');
        });
    }
};


module.exports.getCategories = function(req, res) {
    var categories = [];

    var query = mysqlconn.query('SELECT * FROM Account WHERE Account.type = ?', "Расход");
    query
        .on('error', function(err) {
            console.log('MySQL error: ' + err);
        })
        .on('result', function(row) {
            var category = new Account(row.accountId, row.ammount, row.name, row.userId, row.type, row.limit, row.spent);
            categories.push(category);
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
                 var account = new Account(row.accountId, row.ammount, row.name, row.userId, row.type, row.limit, row.spent);
                 accounts.push(account);
            } else if (row.type == "Расход") {
                 var category = new Account(row.accountId, row.ammount, row.name, row.userId, row.type, row.limit, row.spent);
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
              

              // console.log(row);
              transactions.push(transaction);
            
        })
        .on('end', function(err) {
            // console.log(transactions);
            handler(transactions);
        });
}


function insertNewCategory(data, handler) {
    console.log(data)
    var insertData = {
        name: data.categoryName,
        limit: data.categoryLimit,
        spent: 0,
        type: "Расход",
        userId: 0
    }

    var query = mysqlconn.query("INSERT INTO Account SET ?", insertData);
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


function insertNewOutgoing(data, handler) {
    console.log(data)
    getAccounIdByName(data.category, function(catId) {
        var query = mysqlconn.query("CALL InsertTransaction("+ data.outgoungAmount +", "+ 5 +", ?, "+ 0 +")", catId);
        query
            .on('error', function(err) {
                console.log('MySQL error: ' + err);
            })
            .on('result', function(row) {
                
            })
            .on('end', function(err) {
                handler();
            });
    });
}


function timeUTC(timeZ) {
    if (!timeZ) return (new Date()).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    return timeZ.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

function getAccounIdByName(name, handler) {
    var query = mysqlconn.query('SELECT accountId FROM Account WHERE Account.name = ?', name);
    query
        .on('error', function(err) {
            console.log('MySQL error: ' + err);
        })
        .on('result', function(row) {
            handler(row.accountId);
        })
        .on('end', function(err) {
            // console.log(accounts);
            
        });
}

function getMainData(handler) {
    getAccounts(function(accounts, categories) {
        getTransactions(function(transactions) {
            var data = {
                accountInfo: {title: 'Доходы', info: accounts},
                categories: {title: 'Лимиты', info: categories},
                transactions: {title: 'Транзакции', info: transactions},
            };
            handler(data);
        });

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