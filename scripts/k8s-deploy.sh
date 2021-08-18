#!/bin/sh

set -e

export GITHUB_SHA=$(git rev-parse --short HEAD)
export APP="clinq-bridge-front"
export IMAGE="eu.gcr.io/integrations-174012/$APP:latest"
export DOMAIN="front.bridge.clinq.com"

kubectl kustomize k8s/template | envsubst > k8s/prod.yml
kubectl apply -f k8s/prod.yml
