import { NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as customResource from 'aws-cdk-lib/custom-resources';

export class CdkDynamoDbStack extends NestedStack {
    
  public readonly dynamoDbTable: dynamodb.Table;        
    
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    const tableName = 'books';

    const table = new dynamodb.Table(this, 'BooksTable', {
      tableName,
      partitionKey: { name: 'isbn', type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY
    });
    
    new customResource.AwsCustomResource(this, 'initDBResource', {
      onCreate: {
        service: 'DynamoDB',
        action: 'batchWriteItem',
        parameters: {
          RequestItems: {
            [tableName]: this.generateBatch(),
          },
        },
        physicalResourceId: customResource.PhysicalResourceId.of('initDynamoDbData'),
      },
      policy: customResource.AwsCustomResourcePolicy.fromSdkCalls({ resources: [table.tableArn] }),
    });
    
    this.dynamoDbTable = table;
  }

  private generateBatch = () => {
    return this.getBooks().map((elem) => {
      return { PutRequest: { Item: elem } };
    });
  };
  
  private getBooks = () => {
      return [
        {
          isbn: { S: '325-1-8462-231-9' },
          name: { S: 'Harry Potter and Sorcerer\'s Stone' },
          author: { S: 'J.K. Rowling'},
          price: { N: '16.25' },
          currency: { S: 'USD' },
          bookCategory: { S: 'Fantasy' }
        },
        {
          isbn: { S: '978-1-56619-909-4' },
          name: { S: '1984' },
          author: { S: 'George Orwell'},
          price: { N: '19.84' },
          currency: { S: 'USD' },
          bookCategory: { S: 'Dystopian' }
        },
        {
          isbn: { S: '849-5-66224-646-2' },
          name: { S: 'Invent and Wander: The Collected Writings of Jeff Bezos' },
          author: { S: 'Jeff Bezos'},
          price: { N: '3.79' },
          currency: { S: 'USD' },
          bookCategory: { S: 'Non-Fiction' }
        },

    ];
  }
}