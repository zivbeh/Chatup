'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class messages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Users);
      this.belongsTo(models.ChatRoom);
    }
  };
  messages.init({
    message: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Message',
  });
  return messages;
};