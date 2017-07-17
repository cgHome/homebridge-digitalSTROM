#FROM alpine:3.4
FROM hypriot/rpi-alpine-scratch:v3.4

MAINTAINER Chris Gross <cgHome@gmx.net>

ENV HOME=/home

# Set bash-config
RUN echo "# Docker container - bash" >> ~/.bashrc
RUN echo "alias ll='ls -lha'" >> ~/.bashrc
RUN echo 'container (){ echo $CONTAINER; }; export -f container;' >> ~/.bashrc
RUN echo 'export PS1="\[\033[0;32m\][\${$(container)}:\W]\$ \[\033[0m\]"' >> ~/.bashrc

##################################################
# Install packages                               #
##################################################

USER root

RUN apk --no-cache add \
		bash \
        bash-completion \
	    nodejs \
	    git \
        dbus \
        avahi-dev \
    	make \
        python \ 
    	g++

RUN mkdir -p /var/run/dbus

##################################################
# Install service                                #
##################################################

RUN npm install -g pm2 

##################################################
# Start                                          #
##################################################

WORKDIR ${HOME}/app
ENV NODE_ENV=development

VOLUME ${HOME}/app
EXPOSE 51826 5858

ENTRYPOINT ["docker/entrypoint.sh"]
CMD ["npm start"]