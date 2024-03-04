#!/bin/bash

if [ ! $1 ]; then
  pnpm run --filter="@uss/*" build
else
  pnpm run --filter="@uss/$1" build
fi
