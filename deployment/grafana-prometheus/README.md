# Grafana / Prometheus setup

## Create smtp config secret for alertmanager
```shell
kubectl create -f grafana-smtp-credentials.yaml -n monitoring
```

## [Install and configure Helm](https://helm.sh/docs/intro/install/) on your local machine

## Install Prometheus & Grafana
get the latest version of the chart from the [Prometheus Helm Charts](https://github.com/prometheus-community/helm-charts)

```shell
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
# configure specification for your deployment in values.yaml and then run:
helm install -f values.yaml graf-stack ./kube-prometheus-stack # using local copy of chart to fix the dependencies
```

## Customization

### [provision custom dashboards](https://www.doit.com/how-to-add-custom-grafana-dashboards-in-code-using-the-kube-prometheus-stack-helm-chart/)
- Login to grafana and create custom dashboard
- Once we created a custom dashboard in Grafana and saved, export of the json that we will be using to add to our configmap in the next step.
- Add our own custom configmap Helm template to the dashboards folder.
  - duplicate one of the existing yaml files in `kube-prometheus-stack/templates/grafana/dashboards-1.14` folder
  - delete top comment and replace all name references with your dashboard name
  - replace the JSON of the existing dashboard with the JSON of your custom dashboard
- Generate rendered helm template to crosscheck that the configmap is created correctly and install helm chart:
```shell
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Pull all the charts dependencies and update
helm dep update ./kube-prometheus-stack && helm dep build ./kube-prometheus-stack

# run the Helm template command to validate and render the yaml manifests 
cd kube-prometheus-stack &&  \
helm template kube-prometheus-stack . --validate > rendered-template.yaml

# inspect the rendered-template.yaml file to verify our ConfigMap has been created and will be applied when we run the Helm install command
cat rendered-template.yaml 

# remove generated template after checking: 
rm rendered-template.yaml 

# finally install updated helm chart:
helm install -f values.yaml graf-stack ./kube-prometheus-stack -n monitoring
```


## Uninstall Helm Chart
```shell
helm uninstall graf-stack -n monitoring
# CRDs created by this chart are not removed by default and should be manually cleaned up:
kubectl delete crd alertmanagerconfigs.monitoring.coreos.com
kubectl delete crd alertmanagers.monitoring.coreos.com
kubectl delete crd podmonitors.monitoring.coreos.com
kubectl delete crd probes.monitoring.coreos.com
kubectl delete crd prometheuses.monitoring.coreos.com
kubectl delete crd prometheusrules.monitoring.coreos.com
kubectl delete crd servicemonitors.monitoring.coreos.com
kubectl delete crd thanosrulers.monitoring.coreos.com
```