#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

for dep in \
  "foundry-rs/forge-std@v1.9.4" \
  "OpenZeppelin/openzeppelin-contracts@v5.0.2" \
  "transmissions11/solmate@v6"
do
  folder="lib/$(basename ${dep%@*})"
  [ -d "$folder" ] || forge install $dep --no-git
done
