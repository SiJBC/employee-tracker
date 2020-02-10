
const mysql = require("mysql");
const inquirer = require("inquirer");
// const promisemysql = require("promise-mysql");

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
    var employee = {}
    var query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) "

    inquirer.prompt([{
        name: "firstName",
        type: "input",
        message: "What is your employees first name ?"
    },
    {
        name: "lastName",
        type: "input",
        message: "What is your employees last name ?"
    },
    {
        name: "roleID",
        type: "list",
        message:"What is your employees role",
        choices: [
            {
                name: "Stylist",
                value: 1
            },
            {
                name: "Assistant Store Manager",
                value: 2
            }
        ]
    },
    {
        name: "managerID",
        type: "input",
        message: "What is your manager's id?"
    }
    ])
    .then ((answer) => { 
        employee = { 
            id:12,
            first_name: answer.firstName, 
            last_name: answer.lastName, 
            // role_id: answer.roleId, 
            // manager_id: answer.managerID

        }

var queryBuilder = `INSERT INTO employee (first_name, last_name, role_id, manager_id)  
VALUES ("${answer.firstName}", "${answer.lastName}", `
        console.log(queryBuilder)

        connection.query(queryBuilder, (err, res) => {
            if (err) return err;
    
            console.log("1")
     
        console.log(`${answer.firstName} ${answer.lastName} has been added to your employee database`)
                return
        });
    })



}

// look into mysql documentation for update employee 
