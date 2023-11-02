# Tracing installation for production (Elastic + Jaeger)

## 1. Install elastic:

```shell
# install elastic operator custom resource definitions:
kubectl create -f ./elastic/00-crds.yaml

# install elastic operator
kubectl create -f ./elastic/01-operator.yaml

# create elastic instance
kubectl create -f ./elastic/02-elastic.yaml
```


# 2 . Install jaeger:

```shell
kubectl create -f ./jaeger/00-cert-manager.yaml

kubectl create namespace observability
kubectl create -n observability -f ./jaeger/01-crds.yaml
kubectl create -f ./jaeger/02-jaeger.yaml

# get ui address:
kubectl get ingress
NAME             HOSTS     ADDRESS          PORTS     AGE
log-jaeger       *         192.168.122.34   80        3m
```
