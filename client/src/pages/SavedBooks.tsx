import { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import { REMOVE_BOOK } from '../graphql/mutations.ts';

import { removeBookId } from '../utils/localStorage';

interface Book {
  bookId: string;
  authors: string[];
  description: string;
  title: string;
  image: string;
  link: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  bookCount: number;
  savedBooks: Book[];
}

const SavedBooks = () => {
  const [userData, setUserData] = useState<User>({
    _id: '',
    username: '',
    email: '',
    bookCount: 0,
    savedBooks: [],
  });

  const { loading, data, error: queryError } = useQuery(GET_ME);
  const [removeBook, { error: mutationError }] = useMutation(REMOVE_BOOK);

  useEffect(() => {
    if (data?.me) {
      setUserData(data.me);
    }
  }, [data]);

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId: string) => {
    try {
      const { data } = await removeBook({
        variables: { bookId }
      });
      setUserData(data.removeBook);
      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  if (queryError) {
    return <h2>Error loading your saved books!</h2>;
  }

  if (mutationError) {
    return <h2>Error removing book!</h2>;
  }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col md='4' key={book.bookId}>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {book.link && (
                      <a href={book.link} target="_blank" rel="noopener noreferrer">
                        <Button variant='outline-dark' className='mb-2'>
                          View on Google Books
                        </Button>
                      </a>
                    )}
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;