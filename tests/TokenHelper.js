const UsersTableTestHelper = require('./UsersTableTestHelper');
const Jwt = require('@hapi/jwt');

const TokenHelper = {
  async createAccessToken(username, id) {
    await UsersTableTestHelper.addUser({username, id});
    return Jwt.token.generate({username, id}, process.env.ACCESS_TOKEN_KEY);
  },
};

module.exports = TokenHelper;
