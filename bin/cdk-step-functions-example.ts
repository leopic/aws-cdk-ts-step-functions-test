#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkStepFunctionsExampleStack } from '../lib/cdk-step-functions-example-stack';

const app = new cdk.App();
new CdkStepFunctionsExampleStack(app, 'CdkStepFunctionsExampleStack');
