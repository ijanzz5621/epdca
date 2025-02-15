var credentials = require('../credentials');
var encryptor = require('../lib/lib_encryptor');

module.exports = function (app, authAdmin) {

    //Admin site
    app.get('/admin', authAdmin, function (req, res) {
        res.render('admin/home', { layout: "admin" });
    });

    app.get('/admin/login', function (req, res) {
        res.render('admin/login', { layout: null });
    });

    app.get('/admin/logout', function (req, res) {

        //destroy the session
        req.session.destroy();
        res.redirect('/admin/login');
    });

    app.post('/admin/login', function (req, res) {

        var username = 'admin';
        var password = req.body.txtPassword;

        //Check from database if the user is a valid user
        if (password === credentials.adminPassword) {

            //destroy prev session
            //req.session.destroy();
            req.session.user = null;

            req.session.admin = username;
            req.session.isAuthenticated = true;

            //save to req locals
            //req.app.locals.username = req.session.user;
            //res.locals.username = req.session.user;

            //console.log('username: ' + username + ', password: ' + password);
            res.redirect('/admin');

        } else {

            var msg = "Invalid password!";
            res.render('admin/login', { layout: null, message: msg });
            //console.log(msg);

        }
    });

    app.get('/admin/company', authAdmin, function (req, res) {
        res.render('admin/company', { layout: "admin" });
    });
    app.post('/admin/company/add-edit-company', function (req, res) {
        var blCompany = require('../business-logic/admin/company');

        blCompany.getCompanyByCode(req.body.txtCompanyCode).then(function (results) {

            //console.log('Company status: ' + req.body.rbStatus);

            var sql = "";
            //Check if user already exists, construct update statement, else construct insert statement
            if (results.length > 0)
                //console.log('UPDATE');
                sql = "UPDATE admin_company SET CompanyName = '" + req.body.txtCompanyName + "', Status = '" + req.body.rbStatus + "' WHERE CompanyCode = '" + req.body.txtCompanyCode + "';";
            else
                //console.log('INSERT');
                sql = "INSERT INTO admin_company (RecGuid, CompanyCode, CompanyName, Status, CreatedBy, CreatedOn) " +
                    "VALUES (uuid(), '" + req.body.txtCompanyCode + "', '" + req.body.txtCompanyName + "', '" + req.body.rbStatus + "', 'ADMIN', now());";

            blCompany.saveCompany(sql).then(function (results) {
                //console.log('Save company result: ' + JSON.stringify(results));
            }).catch((err) => setImmediate(() => { throw err; }));

        }).catch((err) => setImmediate(() => { throw err; }));

        res.redirect('/admin/company');
    });

    app.get('/admin/department', authAdmin, function (req, res) {

        var blDept = require('../business-logic/admin/company');
        var data = blDept.getCompanies().then(function (results) {

            //res.json(results);
            res.render('admin/department', { layout: "admin", companyList: results });

        }).catch((err) => setImmediate(() => { throw err; }));

    });

    app.post('/admin/department/add-edit-department', function (req, res) {
        var blDepartment = require('../business-logic/admin/department');

        blDepartment.getDepartmentByCode(req.body.ddlCompany, req.body.txtDepartmentCode).then(function (results) {
            //console.log("List of users: " + results);
            //console.log('Department status: ' + req.body.rbStatus);

            var sql = "";
            //Check if user already exists, construct update statement, else construct insert statement
            if (results.length > 0)
                //console.log('UPDATE');
                sql = "UPDATE admin_department SET DepartmentName = '" + req.body.txtDepartmentName + "', Status = '" + req.body.rbStatus + "' WHERE CompanyCode = '" + req.body.ddlCompany + "' and DepartmentCode = '" + req.body.txtDepartmentCode + "';";
            else
                //console.log('INSERT');
                sql = "INSERT INTO admin_department (RecGuid, CompanyCode, DepartmentCode, DepartmentName, Status, CreatedBy, CreatedOn) " +
                    "VALUES (uuid(), '" + req.body.ddlCompany + "', '" + req.body.txtDepartmentCode + "', '" + req.body.txtDepartmentName + "', '" + req.body.rbStatus + "', 'ADMIN', now());";

            blDepartment.saveDepartment(sql).then(function (results) {
                //console.log('Save department result: ' + JSON.stringify(results));
            }).catch((err) => setImmediate(() => { throw err; }));

        }).catch((err) => setImmediate(() => { throw err; }));

        res.redirect('/admin/department');
    });

    app.get('/admin/license', authAdmin, function (req, res) {
        res.render('admin/license', { layout: "admin" });
    });

    app.get('/admin/packages', authAdmin, function (req, res) {
        res.render('admin/packages', { layout: "admin" });
    });

    app.get('/admin/user', authAdmin, function (req, res) {
        res.render('admin/user', { layout: "admin" });
    });
    app.get('/admin/user-details', authAdmin, function (req, res) {
        res.render('admin/user-details', { layout: "admin" });
    });

    app.post('/admin/user/add-edit-user', function (req, res) {

        //gen sql
        var blUser = require('../business-logic/admin/user');
        blUser.getUserByCode(req.body.txtEmail).then(function (results) {

            //Create random password
            var passwordOri = Math.random()                        // Generate random number, eg: 0.123456
            .toString(36)                                           // Convert  to base-36 : "0.4fzyo82mvyr"
            .slice(-8);                                         // Cut off last 8 characters : "yo82mvyr"
            var passwordHash = encryptor.generateHashCode(passwordOri);                                 

            //encrypt before save to database

            var sql = "";
            //Check if user already exists, construct update statement, else construct insert statement
            if (results.length > 0){
                //console.log('UPDATE');
                sql = "UPDATE admin_user SET CompanyCode='" + req.body.ddlCompany + "', DepartmentCode='" + req.body.ddlDepartment + "', ";
                sql = sql + "UserCode = '" + req.body.txtUserCode + "', Username='" + req.body.txtUsername + "', " +
                "Gender='" + req.body.rbGender + "', SupervisorId= '" + req.body.ddlSupervisor + "', Password='" + passwordHash + "' " +
                "WHERE Email = '" + req.body.txtEmail + "';";
            }
            else{
                sql = "INSERT INTO admin_user (RecGuid, CompanyCode, DepartmentCode, UserCode, Username, Password, Email, Gender, SupervisorId, CreatedOn) ";
                sql = sql + "VALUES (uuid(), '" + req.body.ddlCompany + "', '" + req.body.ddlDepartment + "', '" + req.body.txtUserCode + "', '" + req.body.txtUsername + "', '" + password + "', '" + req.body.txtEmail + "', '" + req.body.rbGender + "', '" + req.body.ddlSupervisor + "', now())";
            }
                
            blUser.saveUser(sql).then(function (results) {
                //console.log('Save user result: ' + JSON.stringify(results));
                //if success, send email
                var email = require('../lib/lib_email');
                email.setMailOptions(req.body.txtEmail, 'ePDCA - Account created', 'Please use password ' + passwordOri + ' to login.', '');
                email.sendMail();
                
            }).catch((err) => setImmediate(() => { throw err; }));

        }).catch((err) => setImmediate(() => { throw err; }));

        res.redirect('/admin/user');

    })

}