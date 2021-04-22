import * as path from "path";
import * as cdk from '@aws-cdk/core';
import * as iam from "@aws-cdk/aws-iam";
import * as eks from "@aws-cdk/aws-eks";

import { importCluster } from "eks-cdk-utils/cluster-utils";
import * as manifestUtils from "eks-cdk-utils/manifest-utils";

export class ContainerInsightsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = importCluster(this, process.env.CLUSTER_NAME)
    const clusterName = cluster.clusterName;

    // SA for Application
    const sa = new eks.ServiceAccount(this, "AmazonCloudwatchSA", {
      cluster,
      name: "cloudwatch-agent",
      namespace: "amazon-cloudwatch",
    });
    sa.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchAgentServerPolicy"));

    // CW Agent
    manifestUtils.applyManifest(path.resolve("resources/cwagent-rbac.yaml"), cluster);
    const configMap = manifestUtils.applyManifest(path.resolve("resources/cwagent-configmap.yaml"), cluster);
    const daemonSet = manifestUtils.applyManifest(path.resolve("resources/cwagent-daemonset.yaml"), cluster);
    daemonSet.node.addDependency(sa);
    daemonSet.node.addDependency(configMap);
  }
}
