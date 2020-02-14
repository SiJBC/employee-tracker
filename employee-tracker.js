
const mysql = require("mysql");
const inquirer = require("inquirer");
// allows you to wrap a mysql request in a promise statement
const promisemysql = require("promise-mysql");

// Connection Properties
const connectionProperties = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employees_DB"
}

// Creating Connection
const connection = mysql.createConnection(connectionProperties);


// establish a connection and start the program
connection.connect((err) => {
    if (err) throw err;

    // Start main menu function

    console.log("\n WELCOME TO EMPLOYEE TRACKER \n");
    init();
});

// Main menu function
function init() {

    // Prompt user to choose an option
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do ?",
            choices: [
                "View all employees",
                "View all employees by role",
                "View all employees by department",
                "Add employee",
                "Add role",
                "Add department",
                "Update employee role",
                "Update employee Manager",
                "Delete employee",
                "Delete Role",

            ]
        })
        .then((answer) => {

            // Switch case depending on user option
            switch (answer.action) {
                case "View all employees":
                    viewEmp();
                    break;

                case "View all employees by department":
                    viewEmpByDept();
                    break;

                case "View all employees by role":
                    viewEmpByRole();
                    break;

                case "Add employee":
                    addEmp();
                    break;

                case "Add department":
                    addDept();
                    break;

                case "Add role":
                    addRole();
                    break;

                case "Update employee manager":
                    updateEmpMng();
                    break;

                case "Delete employee":
                    deleteEmp();
                    break;
                case "Delete Role":
                    deleteRole();
                    break;
                case "Update employee role":
                    updateEmpRole();
                    break;

            }

        })
}

