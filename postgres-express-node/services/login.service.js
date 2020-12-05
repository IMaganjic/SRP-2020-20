const { config } = require("winston");


class LoginService {
  constructor({ logger, userModel }) {
    this.userModel = userModel;
    this.logger = logger;
  }

  async login({username, password}) {
    const userRecord = await this.userModel.findOne({
      where: { username },
    });

    if(!userRecord){

      this.logger.error("User not registerd");
      throw new Error("Authentication failed");
    }

    this.logger.info("Checking password")
    if(userRecord.password === password){

      this.logger.info("Password correct, proceed and generate JTW")
      const user= {
        username: userRecord.username,
        role: userRecord.role || "guest"
      }

      const payload = {

        ... user,
        and: config.jwt.audience || "localhost/api",
        iss: config.jwt.issuer || "localhost@fesb",
      
      };

      const token = this.generateToken(payload);

      return {user, token};
    }

    this.logger.error("Invalid password");
    throw new Error("Authentication failed");
    


    }



    generateToken(payload){
      return jwt.sign(payload, config.jwt.secret,{expiresIn: config.jwt.expiresIn});
    }
  }

  
 

module.exports = LoginService;
