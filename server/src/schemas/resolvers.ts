import { BookDocument } from '../models/Book.js';
import User from '../models/User.js';
import { signToken, AuthenticationError } from '../services/auth.js';

interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    savedBooks: BookDocument[];
    bookCount: number
}

interface UserArgs {
    username: string
}

interface CreateUserArgs {
    input: {
        username: string;
        email: string;
        password: string;
        savedBooks: BookInput[]
    }
}

interface LoginArgs {
    email: string,
    password: string
}

interface BookInput {
    authors: [string];
    description: string;
    bookId: string;
    image: string;
    link: string;
    title: string;
}

interface DeleteBookArgs {
    bookId: string
}



const resolvers = {
    Query: {
        user: async (_parent: any, { username }: UserArgs): Promise<User | null> => {
            return await User.findOne(
                { username }
            );
        },

        me: async (_parent: any, _args: unknown, context: any): Promise<User | null> => {
            if (context.user) {
              // If user is authenticated, return their profile
              return await User.findOne({ _id: context.user._id });
            }
            // If not authenticated, throw an authentication error
            throw new AuthenticationError('Not Authenticated');
          }
    },

    Mutation: {
        createUser: async (_parent: any, { input }: CreateUserArgs): Promise<{ token: string; user: User }> => {
           
            const user = await User.create({ ...input });
            const token = signToken(user.username, user.email, user._id);
      
            return { user, token };
        },

        loginUser: async (_parent: any, { email, password}: LoginArgs): Promise<{ token: string; user: User }> => {
         
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

      
            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Not authenticated')
            }

            const token = signToken(user.username, user.email, user.id);

            return { token, user }
        },

        saveBook: async (_parent: any, { input }: { input: BookInput }, context: any): Promise<User | null> => {
            if (context.user) {
                return await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: input } },
                    { new: true, runValidators: true }
                )
            }

            throw new AuthenticationError('Could not find user');
        },
        
        deleteBook: async (_parent: any, { bookId }: DeleteBookArgs, context: any): Promise<User | null> => {
            if (context.user) {
                return await User.findOneAndUpdate(
                    { _id: context.user._id},
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );
            }

            throw new AuthenticationError('Could not find user')
        }
    }
};

export default resolvers