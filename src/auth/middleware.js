'use strict';

const User = require('./users-model.js');

module.exports = (req, res, next) => {
  
  try {
    const authorizationHeader = req.headers.authorization; //new
    
    const splitHeader = authorizationHeader.split(/\s+/); //new
    let [authType, authString] = splitHeader;
    
    switch( authType.toLowerCase() ) {
    case 'basic': 
      return _authBasic(authString);
    case 'bearer':
      return _authBearer(authString);
    default: 
      return res.status(404).send();
    }
  }
  catch(e) {
    return res.status(404).send();
    // next(e);
  }
  
  function _authBasic(str) {
    // str: am9objpqb2hubnk=
    let base64Buffer = Buffer.from(str, 'base64'); // <Buffer 01 02 ...>
    let bufferString = base64Buffer.toString();    // john:mysecret
    let [username, password] = bufferString.split(':'); // john='john'; mysecret='mysecret']
    let auth = {username,password}; // { username:'john', password:'mysecret' }
    
    return User.authenticateBasic(auth)
      .then(user => _authenticate(user) )
      .catch(next);
  }

  function _authBearer(token){
    try{
      return User.authenticateToken(token)
        .then(_authenticate)
        .catch(next);
    }
    catch(error){
      res.status(404).send();
    }
  }

  function _authenticate(user) {
    if(user) {
      req.user = user;
      req.token = user.generateToken();
      next();
    }
    else {
      _authError();
    }
  }
  
  function _authError() {
    next('Invalid User ID/Password');
  }
  
};