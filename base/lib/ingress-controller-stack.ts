import * as path from "path";
import * as cdk from '@aws-cdk/core';
import * as eks from "@aws-cdk/aws-eks";
import { importCluster } from "eks-cdk-utils/cluster-utils";
import { createIAMServiceAccount } from "eks-cdk-utils/manifest-utils";

export class IngressControllerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cluster = importCluster(this, process.env.CLUSTER_NAME)
    const clusterName = cluster.clusterName;

    // SA for the Controller
    const sa = createIAMServiceAccount(
      this, cluster, "kube-system", "aws-load-balancer-controller",
      path.resolve("resources/aws-loadbalancer-controller-iam-policy.json"))

    const chart = new eks.HelmChart(this, "AWSLoadBalancerControllerChart", {
      cluster,
      chart: "aws-load-balancer-controller",
      repository: "https://aws.github.io/eks-charts",
      namespace: "kube-system",
      release: "aws-load-balancer-controller",
      values: {
        clusterName,
        serviceAccount: {
          create: false,
          name: "aws-load-balancer-controller"
        }
      }
    });

    chart.node.addDependency(sa);
  }
}
