const bcrypt = require('bcryptjs')

module.exports.validate_login = (to_validate, password) => {
    
    if (to_validate == password){
        return true
    }else{
        return false
    }
}


module.exports.saltPassword = async(password) =>{
    console.log("Starting to hash the password ", password)
    const hash = await bcrypt.hash(password, 10)
    return hash
}


module.exports.verify_password = async(hashed_password, password) => {
    return await bcrypt.compare(password, hashed_password)
}


