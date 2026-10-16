#!/usr/bin/env bash
#
# Convenience wrapper around Docker Compose.
#
# Why this exists: on Docker setups that use the containerd image store
# ("Storage Driver: overlayfs / driver-type: io.containerd.snapshotter.v1"),
# `docker compose up --build` can fail intermittently with
# "Error response from daemon: No such image: <project>-<service>:latest".
# That is a known Docker Compose/buildx bug (see docker/compose#14014 and
# docker/for-mac#7692). Disabling the default build attestations avoids it.
#
# Usage:
#   ./run.sh                 # same as: docker compose up --build
#   ./run.sh up -d           # detached
#   ./run.sh down -v         # any other compose command works too
#
set -euo pipefail

export BUILDX_NO_DEFAULT_ATTESTATIONS=1

if [ "$#" -eq 0 ]; then
  set -- up --build
fi

exec docker compose "$@"
