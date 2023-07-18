const mysql = require("mysql2");
class MyDb{
 #pool;
 
    constructor(par={database: "mydb", password:"", user:"root", host:"localhost"}){
            this.#pool = mysql.createPool({
                host: par.host,
                user: par.user,
                database: par.database,
                password: par.password,
                connectionLimit: 10,
            })
    }

    ///create a simple  table in second NF 
    async initSecondNFTable(){
        let makeTableCommand = "CREATE TABLE IF NOT EXISTS `mydb`.`students1` ("+
            "`st_id` INT NOT NULL,"+
            "`name` VARCHAR(32) NULL,"+
            " `surname` VARCHAR(32) NULL,"+
            "`city` VARCHAR(32) NULL,"+
            "`faculty` VARCHAR(32) NULL,"+
            "`group` INT NULL,"+
            " PRIMARY KEY (`st_id`));"
            try {
                let result = await this.#pool.promise().query(makeTableCommand);
                return result;
            } catch (e) {
                throw new Error(e);
            }
    } 

    ///insert 

    // insert row info a simple table in 2nd NF
    async insertRowIntoStudents1 (arg={st_id:1, name:"", surname:"", city:"",faculty:"", group:""}) {

        let result = await this.#pool.promise().query(`INSERT INTO students1 (st_id, name, surname, city, faculty, group) VALUES (?, ?, ?, ?, ?, ?)`,
                    [arg.st_id, arg.name, arg.surname, arg.city, arg.faculty, arg.group]);
    }

    // 1)students2
    async _createStudents2(){
        let makeTableCommand = "CREATE TABLE IF NOT EXISTS`mydb`.`students2` ("
            "`st_id` INT NOT NULL,"+
            "`name` VARCHAR(32) NULL,"+
            "`surname` VARCHAR(32) NULL,"+
            "PRIMARY KEY (`st_id`));"
            
                let result = await this.#pool.promise().query(makeTableCommand);
                return result;
           
    } 
    //2)cities2
   async _createCities2 () {
        let makeTableCommand = "CREATE TABLE IF NOT EXISTS `mydb`.`cities2` ("+
        "`city_id` INT NOT NULL,"+
        "`city` VARCHAR(32) NULL,"+
        "PRIMARY KEY (`city_id`));"

       
                let result = await this.#pool.promise().query(makeTableCommand);
                return result;
           
   }

   //3)student_faculty

   async _createStudentFaculty() {
    let makeTableCommand = "CREATE TABLE `mydb`.`faculties2` ("+
        "`fac_id` INT NOT NULL,"+
        "`faculty` VARCHAR(32) NULL,"+
        "PRIMARY KEY (`fac_id`));"
          
                let result = await this.#pool.promise().query(makeTableCommand);
                return result;
             
   }

///
async _makeStudentCity() {
   let makeTableCommand = "CREATE TABLE IF NOT EXISTS `mydb`.`student_city2` ("+
  "`st_id` INT NOT NULL,"+
  "`city_id` INT NULL,"+
  "PRIMARY KEY (`st_id`),"+
 " INDEX `student_city2_city_id_idx` (`city_id` ASC) VISIBLE,"+
  "CONSTRAINT `student_city2_st_id`"+
    "FOREIGN KEY (`st_id`)"+
    "REFERENCES `mydb`.`students2` (`st_id`)"+
    "ON DELETE NO ACTION"+
    "ON UPDATE NO ACTION,"+
  "CONSTRAINT `student_city2_city_id`"+
   " FOREIGN KEY (`city_id`)"+
   " REFERENCES `mydb`.`cities2` (`city_id`)"+
   "ON DELETE NO ACTION"+
   " ON UPDATE NO ACTION);"
 
                let result = await this.#pool.promise().query(makeTableCommand);
                return result;
}

async _createGroups2() {
    let makeTableCommand = "CREATE TABLE IF NOT EXISTS `mydb`.`groups2` ("+
  "`gr_id` INT NOT NULL,"+
  "`fac_id` INT NOT NULL,"+
  "PRIMARY KEY (`gr_id`),"+
  "INDEX `groups2_fac_id_idx` (`fac_id` ASC) VISIBLE,"+
  "CONSTRAINT `groups2_fac_id`"+
    "FOREIGN KEY (`fac_id`)"+
    "REFERENCES `mydb`.`faculties2` (`fac_id`)"+
    "ON DELETE NO ACTION"+
    "ON UPDATE NO ACTION);"

    let result = await this.#pool.promise().query(makeTableCommand);
                return result;
}




}