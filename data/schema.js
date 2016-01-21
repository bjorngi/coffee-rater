import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull
} from 'graphql';
import Db from './db';

const User = new GraphQLObjectType({
  name: 'User',
  description: 'This represents a User',
  fields: () => {
    return {
      id: {
        type: GraphQLInt,
        resolve(user) {
          return user.id;
        }
      },
      username: {
        type: GraphQLString,
        resolve(user) {
          return user.username;
        }
      },
      email: {
        type: GraphQLString,
        resolve(user) {
          return user.email;
        }
      },
      avatar: {
        type: GraphQLString,
        resolve(user) {
          return user.avatar;
        }
      },
      reviews: {
        type: new GraphQLList(Review),
        resolve(user) {
          return user.getReviews();
        }
      }
    }
  }
});

const Brewery = new GraphQLObjectType({
  name: 'Brewery',
  description: 'This represents a Brewery',
  fields: () => {
    return {
      name: {
        type: GraphQLString,
        resolve(brewery) {
          return brewery.name;
        }
      },
      country: {
        type: GraphQLString,
        resolve(brewery) {
          return brewery.country;
        }
      },
      coffees: {
        type: new GraphQLList(Coffee),
        resolve(brewery) {
          return brewery.getCoffees()
        }
      }
    }
  }
});

const Coffee = new GraphQLObjectType({
  name: 'Coffee',
  description: 'This represents a Coffee',
  fields: () => {
    return {
      name: {
        type: GraphQLString,
        resolve(coffee) {
          return coffee.name;
        }
      },
      reviews: {
        type: new GraphQLList(Review),
        resolve(coffee) {
          return coffee.getReviews();
        }
      },
      brewery: {
        type: Brewery,
        resolve(coffee) {
          return coffee.getBrewery();
        }
      }
    }
  }
});

const Review = new GraphQLObjectType({
  name: 'Review',
  description: 'This represents a Review',
  fields: () => {
    return {
      score: {
        type: GraphQLInt,
        resolve(review) {
          return review.score;
        }
      },
      user: {
        type: User,
        resolve(review) {
          return review.getUser();
        }
      },
      coffee: {
        type: Coffee,
        resolve(review) {
          return review.getCoffee();
        }
      }
    }
  }
});

const Query = new GraphQLObjectType({
  name: 'Query',
  description: 'Root query',
  fields: () => {
    return {
      users: {
        type: new GraphQLList(User),
        args: {
          id: {
            type: GraphQLInt
          },
          email: {
            type: GraphQLString
          },
          username: {
            type: GraphQLString
          }
        },
        resolve(root, args) {
          return Db.models.user.findAll({where: args});
        }
      },
      breweries: {
        type: new GraphQLList(Brewery),
        resolve(root, args) {
          return Db.models.brewery.findAll({where: args});
        }
      },
      reviews: {
        type: new GraphQLList(Review),
        resolve(root, args) {
          return Db.models.review.findAll({where: args});
        }
      },
      coffees: {
        type: new GraphQLList(Coffee),
        resolve(root, args) {
          return Db.models.coffee.findAll({where: args});
        }
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'This is a mutation',
  fields: () => {
    return {
      addReview: {
        type: Review,
        args: {
          score: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          user: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          coffee: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          comment: {
            type: GraphQLString
          }
        },
        resolve(source, args) {
          if(args.score > 9 || args.score < 0) {
            throw Error('scoreOutOfBounds');
          }

          return Db.models.review.create({
            score: args.score,
            coffee: args.brewery,
            userId: args.user,
            coffeeId: args.coffee,
            comment: args.comment
          });
        }
      }
    }
  }
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});

export default Schema;
