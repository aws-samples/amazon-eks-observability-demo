#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CloudWatchNamespaceStack } from '../lib/cloudwatch-namespace';
import { ContainerInsightsStack } from '../lib/container-insights-stack';
import { ClusterLoggingStack } from '../lib/cluster-logging-stack';
import { XRayStack } from '../lib/xray-stack';
import { PrometheusCloudWatchStack } from '../lib/prometheus-cloudwatch-stack';

const app = new cdk.App();
new CloudWatchNamespaceStack(app, 'EKSObservabilityCloudWatchNamespace', {});
new ContainerInsightsStack(app, 'EKSObservabilityContainerInsights', {});
new ClusterLoggingStack(app, 'EKSObservabilityClusterLogging', {});
new XRayStack(app, 'EKSObservabilityXRay', {});
new PrometheusCloudWatchStack(app, 'EKSObservabilityPrometheusCloudWatch', {});