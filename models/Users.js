module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define("Users", {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      
    },
    balance: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true,
      defaultValue:0.00
    },
  });
  Users.associate = (models) => {
    Users.hasMany(models.Topics, {
      
    });
    Users.hasMany(models.Likes, {
      
    });
    Users.hasMany(models.Views, {
      
    });
    Users.hasMany(models.Comments, {
      foreignKey: 'UserId',
      as: 'Comments', //alias
    });
    
  };

  return Users;
};
