const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ChatHistory = sequelize.define('ChatHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  userMessage: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  botResponse: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  intent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  symptomsIdentified: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  tableName: 'chat_histories',
  timestamps: true
});
return ChatHistory;
};
