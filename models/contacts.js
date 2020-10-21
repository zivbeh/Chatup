'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contacts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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