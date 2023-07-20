const crypto = require('crypto');
const fs =require("fs");
const fsPromises = fs.promises;

let  generatorOfFilesWithRandomData = {};

    generatorOfFilesWithRandomData.readBufferFromFile = async function (filename="") {
        let outBuffer = await fsPromises.readFile (filename);
        return outBuffer;
    }

   
   
    generatorOfFilesWithRandomData.makeRandomFileWithInt32 = async function(par={fileName:"1.rnd",max:10, amountOfRecords:256 }){
        //32bits
        par.max  &= 0xFFFFFFFF;
      ///open file readable stream
      let wrStream = fs.createWriteStream(`./${par.fileName}`, {flags:"w", encoding:null});
           
           let outBuffer = Buffer.allocUnsafe(4);
           for (let count = 0; count < par.amountOfRecords; count++) {
                await new Promise((resolve, reject) => {
                    crypto.randomInt(par.max, (err,num)=>{
                        if(err){
                            reject(err);
                            return;
                        }
                        outBuffer.writeInt32BE(num);
                        resolve();
                    })
                    
                });
                //write into disk
                await new Promise((resolve, reject) => {
                    wrStream.write(outBuffer,(err)=>{
                        if(err){
                            reject(err)
                        }
                        else{
                            resolve()
                        }
                    })
                });
                
               
           }
           wrStream.end();
           
    }
module.exports = generatorOfFilesWithRandomData;