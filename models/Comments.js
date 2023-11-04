module.exports = (sequelize, DataTypes) => {
    const Comments = sequelize.define("Comments", {
      CommentBody: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      Post: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      
     
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      
    });
  
    Comments.associate = (models) => {
      Comments.belongsTo(models.Topics, {
        foreignKey: "TopicId",
        onDelete: "cascade",
        //foreign key for similar associates must be dsame
       
      });
      Comments.belongsTo(models.Users, {
        foreignKey: 'UserId',
        as: 'User', //alias
        onDelete: "cascade",
      });
    };
  
    return Comments;
  };
  