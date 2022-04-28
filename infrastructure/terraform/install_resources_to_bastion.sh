#! /bin/bash

sudo apt update -y
sudo apt install postgresql-client

curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install nodejs -y
