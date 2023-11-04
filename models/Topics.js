module.exports = (sequelize, DataTypes) => {
    const Topics = sequelize.define("Topics", {
      topic: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT, // Use TEXT datatype for lengthy text
    allowNull: false,
      },
      views: {
        type: DataTypes.INTEGER, // Use TEXT datatype for lengthy text
    allowNull: true,
    defaultValue: 0, // Set a default value, e.g., 0
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
     
      category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true
      },
     
    });
  
    
    Topics.associate = (models) => {
        Topics.belongsTo(models.Users, {
          foreignKey: "UserId",
          
        });
      };

      Topics.associate = (models)=>{
        Topics.hasMany(models.Comments, { onDelete: "cascade",
        
      });
      Topics.hasMany(models.Likes,{
        onDelete: "cascade",
      });
      Topics.hasMany(models.Views,{
        onDelete: "cascade",
      });
      }
    return Topics;
  };