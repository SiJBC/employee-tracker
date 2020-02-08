
const mysql = require("mysql");
const inquirer = require("inquirer");
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
function mainMenu(){

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
            case "Update employee manager":
                updateEmpMngr();
                break;
        }
    })
}

function viewEmp(){
    var query = "SELECT all"
}