# TODO: multiple ips not working!

# Secure ingress setup:

- create a static IP address
```shell
gcloud compute addresses create secure-nginx-ip-address --region=asia-east2
# 35.220.186.66

```

### Generate user and password

First thing to do is to generate user and password for the basic authentication, we will use the htpasswd:
```shell
#  Let say we want to generate user admin and password verysecret, we will issue this command:
htpasswd -nb 'admin' '111111' | base64
# YWRtaW46JGFwcjEkaEtJVGtzMjUkT043QnRKaWtqbU9aQ2FGL1VPcHI2LgoK
```
Generate secret for multiple users:
````shell
sudo apt update && sudo apt install apache2-utils

# create a file auth.txt, encrypt password 
htpasswd -c -B -b auth.txt admin 111111
# add more users
htpasswd -B -b auth.txt paul@picupmedia.com J*kLX#7+TSbG+LUV

# encode to base64 and echo
cat auth.txt | base64
# YWRtaW46JDJ5JDA1JGZVeW8yUnV5WC5kNUV2N3YwcmRhS3UzQUJYdjF6cXp3cXZNMGU1aXcvZDdpOEpxWXNDczlxCnBhdWxAcGljdXBtZWRpYS5jb206JDJ5JDA1JFdpekEyd1lLZmF3bnhOd2l4NnpucHU0cEhubGc1S2FKbG5adUxkS1hRb01jZm5SSEFLd1RxCg==
````

### Create the secret
```shell
kubectl apply -f << EOF -
# secret.yaml
---
apiVersion: v1
kind: Secret
type: Opaque
metadata:
  name: basic-auth
data:
  auth: "YWRtaW46JDJ5JDA1JGZVeW8yUnV5WC5kNUV2N3YwcmRhS3UzQUJYdjF6cXp3cXZNMGU1aXcvZDdpOEpxWXNDczlxCnBhdWxAcGljdXBtZWRpYS5jb206JDJ5JDA1JFdpekEyd1lLZmF3bnhOd2l4NnpucHU0cEhubGc1S2FKbG5adUxkS1hRb01jZm5SSEFLd1RxCg=="
EOF
```


- Check Helm availability and install charts:
```shell
helm version
helm upgrade

#helm install secure ingress-nginx \
#  --repo https://kubernetes.github.io/ingress-nginx \
#  --set controller.service.loadBalancerIP=35.220.186.66

# using vaules.yaml
helm install secure ingress-nginx -f values.yaml --repo https://kubernetes.github.io/ingress-nginx
helm uninstall secure

```

### Create service of type "ExternalName" for grafana (as it located in another namespace)
```shell
kubectl create -f << EOF -
kind: Service
apiVersion: v1
metadata:
  name: graf-stack-grafana-proxy
  namespace: default
spec:
  type: ExternalName
  externalName: graf-stack-grafana.monitoring.svc.cluster.local
  ports:
  - port: 80
EOF

```


### Create Ingress
```shell
kubectl create -f << EOF -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-nginx
  annotations:
    nginx.ingress.kubernetes.io/auth-type: basic   
    nginx.ingress.kubernetes.io/auth-secret: basic-auth 
    nginx.ingress.kubernetes.io/auth-realm: "Authentication Required"
spec:
  ingressClassName: nginx
  rules:
    - http:
        paths:
        - path: /jaeger
          pathType: Prefix
          backend:
            service:
              name: log-jaeger-query
              port:
                number: 16686
        - path: /kibana
          pathType: Prefix
          backend:
            service:
              name: log-kibana-kb-http
              port:
                number: 5601
        - path: /grafana
          pathType: Prefix
          backend:
            service:
              name: graf-stack-grafana-proxy # pointing to grafana service in monitoring namespace
              port:
                number: 80
EOF
```
