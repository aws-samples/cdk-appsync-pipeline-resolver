async function main(event) {
  const isbn = event.pathParameters.isbn;
  
  if (!(typeof isbn === 'string')) {
    return {
      body: JSON.stringify({
        error: 'Invalid data format'
      }),
      statusCode: 400
    }
  }

  const bookData = books.filter(elem => elem.isbn === isbn);
  
  if (bookData) {
    return {
      body: JSON.stringify(
        bookData
      ),
      statusCode: 200,
    };
  } else {
    return {
      body: JSON.stringify({
        error: 'Book not found'
      }),
      statusCode: 404
    }
  }
  
}

const books = [
  {
    isbn: '325-1-8462-231-9',
    priceId: 'Fruit Books',
    price: '20.25',
    currency: 'USD'
  },
  {
    isbn: '325-1-8462-231-9',
    priceId: 'MicroBooks',
    price: '19.85',
    currency: 'USD'
  },
  {
    isbn: '978-1-56619-909-4',
    priceId: 'MicroBooks',
    price: '17.48',
    currency: 'USD'
  },
  {
    isbn: '849-5-66224-646-2',
    priceId: 'MicroBooks',
    price: '4.50',
    currency: 'USD'
  },
];

module.exports = { main };