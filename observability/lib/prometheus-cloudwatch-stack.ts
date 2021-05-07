import * as path from "path";
import * as cdk from '@aws-cdk/core';
import * as iam from "@aws-cdk/aws-iam";
import * as eks from "@aws-cdk/aws-eks";

import { importCluster } from "eks-cdk-utils/cluster-utils";
import * as manifestUtils from "eks-cdk-utils/manifest-utils";

export class PrometheusCloudWatchStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = importCluster(this, process.env.CLUSTER_NAME)
    const clusterName = cluster.clusterName;

    // SA for Application
    const sa = new eks.ServiceAccount(this, "AmazonCloudwatchPrometheusSA", {
      cluster,
      name: "cwagent-prometheus",
      namespace: "amazon-cloudwatch",
    });
    sa.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchAgentServerPolicy"));

    // CW Prometheus Agent Config
    const configMap = manifestUtils.applyManifest(path.resolve("resources/cwagent-prometheus-configmap.yaml"), cluster);

    // CW Prometheus Agent
    const daemonSet = manifestUtils.applyManifest(path.resolve("resources/cwagent-prometheus-eks.yaml"), cluster);
    daemonSet.node.addDependency(configMap);
    daemonSet.node.addDependency(sa);
  }
}