function viewEmp() {
    var query = "SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY ID ASC"

    connection.query(query, function (err, res) {
        if (err) return err;
        // console.log(res);


        // Display query results using console.table
        console.table(res);

        //Back to main menu
        init();
    });
}
function addEmp() {

    // Create two global array to hold 
    let roleArr = [];
    let managerArr = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        // Query  all roles and all manager. Pass as a promise
        let query1 = 'SELECT id, title FROM role ORDER BY title ASC'
        let query2 = "SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC"
        return Promise.all([
            conn.query(query1),
            conn.query(query2)
        ]);
    }).then(([roles, managers]) => {

        // Place all roles in array
        for (i = 0; i < roles.length; i++) {
            roleArr.push(roles[i].title);
        }

        // place all managers in array
        for (i = 0; i < managers.length; i++) {
            managerArr.push(managers[i].Employee);
        }

        return Promise.all([roles, managers]);
    }).then(([roles, managers]) => {

        // add option for no manager use unshift to add an item to the array
        managerArr.unshift('--');

        inquirer.prompt([
            {
                // Prompt user of their first name
                name: "firstName",
                type: "input",
                message: "First name: ",
                // Validate field is not blank
                validate: function (input) {
                    if (input === "") {
                        console.log("**FIELD REQUIRED**");
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            },
            {
                // Prompt user of their last name
                name: "lastName",
                type: "input",
                message: "Lastname name: ",
                // Validate field is not blank
                validate: function (input) {
                    if (input === "") {
                        console.log("**FIELD REQUIRED**");
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            },
            {
                // Prompt user of their role
                name: "role",
                type: "list",
                message: "What is their role?",
                choices: roleArr
            }, {
                // Prompt user for manager
                name: "manager",
                type: "list",
                message: "Who is their manager?",
                choices: managerArr
            }]).then((answer) => {

                // Set variable for IDs
                let roleID;
                // Default Manager value as null
                let managerID = null;

                // Get ID of role selected
                for (i = 0; i < roles.length; i++) {
                    if (answer.role == roles[i].title) {
                        roleID = roles[i].id;
                    }
                }

                // get ID of manager selected
                for (i = 0; i < managers.length; i++) {
                    if (answer.manager == managers[i].Employee) {
                        managerID = managers[i].id;
                    }
                }

                // Add employee
                let queryBuilder = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ("${answer.firstName}", "${answer.lastName}", ${roleID}, ${managerID})`
                connection.query(queryBuilder, (err, res) => {
                    if (err) return err;

                    // Confirm employee has been added
                    console.log(`\n EMPLOYEE ${answer.firstName} ${answer.lastName} ADDED...\n `);
                    init();
                });
            });
    });
}


// view all employees by role
function viewEmpByRole() {

    // set global array to store all roles
    let roleArr = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties)
        .then((conn) => {

            // Query all roles
            return conn.query('SELECT title FROM role');
        }).then(function (roles) {

            // Place all roles within the roleArry
            for (i = 0; i < roles.length; i++) {
                roleArr.push(roles[i].title);
            }
        }).then(() => {

            // Prompt user to select a role
            inquirer.prompt({
                name: "role",
                type: "list",
                message: "Which role would you like to search?",
                choices: roleArr
            })
                .then((answer) => {

                    // Query all employees by role selected by user
                    const query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', role.title AS Title, department.name AS Department, role.salary AS Salary, concat(m.first_name, ' ' ,  m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE role.title = '${answer.role}' ORDER BY ID ASC`;
                    connection.query(query, (err, res) => {
                        if (err) return err;

                        // show results using console.table
                        console.log("\n");
                        console.table(res);
                        init();
                    });
                });
        });
}



function addRole() {

    // Create array of departments
    let departmentArr = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties)
        .then((conn) => {

            // Query all departments
            return conn.query('SELECT id, name FROM department ORDER BY name ASC');

        }).then((departments) => {

            // Place all departments in array
            for (i = 0; i < departments.length; i++) {
                departmentArr.push(departments[i].name);
            }

            return departments;
        }).then((departments) => {

            inquirer.prompt([
                {
                    // Prompt user role title
                    name: "roleTitle",
                    type: "input",
                    message: "Role title: "
                },
                {
                    // Prompt user for salary
                    name: "salary",
                    type: "number",
                    message: "Salary: "
                },
                {
                    // Prompt user to select department role is under
                    name: "dept",
                    type: "list",
                    message: "Department: ",
                    choices: departmentArr
                }]).then((answer) => {

                    // Set department ID variable
                    let deptID;

                    // get id of department selected
                    for (i = 0; i < departments.length; i++) {
                        if (answer.dept == departments[i].name) {
                            deptID = departments[i].id;
                        }
                    }

                    // Added role to role table
                    let queryBuilder = `INSERT INTO role (title, salary, department_id)
                                VALUES ("${answer.roleTitle}", ${answer.salary}, ${deptID})`
                    connection.query(queryBuilder, (err, res) => {
                        if (err) return err;
                        console.log(`\n ROLE ${answer.roleTitle} ADDED...\n`);
                        init();
                    });

                });

        });
}

function addDept() {

    inquirer.prompt({
        // Prompt user for name of department
        name: "deptName",
        type: "input",
        message: "Department Name: "
    }).then((answer) => {

        // add department to the table
        let queryBuilder = `INSERT INTO department (name)VALUES ("${answer.deptName}");`
        connection.query(queryBuilder, (err, res) => {
            if (err) return err;
            console.log("\n DEPARTMENT ADDED...\n ");
            init();
        });

    });
}

function updateEmpMng() {
    let employeeArr = []

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {
        let queryBuilder = "SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC"

        return conn.query(queryBuilder);
    }).then((employees) => {

        // place employees in array
        for (i = 0; i < employees.length; i++) {
            employeeArr.push(employees[i].Employee);
        }
        console.log(employeeArr)
        return employees;

    }).then((employees) => {

        inquirer.prompt([
            {
                // prompt user to selected employee
                name: "employee",
                type: "list",
                message: "Who would you like to edit?",
                choices: employeeArr
            }, {
                // prompt user to select new manager
                name: "manager",
                type: "list",
                message: "Who is their new Manager?",
                choices: employeeArr
            },]).then((answer) => {

                let employeeID;
                let managerID;

                // get ID of selected manager
                for (i = 0; i < employees.length; i++) {
                    if (answer.manager == employees[i].Employee) {
                        managerID = employees[i].id;
                    }
                }

                // get ID of selected employee
                for (i = 0; i < employees.length; i++) {
                    if (answer.employee == employees[i].Employee) {
                        employeeID = employees[i].id;
                    }
                }

                // update employee with manager ID
                let queryBuilder = `UPDATE employee SET manager_id = ${managerID} WHERE id = ${employeeID}`
                connection.query(queryBuilder, (err, res) => {
                    if (err) return err;

                    // confirm update employee
                    console.log(`\n ${answer.employee} MANAGER UPDATED TO ${answer.manager}...\n`);

                    // go back to main menu
                    init();
                });
            });
    });

}

function viewEmpByDept() {
    let deptArr = [];

    // Create new connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        // Query just names of departments
        return conn.query('SELECT name FROM department');
    }).then(function (value) {

        // Place all names within deptArr
        deptQuery = value;
        for (i = 0; i < value.length; i++) {
            deptArr.push(value[i].name);

        }
    }).then(() => {

        // Prompt user to select department from array of departments
        inquirer.prompt({
            name: "department",
            type: "list",
            message: "Which department would you like to search?",
            choices: deptArr
        }).then((answer) => {

            // Query all employees depending on selected department
            const query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', role.title AS Title, department.name AS Department, role.salary AS Salary, concat(m.first_name, ' ' ,  m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.name = '${answer.department}' ORDER BY ID ASC`;
            connection.query(query, (err, res) => {
                if (err) return err;
                // Show results in console.table
                console.log("\n");
                console.table(res);

                // Back to main menu
                init();
            });
        });
    });

}
// Delete employee
function deleteEmp() {


    // Create global employee array
    let employeeArr = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        // Query all employees
        deleteQuery = "SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS employee FROM employee ORDER BY Employee ASC"
        return conn.query(deleteQuery);
    }).then((employees) => {

        // Place all employees in array
        for (i = 0; i < employees.length; i++) {
            employeeArr.push(employees[i].employee);
        }

        inquirer.prompt([
            {
                // prompt user of all employees
                name: "employee",
                type: "list",
                message: "Who would you like to fire?",
                choices: employeeArr
            }, {
                // confirm delete of employee
                name: "yesNo",
                type: "list",
                message: "Confirm termination",
                choices: ["NO", "YES"]
            }]).then((answer) => {

                if (answer.yesNo == "YES") {
                    let employeeID;

                    // if confirmed, get ID of employee selected
                    for (i = 0; i < employees.length; i++) {
                        if (answer.employee == employees[i].employee) {
                            employeeID = employees[i].id;
                        }
                    }

                    // deleted selected employee
                    let query = `DELETE FROM employee WHERE id=${employeeID};`
                    connection.query(query, (err, res) => {
                        if (err) return err;

                        // confirm deleted employee
                        console.log(`\n EMPLOYEE '${answer.employee}' DELETED...\n `);

                        // back to main menu
                        init();
                    });
                }
                else {

                    // if not confirmed, go back to main menu
                    console.log(`\n EMPLOYEE '${answer.employee}' NOT DELETED...\n `);

                    // back to main menu
                    init();
                }

            });
    });
}


