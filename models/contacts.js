'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contacts extends Model {
    static associate(models) {
      this.belongsTo(models.Users);
    }
  };
  Contacts.init({
    userName: DataTypes.STRING,
    RealUserId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Contacts',
  });
  return Contacts;
};