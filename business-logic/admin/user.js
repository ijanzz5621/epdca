var connectionManager = require('../../lib/connectionManager');
var q = require('q');

function getUser(){
    var deferred = q.defer();

    connectionManager.getConnection()
        .then(function(connection){
            connection.query('select * from admin_user', function(err, results){
                if (err){
                    console.error(err);
                    deferred.reject(error);
                }
                deferred.resolve(results);
            })
        })
        .fail(function(err){
            console.error(JSON.stringify(err));
            deferred.reject(err);
        });

    return deferred.promise;
}

function getUserByCode(userEmail){
    var deferred = q.defer();

    connectionManager.getConnection()
        .then(function(connection){
            connection.query('select * from admin_user where Email =\'' + userEmail + '\'', function(err, results){
                if (err){
                    console.error(err);
                    deferred.reject(error);
                }
                deferred.resolve(results);
            })
        })
        .fail(function(err){
            console.error(JSON.stringify(err));
            deferred.reject(err);
        });

    return deferred.promise;
}

function getUsersByCompanyAndDepartment(companyCode, departmentCode){
    var deferred = q.defer();

    connectionManager.getConnection()
        .then(function(connection){
            connection.query('select * from admin_user where CompanyCode =\'' + companyCode + '\' and DepartmentCode = \'' + departmentCode + '\'', function(err, results){
                if (err){
                    console.error(err);
                    deferred.reject(error);
                }
                deferred.resolve(results);
            })
        })
        .fail(function(err){
            console.error(JSON.stringify(err));
            deferred.reject(err);
        });

    return deferred.promise;
}

function saveUser(sql){
    var deferred = q.defer();

    connectionManager.getConnection()
        .then(function(connection){
            connection.query(sql, function(err, results){
                if (err){
                    console.error(err);
                    deferred.reject(error);
                }
                deferred.resolve(results);
            })
        })
        .fail(function(err){
            console.error(JSON.stringify(err));
            deferred.reject(err);
        });

    return deferred.promise;
}

module.exports = {
    getUser: getUser
    , getUserByCode: getUserByCode
    , saveUser: saveUser
    , getUsersByCompanyAndDepartment: getUsersByCompanyAndDepartment
}