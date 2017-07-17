#!/bin/bash
# set -e

BASEDIR=$(dirname $0)
BASENAME=$(basename $PWD | awk '{print tolower($0)}')

IMAGE_NAME="dev/$BASENAME"
CONTAINER_NAME="$BASENAME"
    
usage="usage: $0 <build|run|exec|logs>";
if [ "$#" == "0" ]; then
    echo "$usage"
    exit 1;
fi

action=$1; shift
args=$@

_build() {
    docker build -t ${IMAGE_NAME} docker/.
}

_run() {
    # Set default commands
    if [ -z "$args" ]; then
        args[0]="npm start"
    fi

    container_ids=$(docker ps -q --filter="name=$CONTAINER_NAME");
    if [ -n "$container_ids" ]; then
        echo "$CONTAINER_NAME container stop & remove (ids: '$container_ids')"
        # docker stop $(docker ps -q --filter="name=$CONTAINER_NAME");
        docker rm -f $(docker ps -a -q --filter="name=$CONTAINER_NAME");
    fi
    
    #docker run -it --rm \
    docker run -it --rm --net host \
        --name ${CONTAINER_NAME} \
        -p "51826:51826" -p "5858:5858" \
        -v `pwd`:/home/app \
        -e CONTAINER=${CONTAINER_NAME} \
        $IMAGE_NAME $args
}

_exec() {
    docker exec -it $CONTAINER_NAME $args
}

_bash() {
    docker exec -it $CONTAINER_NAME bash -i $args
}

_logs() {
    docker logs -f $CONTAINER_NAME
}

eval _$action