function deleteRole() {

    // Create role array
    let roleArr = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        // query all roles
        let query = "SELECT id, title FROM role"
        return conn.query(query);
    }).then((roles) => {

        // add all roles to array
        for (i = 0; i < roles.length; i++) {
            roleArr.push(roles[i].title);
        }

        inquirer.prompt([{
            // confirm to continue to select role to delete
            name: "continueDelete",
            type: "list",
            message: "*** WARNING *** Deleting role will delete all employees associated with the role. Do you want to continue?",
            choices: ["NO", "YES"]
        }]).then((answer) => {

            // if not, go to main menu
            if (answer.continueDelete === "NO") {
                mainMenu();
            }

        }).then(() => {

            inquirer.prompt([{
                // prompt user of of roles
                name: "role",
                type: "list",
                message: "Which role would you like to delete?",
                choices: roleArr
            }, {
                // confirm to delete role by typing role exactly
                name: "confirmDelete",
                type: "Input",
                message: "Type the role title EXACTLY to confirm deletion of the role"

            }]).then((answer) => {

                if (answer.confirmDelete === answer.role) {

                    // get role id of of selected role
                    let roleID;
                    for (i = 0; i < roles.length; i++) {
                        if (answer.role == roles[i].title) {
                            roleID = roles[i].id;
                        }
                    }

                    // delete role
                    let deleteQuery = `DELETE FROM role WHERE id=${roleID};`
                    connection.query(deleteQuery, (err, res) => {
                        if (err) return err;

                        // confirm role has been added 
                        console.log(`\n ROLE '${answer.role}' DELETED...\n `);

                        //back to main menu
                        init();
                    });
                }
                else {

                    // if not confirmed, do not delete
                    console.log(`\n ROLE '${answer.role}' NOT DELETED...\n `);

                    //back to main menu
                    init();
                }

            });
        })
    });
}

function updateEmpRole() {

    // create employee and role array
    let employeeArr = [];
    let roleArr = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {
        return Promise.all([

            // query all roles and employee
            conn.query('SELECT id, title FROM role ORDER BY title ASC'),
            conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC")
        ]);
    }).then(([roles, employees]) => {

        // place all roles in array
        for (i = 0; i < roles.length; i++) {
            roleArr.push(roles[i].title);
        }

        // place all empoyees in array
        for (i = 0; i < employees.length; i++) {
            employeeArr.push(employees[i].Employee);
            //console.log(value[i].name);
        }

        return Promise.all([roles, employees]);
    }).then(([roles, employees]) => {

        inquirer.prompt([
            {
                // prompt user to select employee
                name: "employee",
                type: "list",
                message: "Who would you like to edit?",
                choices: employeeArr
            }, {
                // Select role to update employee
                name: "role",
                type: "list",
                message: "What is their new role?",
                choices: roleArr
            },]).then((answer) => {

                let roleID;
                let employeeID;

                /// get ID of role selected
                for (i = 0; i < roles.length; i++) {
                    if (answer.role == roles[i].title) {
                        roleID = roles[i].id;
                    }
                }

                // get ID of employee selected
                for (i = 0; i < employees.length; i++) {
                    if (answer.employee == employees[i].Employee) {
                        employeeID = employees[i].id;
                    }
                }

                // update employee with new role
                connection.query(`UPDATE employee SET role_id = ${roleID} WHERE id = ${employeeID}`, (err, res) => {
                    if (err) return err;

                    // confirm update employee
                    console.log(`\n ${answer.employee} ROLE UPDATED TO ${answer.role}...\n `);

                    // back to main menu
                    init();
                });
            });
    });

}