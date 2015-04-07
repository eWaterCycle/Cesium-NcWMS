eWaterCycle-Demo
================

[![Build Status](https://travis-ci.org/NLeSC/PattyVis.svg?branch=master)](https://travis-ci.org/NLeSC/PattyVis)
[![Code Climate](https://codeclimate.com/github/NLeSC/PattyVis/badges/gpa.svg)](https://codeclimate.com/github/NLeSC/PattyVis)
[![Test Coverage](https://codeclimate.com/github/NLeSC/PattyVis/badges/coverage.svg)](https://codeclimate.com/github/NLeSC/PattyVis)
[![devDependency Status](https://david-dm.org/NLeSC/PattyVis/dev-status.svg)](https://david-dm.org/NLeSC/PattyVis#info=devDependencies)
[![Codacy Badge](https://www.codacy.com/project/badge/a2ebd9977fe04aa1af6e5c47dc8d6927)](https://www.codacy.com/public/sverhoeven/PattyVis)

Cesium (cesiumjs.org) based demo for eWaterCycle project.

![logo](images/eWaterCycle.png "Screenshot 1")
![logo](images/eWaterCycle2.png "Screenshot 2")

Getting started (windows, from scratch)
---------------------------------------
1. Install Git : 	http://git-scm.com/downloads
2. Install Node.js : 	http://nodejs.org/
3. Install Apache Tomcat (http://tomcat.apache.org/)
4. Add C:\Users\{YOUR USERNAME HERE}\node_modules\bower\bin to your PATH
5. Start Git bash
6. Change directory to your "apache tomcat installation directory"/webapps/ROOT
7. Type: "git clone https://github.com/NLeSC/eWaterCycle-Demo.git"
8. Type: "cd eWaterCycle-Demo"
9. Type: "npm install"
10. Type: "bower install"
11. Copy the ncWMS-2.0-SNAPSHOT.war from the eWaterCycle-Demo directory to your apache-tomcat/webapps directory.
12. Edit the tomcat-users.xml in your apache-tomcat/conf directory and add ncWMS-admin as a role to your username
13. Serve some netcdf data with ncWMS via the admin interface, make sure it is CF-1.7 compliant.
14. Serve the eWaterCycle-Demo directory with your webserver solution (tomcat) (by putting it in your webapps/ROOT directory or making a symlink to it).
15. Open browser, go to "http://localhost:8080/eWaterCycle-Demo"

Getting started (Linux, Debian and Ubuntu based)
-------------------------------------------------
1. Install git: "sudo apt-get install git".
2. Install nodejs and node package manager, Follow instructions at joyents github website: (https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#debian-and-ubuntu-based-linux-distributions).
3. Install nodejs module bower globally: "sudo npm install -g bower".
4. Install/use your favourite webserver solution, we recommend Apache Tomcat, you can find it here: (http://tomcat.apache.org/).
5. Change directory to your "apache tomcat installation directory"/webapps/ROOT
6. Fetch git repository: "git clone https://github.com/NLeSC/eWaterCycle-Demo".
7. Setup with npm and bower: "cd eWaterCycle-Demo; npm install; bower install"
8. Copy the ncWMS-2.0-SNAPSHOT.war from the eWaterCycle-Demo directory to your apache-tomcat/webapps directory
9. Configure ncWMS, edit the tomcat-users.xml in your apache-tomcat/conf directory and add ncWMS-admin as a role to your username, make sure to serve at least some netcdf data with your ncWMS setup.
10. Serve the eWaterCycle-Demo directory with your webserver solution (tomcat).
11. Access eWaterCycle-Demo with web browser, running app should be available at url: (http://localhost:8000/eWaterCycle-Demo).

Copyrights & Disclaimers
------------------------

eWaterCycle-Demo is copyrighted by the Netherlands eScience Center and
releases under the Apache License, Version 2.0.

See <http://www.esciencecenter.nl> for more information on the
Netherlands eScience Center.

See the "LICENSE" file for more information.
