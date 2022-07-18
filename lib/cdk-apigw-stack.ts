import { NestedStack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { getFunctionPath } from "./utils/utils";

export class CdkApiGwStack extends NestedStack {
    
  public readonly restApi: apigw.HttpApi;        
    
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);
    
    const httpApi = new apigw.HttpApi(this, 'restApi', {
      description: 'Book Repository API'
    });
    
    const getBookPricingLambda = new lambda.Function(this, 'get-book-pricing', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'getBookPricing.main',
      code: lambda.Code.fromAsset(getFunctionPath('')),
    });
    
    
    httpApi.addRoutes({
      path: '/book/{isbn}',
      methods: [apigw.HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'get-book-pricing-integration',
        getBookPricingLambda,
      ),
    });
    
    this.restApi = httpApi;
  }
}
