#!/bin/bash

# This is a protoype file for how to extract npm tarballs. Use this when trying to add support for a new build system.

mkdir -p $1
cd $1
curl $2 2> /dev/null | tar -xz --strip-components=1 2> /dev/null
