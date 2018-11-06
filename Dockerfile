# Dockerfile to create a machine with
# - Debian
# - basic linux functions (curl,wget,python, etc)
# - Tomcat 7.91 with OpenJDK JRE 7 installed

FROM tomcat:8-jre8
MAINTAINER m.vanmeersbergen@esciencecenter.nl

RUN  export DEBIAN_FRONTEND=noninteractive
ENV  DEBIAN_FRONTEND noninteractive
RUN  dpkg-divert --local --rename --add /sbin/initctl

# Update the APT cache
RUN apt-get update
RUN apt-get upgrade -y

# Install and setup project dependencies
RUN apt-get install -y \
    git \
    ssh \
    rsync \
    curl \
    wget \
    python3 \
    python3-pip \
    cmake \
    build-essential \
    libsqlite3-dev \
    locales

# Generic stuff
RUN locale-gen en_US.UTF-8
ENV LANG='en_US.UTF-8' LC_ALL='en_US.UTF-8'

# node
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g bower grunt-cli

# environment
ENV PYTHON_HOME /usr/lib/python3

# make barebones
RUN mkdir /src

# clone git repo
RUN git clone https://github.com/eWaterCycle/Cesium-NcWMS.git /src/Cesium-NcWMS/
WORKDIR /src/Cesium-NcWMS/

# install the dependencies of Cesium-NcWMS and build the webapp
RUN bower install --allow-root
RUN npm install
RUN grunt build

# copy the built webapp to the proper tomcat dir
RUN rm -rf $CATALINA_HOME/webapps/ROOT
RUN cp -r dist/ $CATALINA_HOME/webapps/ROOT/

# Copy the WAR of NcWMS to the proper dir
RUN cp /src/Cesium-NcWMS/ncWMS_dist/ncWMS-2.0-rc1.war $CATALINA_HOME/webapps/

# Configure tomcat manager
COPY tomcat_conf/tomcat-users.xml $CATALINA_HOME/conf/
COPY tomcat_conf/manager.xml $CATALINA_HOME/conf/Catalina/localhost/

RUN echo "{	\"id\": \"ncWMS\", \"url\": \"http://localhost:8080/ncWMS-2.0-rc1/wms?\" }" > app/serverconfig.json
