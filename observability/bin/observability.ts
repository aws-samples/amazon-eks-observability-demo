#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CloudWatchNamespaceStack } from '../lib/cloudwatch-namespace';
import { ContainerInsightsStack } from '../lib/container-insights-stack';

const app = new cdk.App();
new CloudWatchNamespaceStack(app, 'EKSObservabilityCloudWatchNamespace', {});
new ContainerInsightsStack(app, 'EKSObservabilityContainerInsights', {});
