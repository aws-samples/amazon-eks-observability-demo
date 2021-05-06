import * as path from "path";
import * as cdk from '@aws-cdk/core';
import * as iam from "@aws-cdk/aws-iam";
import * as eks from "@aws-cdk/aws-eks";

import { importCluster } from "eks-cdk-utils/cluster-utils";
import * as manifestUtils from "eks-cdk-utils/manifest-utils";

export class ClusterLoggingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = importCluster(this, process.env.CLUSTER_NAME)
    const clusterName = cluster.clusterName;

    // SA for Application
    const sa = new eks.ServiceAccount(this, "FluentBitSA", {
      cluster,
      name: "fluent-bit",
      namespace: "amazon-cloudwatch",
    });
    sa.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchAgentServerPolicy"));

    // Fluent Bit
    const configMapInfo = manifestUtils.loadManifest(path.resolve("resources/fluent-bit-configmap.yaml"));
    configMapInfo.manifest[0]["data"]["cluster.name"] = clusterName;
    configMapInfo.manifest[0]["data"]["logs.region"] = process.env.AWS_REGION;
    const configMap = cluster.addManifest(configMapInfo.id, ...configMapInfo.manifest);

    const daemonSet = manifestUtils.applyManifest(path.resolve("resources/fluent-bit.yaml"), cluster);
    daemonSet.node.addDependency(configMap);
    daemonSet.node.addDependency(sa);
  }
}
