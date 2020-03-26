#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkStepFunctionsStack } from '../src/cdk-step-functions-stack';

const app = new cdk.App();
new CdkStepFunctionsStack(app, 'CdkStepFunctionsExampleStack');
