import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as eks from "@aws-cdk/aws-eks";

export function importCluster(scope: cdk.Construct, clusterName: string | undefined): eks.ICluster {
  if (clusterName == null) {
    throw new Error('Cluster Name is not defined.');
  }
  const exportNameOidcProviderArn = process.env.CFN_EXPORT_NAME_OIDC_PROVIDER_ARN || ""
  const exportNameKubectlRoleArn = process.env.CFN_EXPORT_NAME_KUBECTL_ROLE_ARN || ""

  const oidcProviderArn = cdk.Fn.importValue(exportNameOidcProviderArn);
  const openIdConnectProvider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
    scope, "OpenIdConnectProvider", oidcProviderArn);
  const kubectlRoleArn = cdk.Fn.importValue(exportNameKubectlRoleArn);
  return eks.Cluster.fromClusterAttributes(scope, "BaseCluster", {
    clusterName,
    openIdConnectProvider,
    kubectlRoleArn
  });
}
