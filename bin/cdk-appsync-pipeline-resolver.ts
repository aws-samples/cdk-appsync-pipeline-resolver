#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkApiGwStack } from '../lib/cdk-apigw-stack';
import { CdkDynamoDbStack } from '../lib/cdk-dynamodb-stack';
import { CdkAppsyncPipelineResolverStack } from '../lib/cdk-appsync-pipeline-resolver-stack';

const app = new cdk.App();

new CdkAppsyncPipelineResolverStack(app, 'CdkAppsyncPipelineResolverStack', {
  env: { region: "us-east-1" }
});