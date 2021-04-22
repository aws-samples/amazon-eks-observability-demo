import * as cdk from '@aws-cdk/core';
import * as eks from "@aws-cdk/aws-eks";

import { importCluster } from "eks-cdk-utils/cluster-utils";

export class CloudWatchNamespaceStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = importCluster(this, process.env.CLUSTER_NAME)
    const clusterName = cluster.clusterName;

    const cloudwatchNamespace = {
      apiVersion: "v1",
      kind: "Namespace",
      metadata: {
        name: "amazon-cloudwatch",
        labels: {
          name: "amazon-cloudwatch"
        }
      } 
    };
    new eks.KubernetesManifest(this, "AmazonCloudwatchNS", {
      cluster,
      manifest: [ cloudwatchNamespace ]
    });
  }
}
