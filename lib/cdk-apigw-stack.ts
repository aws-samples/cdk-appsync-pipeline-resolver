import { NestedStack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { HttpIamAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { getFunctionPath } from "./utils/utils";

export class CdkApiGwStack extends NestedStack {
    
  public readonly restApi: apigwv2.HttpApi;        
    
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id);
    
    const httpApi = new apigwv2.HttpApi(this, 'restApi', {
      description: 'Book Repository API',
      defaultAuthorizer: new HttpIamAuthorizer()
    });

    // Workaround to enable access logs on API GW v2-alpha which doesn't support it yet
    const accessLogsGroup = new logs.LogGroup(this, 'apiGatewayAccessLogs')
    const stage = httpApi.defaultStage?.node.defaultChild as apigw.CfnStage;
    stage.accessLogSettings = {
      destinationArn: accessLogsGroup.logGroupArn,
      format: JSON.stringify({
        requestId: '$context.requestId',
        userAgent: '$context.identity.userAgent',
        sourceIp: '$context.identity.sourceIp',
        requestTime: '$context.requestTime',
        requestTimeEpoch: '$context.requestTimeEpoch',
        httpMethod: '$context.httpMethod',
        path: '$context.path',
        status: '$context.status',
        protocol: '$context.protocol',
        responseLength: '$context.responseLength',
        domainName: '$context.domainName'
      })
    }
    
    const getBookPricingLambda = new lambda.Function(this, 'get-book-pricing', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'getBookPricing.main',
      code: lambda.Code.fromAsset(getFunctionPath('')),
    });
    
    httpApi.addRoutes({
      path: '/book/{isbn}',
      methods: [apigwv2.HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'get-book-pricing-integration',
        getBookPricingLambda,
      ),
    });
    
    this.restApi = httpApi;
  }
}
