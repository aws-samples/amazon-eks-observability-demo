## Amazon EKS Observability DEMO

This project for demonstarating how to work observability on a cluster using EKS with:

* CDK
* CloudWatch Container Insights
* Prometheus, Amazon Managed Service for Prometheus, Amazon Managed Service for Grafana
* AWS Distro for OpenTelemetry
* etc.

## Prerequisites

Running this project require setting up AWS CDK in TypeScript. See also the [Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/hello_world.html).

## Steps

### Set up some environment variables

```bash
## The name of EKS cluster to be created
export CLUSTER_NAME=observability-demo

## Region unique export names
export CFN_EXPORT_NAME_CLUSTER_NAME=EKSObservabilityDemoClusterName
export CFN_EXPORT_NAME_OIDC_PROVIDER_ARN=EKSObservabilityDemoOIDCProviderArn
export CFN_EXPORT_NAME_KUBECTL_ROLE_ARN=EKSObservabilityDemoKubectlRoleArn
```

### Create a cluster for this demo

```bash
cd base/

## Create a cluster
npm i
npm run cdk diff EKSObservabilityBase
npm run cdk deploy EKSObservabilityBase

## Set up AWS Loadbalancer Controller
npm run cdk diff EKSObservabilityIngressController
npm run cdk deploy EKSObservabilityIngressController

## Set up kubeconfig
aws eks update-kubeconfig --name observability-demo --region $AWS_REGION --role-arn arn:aws:iam::xxxx:role/EKSObservabilityBase-BaseClusterMastersRoleXXX
```

### Deploy sample applications

```bash
cd app/

kubectl apply -f simple-backend/deployment.yml
kubectl apply -f simple-frontend/deployment.yml

## Make sure to access ingress URL
open http://$(kubectl get ingress simple-frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
```

### Set up Amazon CloudWatch Container Insights

The step introduces a cloudwatch-agent DaemonSet for sending metrics to Container Insights.

```bash
cd observability/

## Create a cluster
npm i
npm run cdk diff EKSObservabilityCloudWatchNamespace
npm run cdk deploy EKSObservabilityCloudWatchNamespace

## Make sure the namespace have been created
kubectl get ns amazon-cloudwatch -o yaml

## Deploy a cloudwatch-agent in the cluster
npm run cdk diff EKSObservabilityContainerInsights
npm run cdk deploy EKSObservabilityContainerInsights

## Make sure the cloudwatch-agent have been deployed
kubectl describe ds -n amazon-cloudwatch cloudwatch-agent
```

Go to Container Insights and make sure the cluster metrics can be seen:
https://console.aws.amazon.com/cloudwatch/home#container-insights:performance

### Set up cluster logging using CloudWatch Logs

The step introduces a fluent-bit DaemonSet for sending cluster logs (application, dataplane, host) to CloudWatch Logs

TBD

### Clean up

```bash
cd apps
kubectl delete -f simple-backend/deployment.yml
kubectl delete -f simple-frontend/deployment.yml

cd ../observability
npm run cdk destroy EKSObservabilityContainerInsights
npm run cdk destroy EKSObservabilityCloudWatchNamespace

cd ../base
npm run cdk destroy EKSObservabilityIngressController
npm run cdk destroy EKSObservabilityBase
```

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
