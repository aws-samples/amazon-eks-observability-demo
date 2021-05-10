import * as path from "path";
import * as cdk from '@aws-cdk/core';
import * as eks from "@aws-cdk/aws-eks";
import * as iam from "@aws-cdk/aws-iam";
import { importCluster } from "eks-cdk-utils/cluster-utils";
import { createIAMServiceAccount, applyManifest } from "eks-cdk-utils/manifest-utils";

export class OpenTelemetryStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = importCluster(this, process.env.CLUSTER_NAME);
    const clusterName = cluster.clusterName;

    const adotNamespace = {
      apiVersion: "v1",
      kind: "Namespace",
      metadata: {
        name: "adot-col",
        labels: {
          name: "adot-col"
        }
      } 
    };
    const namespace = new eks.KubernetesManifest(this, "OpenTelemetryNS", {
      cluster,
      manifest: [ adotNamespace ]
    });

    // SA for the Controller
    const sa = createIAMServiceAccount(
      this, cluster, "adot-col", "adot-collector",
      path.resolve("resources/adot-iam-policy.json"))

      sa.node.addDependency(namespace);
      sa.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonPrometheusQueryAccess"));
      sa.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonPrometheusRemoteWriteAccess"));

    // OpenTelemetry Agent
    const configMap = applyManifest(
      path.resolve("dist/adot-configmap.yaml"), cluster);
    configMap.node.addDependency(namespace);

    const daemonSet = applyManifest(
      path.resolve("resources/adot-daemonset.yaml"), cluster);
    daemonSet.node.addDependency(configMap);
    daemonSet.node.addDependency(sa);
  }
}
