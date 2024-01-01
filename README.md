# shard

I'm using this repository to gain proficiency in WebGPU through Shader Art.

## About the Development Environment

For supporting Hot Module Replacement (HMR), we are using cargo watch. To avoid installing this module directly in the local environment, Docker is utilized.

## How to Start

It is crucial to navigate to the project's root directory before starting. This is because the docker run command uses pwd (path of the current working directory).

```sh
cd /path/to/shard
```

Then, start the Docker container:

```sh
docker run \
  --rm \
  --name shard \
  -v "$(pwd):/usr/src/shard" \
  shard
```

## How to Stop

To stop the Docker container, open another terminal tab and run the following command:

```
docker stop shard
```
