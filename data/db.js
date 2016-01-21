import Sequelize from 'sequelize';
import Faker from 'faker';
import _ from 'lodash';

const Conn = new Sequelize(
  'coffee',
  'postgres',
  'postgres',
  {
    dialect: 'postgres',
    host: 'localhost',
  }
)

// Models
const User = Conn.define('user', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true
    }
  },
  avatar: {
    type: Sequelize.STRING,
  }
});

const Brewery = Conn.define('brewery', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  country: {
    type: Sequelize.STRING,
  }
});

const Coffee = Conn.define('coffee', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const Review = Conn.define('review', {
  score: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  comment: {
    type: Sequelize.STRING
  }
});

// Relationships
User.hasMany(Review);
Review.belongsTo(User);

Coffee.hasMany(Review);
Review.belongsTo(Coffee);

Brewery.hasMany(Coffee);
Coffee.belongsTo(Brewery);


// Generate database data
if(process.env.npm_lifecycle_event === 'dev') {
  Conn.sync({ force: true }).then(() => {
    var userlist = [];
    _.times(10, () => {
      return User.create({
        avatar: Faker.internet.avatar(),
        username: Faker.internet.userName(),
        email: Faker.internet.email(),
        password: Faker.internet.password()
      }).then(user => {
        userlist.push(user);
      });
    });

    _.times(5, () => {
      return Brewery.create({
        name: Faker.company.companyName(),
        country: Faker.address.country()
      }).then(brewery => {
        _.times(5, () => {
          return brewery.createCoffee({
            name: Faker.commerce.productName(),
          }).then(coffee => {
            _.times(3, () => {
              return coffee.createReview({
                userId: _.sample(userlist).id,
                score: _.random(0,9),
              });
            });
          })
        })
      })
    })
  });
} else {
  Conn.sync();
}

export default Conn;
