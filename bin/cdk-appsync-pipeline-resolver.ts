#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkAppsyncPipelineResolverStack } from '../lib/cdk-appsync-pipeline-resolver-stack';

const app = new cdk.App();

new CdkAppsyncPipelineResolverStack(app, 'CdkAppsyncPipelineResolverStack', {

});