import * as path from "path";
import * as cdk from '@aws-cdk/core';
import * as iam from "@aws-cdk/aws-iam";
import * as eks from "@aws-cdk/aws-eks";

import { importCluster } from "eks-cdk-utils/cluster-utils";
import * as manifestUtils from "eks-cdk-utils/manifest-utils";

export class XRayStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = importCluster(this, process.env.CLUSTER_NAME)
    const clusterName = cluster.clusterName;

    // SA for Application
    const sa = new eks.ServiceAccount(this, "XRaySA", {
      cluster,
      name: "xray-daemon",
      namespace: "amazon-cloudwatch",
    });
    sa.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchAgentServerPolicy"));
    sa.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AWSXRayDaemonWriteAccess"));

    // X-Ray DaemonSet
    const daemonSet = manifestUtils.applyManifest(path.resolve("resources/xray-daemonset.yaml"), cluster);
    daemonSet.node.addDependency(sa);
  }
}
