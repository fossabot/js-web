#!/bin/bash

while getopts p: flag
do
    case "${flag}" in
        p) packagename=${OPTARG};;
    esac
done

echo "Building docker image for the $packagename package";

docker build -f "packages/$packagename/Dockerfile" -t "seaccentral/$packagename" .

echo "Image done building.";