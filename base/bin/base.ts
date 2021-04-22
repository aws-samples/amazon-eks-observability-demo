#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BaseStack } from '../lib/base-stack';
import { IngressControllerStack } from '../lib/ingress-controller-stack';

const app = new cdk.App();
new BaseStack(app, 'EKSObservabilityBase', {});
new IngressControllerStack(app, 'EKSObservabilityIngressController', {});
