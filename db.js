const mysql = require("mysql2");
const fsPromises= require("fs").promises;
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
    
    async closeConnectionPool(){
       return new Promise((resolve, reject) => {
                this.#pool.end((err)=>{
                if(err){
                    reject(err);
                }else {
                    resolve();
                }
            })
        });
        
    }
    ///create a simple  table in second NF 
    async initSecondNFTable(){
        let makeTableCommand = "CREATE TABLE IF NOT EXISTS `mydb`.`students1` ("+
            "`st_id` INT NOT NULL,"+
            "`sname` VARCHAR(32) NULL,"+
            " `surname` VARCHAR(32) NULL,"+
            "`city` VARCHAR(32) NULL,"+
            "`faculty` VARCHAR(64) NULL,"+
            " `gr_name` VARCHAR(64) NULL, "+
            " PRIMARY KEY (`st_id`));"
            try {
                let result = await this.#pool.promise().query(makeTableCommand);
                return result;
            } catch (e) {
                throw new Error(e);
            }
    } 

    async initThridNFDatabase(){
        await this._createStudents2();
        await this._createCities2();
        await this._createFaculties2()
        await this._createStudentCity2();
        await this._createGroupsFac2();
      
        await this._createStudentGroup2();
    }

    ///insert 

    // insert row info a simple table in 2nd NF
    async insertRowIntoStudents1 (arg={st_id:1, name:"", surname:"", city:"",faculty:"", gr_name:"jhg"}) {

        let result = await this.#pool.promise().query(`INSERT INTO students1 (st_id, sname, surname, city, faculty, gr_name) VALUES (?, ?, ?, ?, ?, ?);`,
                    [arg.st_id, arg.name, arg.surname, arg.city, arg.faculty, arg.group]);
    }

    // 1)students2
    async _createStudents2(){
        let makeTableCommand = "CREATE TABLE IF NOT EXISTS `mydb`.`students2` ("+
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

   async _createFaculties2() {
    let makeTableCommand = "CREATE TABLE IF NOT EXISTS `mydb`.`faculties2` ("+
        "`fac_id` INT NOT NULL,"+
        "`faculty` VARCHAR(64) NULL,"+
        "PRIMARY KEY (`fac_id`));"
          
                let result = await this.#pool.promise().query(makeTableCommand);
                return result;
             
   }

    ///
    async _createStudentCity2() {
    let makeTableCommand = "CREATE TABLE IF NOT EXISTS `mydb`.`student_city2` ("+
    "`st_id` INT NOT NULL,"+
    "`city_id` INT NOT NULL,"+
    " PRIMARY KEY (`st_id`),"+
    " INDEX `student_city2_city_id_idx` (`city_id` ASC),"+
    " CONSTRAINT `student_city2_st_id` "+
        " FOREIGN KEY (`st_id`) "+
        " REFERENCES `mydb`.`students2` (`st_id`) "+
        " ON DELETE NO ACTION "+
        " ON UPDATE NO ACTION,"+
    " CONSTRAINT `student_city2_city_id` "+
    " FOREIGN KEY (`city_id`) "+
    " REFERENCES `mydb`.`cities2` (`city_id`) "+
    "ON DELETE NO ACTION"+
    " ON UPDATE NO ACTION);"
    
            let result = await this.#pool.promise().query(makeTableCommand);
            return result;
    }

    async _createGroupsFac2() {
        let makeTableCommand = "CREATE TABLE IF NOT EXISTS `mydb`.`groups_fac2` ("+
    "`gr_id` INT NOT NULL, "+
    " `fac_id` INT NOT NULL, "+
    " `gr_name` VARCHAR (64) NULL, "+
    " PRIMARY KEY (`gr_id`,`fac_id`), "+
    " INDEX `groups2_fac_id_idx` (`fac_id` ASC), "+
    " CONSTRAINT `groups2_fac_id` "+
        " FOREIGN KEY (`fac_id`)"+
        " REFERENCES `mydb`.`faculties2` (`fac_id`)"+
        " ON DELETE NO ACTION"+
        " ON UPDATE NO ACTION);"

        let result = await this.#pool.promise().query(makeTableCommand);
                    return result;
    }

    async _createStudentGroup2(){
        let makeTableCommand = "CREATE TABLE IF NOT EXISTS `mydb`.`student_group2` (" +
        "`st_id` INT NOT NULL, " +
        "`gr_id` INT NOT NULL, " +
        "`fac_id` INT NOT NULL, " +
        "PRIMARY KEY (`st_id`), " +
        "INDEX `st_gr_fac_id_idx` (`fac_id` ASC), " +
        "CONSTRAINT `st_gr_fac_id` " +
        "FOREIGN KEY (`fac_id`) " +
        "REFERENCES `mydb`.`faculties2` (`fac_id`) " +
        "ON DELETE NO ACTION " +
        "ON UPDATE NO ACTION, " +
        "INDEX `student_group2_1gr_id_idx` (`gr_id` ASC), " +
        "CONSTRAINT `student_group2_st_id` " +
        "FOREIGN KEY (`st_id`) " +
        "REFERENCES `mydb`.`students2` (`st_id`) " +
        "ON DELETE NO ACTION " +
        "ON UPDATE NO ACTION, " +
        "CONSTRAINT `student_group2_1gr_id` " +
        "FOREIGN KEY (`gr_id`) " +
        "REFERENCES `mydb`.`groups_fac2` (`gr_id`) " +
        "ON DELETE NO ACTION " +
        "ON UPDATE NO ACTION);";

        let result = await this.#pool.promise().query(makeTableCommand);
                    return result;
    }

 

 async insertIntoStudents2(arg={st_id:1, name:"", surname:""}) {
    let result = await this.#pool.promise().query(`INSERT INTO students2 (st_id, name, surname) VALUES (?,?,?)`,
                    [arg.st_id, arg.name, arg.surname]);

    return result;
 }

  async insertIntoStudentCity2(arg={st_id:1, city_id:2}) {
    let result = await this.#pool.promise().query(`INSERT INTO student_city2 (st_id,city_id) VALUES (?,?)`,
                    [arg.st_id, arg.city_id]);

    return result;
 }

   async insertIntoCities2(arg={city_id:1, city:""}) {
    let result = await this.#pool.promise().query(`INSERT INTO cities2 (city_id, city) VALUES (?,?)`,
                    [arg.city_id, arg.city]);

        return result;
    }

 

    
    async insertIntoFaculties2 (arg={fac_id:1, faculty:2}) {
        let result = await this.#pool.promise().query(`INSERT INTO faculties2 ( fac_id, faculty) VALUES (?,?)`,
                    [arg.fac_id, arg.faculty]);

        return result;
    }

     async insertIntoGroupsFac2 (arg={fac_id:1, gr_id:2, gr_name:"jg"}) {
        let result = await this.#pool.promise().query(`INSERT INTO groups_fac2 ( fac_id, gr_id, gr_name) VALUES (?,?,?)`,
                    [arg.fac_id, arg.gr_id, arg.gr_name]);

        return result;
    }

       async insertIntoStudentGroup2 (arg={st_id:1, gr_id:2, gr_name:"r"}) {
            let result = await this.#pool.promise().query(`INSERT INTO student_group2 ( st_id, gr_id, gr_name) VALUES (?,?,?)`,
                    [arg.st_id, arg.gr_id, arg.gr_name]);

            return result;
        }
          //fills tables 'facukties2' 'groups_fac2' by values from object 'lst' - array.js
        async fillFacultiesAndGroupsByStdValues (lst={}) {
            ///get faculties as keys
            let arrayOfFaculties = Object.keys(lst.faculties);
            for (let idx=0; idx<arrayOfFaculties.length; idx++) {
                await this.insertIntoFaculties2({fac_id:idx, faculty:arrayOfFaculties[idx]});
                    //get groups in according to the faculty
                    let arrayOfGroups = lst.faculties[arrayOfFaculties[idx]];
                        for(let gridx=0; gridx<arrayOfGroups.length; gridx++) {
                            await this.insertIntoGroupsFac2({fac_id: idx, gr_id: gridx, gr_name: arrayOfGroups[gridx] });
                        }
            }
        }
        //fills table 'students1' 2NF by random values.Data gets from arrays thas had been generated later and the inform object (arrays.js)

        async fillSecNFTable (info_template={}, numbOfStudents = 10, fReader) {
            //read files.Values in this Buffers must be 32bit integer
            let nameBuf, surnameBuf, cityBuf, facultyBuf, grBuf;
            let facultyNames = Object.keys(info_template.faculties);
            let mainCurrentPosition = 0;
            let primaryKey =0; //PK for table
            while (primaryKey < numbOfStudents) {
                if (mainCurrentPosition >= 0) {
                    //read chunks until EOF
                    let result = await fReader.readChunkFromFile('names.rnd', 20000 ,mainCurrentPosition );
                    nameBuf = result.buffer;
                    result = await fReader.readChunkFromFile('surnames.rnd', 20000 ,mainCurrentPosition );
                    surnameBuf = result.buffer;
                    result = await fReader.readChunkFromFile('cities.rnd', 20000 ,mainCurrentPosition );
                    cityBuf = result.buffer;
                    result = await fReader.readChunkFromFile('faculties.rnd', 20000 ,mainCurrentPosition );
                    facultyBuf = result.buffer;
                    result = await fReader.readChunkFromFile('groups.rnd', 20000 ,mainCurrentPosition );
                    grBuf = result.buffer;
                    if (grBuf.bytesRead) {
                        mainCurrentPosition += grBuf.bytesRead;
                    } else {
                        return;
                        mainCurrentPosition = -1;
                    }
                   
                }
                //processing chunks of data.Increment index by 4 - because Int32
                for (let indexes=0; indexes < nameBuf.length; indexes=indexes + 4){
                    let namePtr = nameBuf.readInt32BE(indexes);
                    let surnamePtr = surnameBuf.readInt32BE(indexes);
                    let cityPtr = cityBuf.readInt32BE(indexes);
                    let facultyPtr = facultyBuf.readInt32BE(indexes);
                    let grPtr = grBuf.readInt32BE(indexes);

                    let nameVal = info_template.names[namePtr];
                    let surnameVal = info_template.surnames[namePtr];
                    let cityVal = info_template.cities[cityPtr];
                    let facultyVal = facultyNames[facultyPtr];
                    let grVal = info_template.faculties[ (facultyNames[facultyPtr]) ][ grPtr ];
                    //write into DB
                    await this.insertRowIntoStudents1({
                            st_id: primaryKey,
                            name: nameVal,
                            surname: surnameVal,
                            city: cityVal,
                            faculty: faculty,
                            gr_name: grVal,
                        })
                        //increment student ID
                    primaryKey++;

                }



            }
        }


}

module.exports={MyDb};