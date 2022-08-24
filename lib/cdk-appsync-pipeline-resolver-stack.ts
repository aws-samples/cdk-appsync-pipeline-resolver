import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';

import {
  getMappingTemplatePath,
  getRootPath
} from "./utils/utils";

import { CdkApiGwStack } from './cdk-apigw-stack';
import { CdkDynamoDbStack } from './cdk-dynamodb-stack';

export class CdkAppsyncPipelineResolverStack extends Stack {
  constructor(scope: Construct, id: string, props? : StackProps) {
    super(scope, id, props);
    
    const apiName = 'bookPricingAPI';

    const { apiEndpoint } = new CdkApiGwStack(this, 'apigw-stack').restApi;
    const { dynamoDbTable } = new CdkDynamoDbStack(this, 'dynamodb-stack');

    // AppSync API
    const api = new appsync.GraphqlApi(this, apiName, {
      name: apiName,
      schema: appsync.Schema.fromAsset(getRootPath('./schema/schema.graphql')),
      logConfig: {
        excludeVerboseContent: false,
        fieldLogLevel: appsync.FieldLogLevel.ALL
      },
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.IAM
        }
      }
    });
    
    // DynamoDB Data Source
    const dynamoDbDataSource = api.addDynamoDbDataSource('dynamoDbDataSource', dynamoDbTable);

    // HTTP Data Source
    const httpDataSource = api.addHttpDataSource(
      'httpDataSource',
      apiEndpoint,
      {
        authorizationConfig: {
          signingRegion: Stack.of(this).region,
          signingServiceName: 'execute-api'
        }
      }
    );

    const appSyncHttpDataSourceRole = new iam.Role(this, 'appSyncHttpDataSourceRole', {
      assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonAPIGatewayInvokeFullAccess',
        ),
      ],
    });

    httpDataSource.ds.serviceRoleArn = appSyncHttpDataSourceRole.roleArn;
    
    // AppSync Functions
    const f1 = new appsync.AppsyncFunction(this, 'f1', {
      api,
      name: 'getInternalBookPricing',
      dataSource: dynamoDbDataSource,
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem("isbn", "isbn"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(getMappingTemplatePath('Query.getInternalBookPricing.res.vtl')),
    });
    
    const f2 = new appsync.AppsyncFunction(this, 'f2', {
      api,
      name: 'getExternalBookPricing',
      dataSource: httpDataSource,
      requestMappingTemplate: appsync.MappingTemplate.fromFile(getMappingTemplatePath('Query.getBookPricings.req.vtl')),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(getMappingTemplatePath('Query.getBookPricings.res.vtl')),
    });
    
    //Pipeline resolver 
    new appsync.Resolver(this, 'getBookPricingPipelineResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getBookPricing',
      pipelineConfig: [f1, f2],
      requestMappingTemplate: appsync.MappingTemplate.fromString('{}'),
      responseMappingTemplate:appsync.MappingTemplate.fromString('$util.toJson($ctx.result)'),
    })
  }
}
