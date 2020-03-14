const fs = require('fs');

const deleteFile = (filePath)=>{
    // fs unlink just deletes any file and it's not in a sync way
    fs.unlink(filePath, (err)=>{
        if(err){
            throw (err);
        }
    })
}

exports.deleteFile = deleteFile;

