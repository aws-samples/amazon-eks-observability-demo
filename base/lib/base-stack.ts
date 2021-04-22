import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as eks from "@aws-cdk/aws-eks";

export class BaseStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const clusterName = process.env.CLUSTER_NAME;
    if (clusterName == null) {
      throw new Error("Cluster Name is not defined.");
    }

    // The code that defines your stack goes here
    const vpc = new ec2.Vpc(
      this, "BaseVpc", { cidr: "10.0.0.0/16" }
    );
    cdk.Tags.of(vpc).add("Name", clusterName);

    const cluster = new eks.Cluster(this, "BaseCluster", {
      version: eks.KubernetesVersion.V1_19,
      clusterName,
      vpc,
      endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
      defaultCapacity: 0
    });
    const userData = `MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="==MYBOUNDARY=="

--==MYBOUNDARY==
Content-Type: text/x-shellscript; charset="us-ascii"

#!/bin/bash
set -o xtrace
set -o pipefail
set -o nounset
yum install -y amazon-ssm-agent
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent

--==MYBOUNDARY==--\\
`;

    const lt = new ec2.CfnLaunchTemplate(this, "NodeLaunchTemplate", {
      launchTemplateData: {
        userData: cdk.Fn.base64(userData),
      },
    });

    const ssmNodeGroup = cluster.addNodegroupCapacity("OnDemandSSM", {
      instanceTypes: [new ec2.InstanceType("m5.large")],
      minSize: 2,
      launchTemplateSpec: {
        id: lt.ref,
        version: lt.attrLatestVersionNumber,
      },
    });
    ssmNodeGroup.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"));

    const exportNameClusterName = process.env.CFN_EXPORT_NAME_CLUSTER_NAME || ""
    const exportNameOidcProviderArn = process.env.CFN_EXPORT_NAME_OIDC_PROVIDER_ARN || ""
    const exportNameKubectlRoleArn = process.env.CFN_EXPORT_NAME_KUBECTL_ROLE_ARN || ""

    new cdk.CfnOutput(this, "ClusterName", { value: cluster.clusterName, exportName: exportNameClusterName });
    new cdk.CfnOutput(this, "OpenIdConnectProviderArn", {
      value: cluster.openIdConnectProvider.openIdConnectProviderArn, exportName: exportNameOidcProviderArn });
    const kubectlRole = cluster.kubectlRole;
    if (kubectlRole != null) {
      new cdk.CfnOutput(this, "KubectlRoleArn", {
        value: kubectlRole.roleArn, exportName: exportNameKubectlRoleArn });
    }
  }
}
