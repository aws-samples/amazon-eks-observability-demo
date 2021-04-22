import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { start } from 'node:repl';
import * as Observability from '../lib/cloudwatch-namespace';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Observability.CloudWatchNamespaceStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(haveResourceLike("Custom::AWSCDK-EKS-KubernetesResource"));
});
