Cesium-NcWMS
============

[![Build Status](https://travis-ci.org/NLeSC/Cesium-NcWMS.svg?branch=master)](https://travis-ci.org/NLeSC/Cesium-NcWMS)
[![Code Climate](https://codeclimate.com/github/NLeSC/Cesium-NcWMS/badges/gpa.svg)](https://codeclimate.com/github/NLeSC/Cesium-NcWMS)
[![Test Coverage](https://codeclimate.com/github/NLeSC/Cesium-NcWMS/badges/coverage.svg)](https://codeclimate.com/github/NLeSC/Cesium-NcWMS)
[![devDependency Status](https://david-dm.org/NLeSC/Cesium-NcWMS/dev-status.svg)](https://david-dm.org/NLeSC/Cesium-NcWMS#info=devDependencies)

Cesium (cesiumjs.org) based visualization using ncWMS to serve NetCDF data and D3 (d3js.org) to display graphs.  
A live running version of this software can be found here: http://forecast.ewatercycle.org


![logo](DOC/images/ewa-saturation.png "Screenshot 1")
![logo](DOC/images/ewa-discharge.png "Screenshot 2")

Getting started (windows, from scratch)
---------------------------------------
1. Install Git : 	http://git-scm.com/downloads
2. Install Node.js : 	http://nodejs.org/ (Make sure add node to PATH option is checked)
  1. Create '$HOME/npm' folder (Where $HOME is c:\Users\<username>\AppData\Roaming).
  2. Open node command prompt and run `npm install -g bower grunt-cli`
3. Install Apache Tomcat (http://tomcat.apache.org/) 8.0 or higher.
4. Add C:\Users\{YOUR USERNAME HERE}\node_modules\bower\bin to your PATH
5. Start Git bash
6. Change directory to your "apache tomcat installation directory"/webapps/ROOT
7. Type: "git clone https://github.com/NLeSC/Cesium-NcWMS.git"
8. Type: "cd Cesium-NcWMS"
9. Type: "npm install -g grunt grunt-cli"
10. Type: "npm install"
11. Type: "bower install"
12. Type: "bower update"
13. Copy the ncWMS-2.0-rc1.war from the ncWMS_dist directory to your apache-tomcat/webapps directory.
14. Edit the tomcat-users.xml in your apache-tomcat/conf directory and add ncWMS-admin as a role to your username
15. Serve some netcdf data with ncWMS via the admin interface, make sure it is CF-1.7 compliant.
16. Edit the serverconfig.json file in the app/ subdirectory to reflect the location of your ncWMS server.
17. Type: "grunt serve"

Getting started (Linux, Debian and Ubuntu based)
-------------------------------------------------
### Prerequisites:  
1. nodejs, http://nodejs.org/
2. bower, http://bower.io
3. Java Development Kit, https://www.java.com/

### Installation:  
##### Install nodejs  
Follow instructions at joyents github website:
https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#debian-and-ubuntu-based-linux-distributions

##### Install bower and grunt-cli globally
```
sudo npm install -g bower grunt-cli
```

##### Fetch git repository
```
git clone https://github.com/NLeSC/Cesium-NcWMS.git
```

##### Install Apache Tomcat
1. Go to http://tomcat.apache.org/ and install version 8.0 or higher.
2. Copy the ncWMS-2.0-rc1.war file from the ncWMS_dist directory to your apache/webapps directory.  
3. Edit the tomcat-users.xml in your apache-tomcat/conf directory and add ncWMS-admin as a role to your username.  
4. Edit the serverconfig.json file in the app/ subdirectory to point to the location of your ncWMS server.

##### setup with bower
```
cd Cesium-NcWMS
npm install
bower install
```
If you already have a installed the bower packages before, but need to update them for a new version of the code, run
```
bower update
```

##### Start development server & open browser
```
grunt serve
```
Changes made to code will automatically reload web page.

##### Run unit tests

```
grunt test
```
Generates test report and coverage inside `test/reports` folder.

##### Build a distro

```
grunt build
```
The `dist` folder has production ready distribution.



Copyrights & Disclaimers
------------------------

Cesium-NcWMS is copyrighted by the Netherlands eScience Center and
releases under the Apache License, Version 2.0.

See <http://www.esciencecenter.nl> for more information on the
Netherlands eScience Center.

See the "LICENSE" file for more information.
