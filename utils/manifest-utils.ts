import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as eks from "@aws-cdk/aws-eks";

export function applyManifest(file: string | undefined, cluster: eks.ICluster) {
    const manifestInfo = loadManifest(file);
    return cluster.addManifest(manifestInfo.id, ...manifestInfo.manifest);
}

export function loadManifest(file: string | undefined) {
  const data = (() => {
    if (file == undefined) {
      throw new Error("Invalid Manifest File");
    }
    if (path.extname(file) == '.yaml') {
        return fs.readFileSync(file, 'utf8');
    } else {
      throw new Error("Invalid Manifest Path");
    }
  })();
  const manifest = yaml.loadAll(data);
  if (manifest.length > 0) {
      const id = path.basename(file, ".yaml")
      return { id, manifest };
  }
  throw new Error("Invalid Manifest File");
}

export function prepareNamespace(scope: cdk.Construct, cluster: eks.ICluster, namespaceName: string) {
  const namespace = {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: {
      name: namespaceName,
      labels: {
        name: namespaceName
      }
    } 
  };
  return new eks.KubernetesManifest(scope, namespaceName+"NS", {
    cluster, overwrite: true,
    manifest: [ namespace ]
  });
}

export function createIAMServiceAccount(scope: cdk.Construct, cluster: eks.ICluster, namespace: string, name: string, policyPath: string): eks.ServiceAccount {
  const sa = new eks.ServiceAccount(scope, name + "SA", {
    cluster, name, namespace
  });

  const policyJson = fs.readFileSync(path.resolve(policyPath), "utf8");
  ((JSON.parse(policyJson))['Statement'] as []).forEach((statement, idx, array) => {
      sa.addToPrincipalPolicy(iam.PolicyStatement.fromJson(statement));
  });
  return sa;
}
