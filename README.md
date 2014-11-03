eWaterCycle-Demo
================

Cesium (cesiumjs.org) based demo for eWaterCycle project.

![logo](images/eWaterCycle.png "Screenshot 1")
![logo](images/eWaterCycle2.png "Screenshot 2")

Getting started (windows, from scratch)
---------------------------------------
1. Install Git : 	http://git-scm.com/downloads
2. Install Node.js : 	http://nodejs.org/
3. Install Apache Tomcat (http://tomcat.apache.org/)
4. Start Git bash
5. Type: "npm install bower connect serve-static"
6. Close Git bash
7. Add C:\Users\{YOUR USERNAME HERE}\node_modules\bower\bin to your PATH
8. Start Git bash
9. Change directory to your "apache tomcat installation directory"/webapps/ROOT
8. Type: "git clone https://github.com/NLeSC/eWaterCycle-Demo.git"
9. Type: "cd eWaterCycle-Demo"
10. Type: "bower install"
11. Download and install ncWMS (http://www.resc.rdg.ac.uk/trac/ncWMS/)
12. Serve some netcdf data with ncWMS via the admin interface.
13. Serve the /app directory in the eWaterCycle-Demo directory with your webserver solution (tomcat).
14. Open browser, go to "http://localhost:8080/eWaterCycle-Demo/bootstrap.html"

Getting started (Linux, Debian and Ubuntu based)
-------------------------------------------------
1. Install git: "sudo apt-get install git".
2. Install nodejs, Follow instructions at joyents github website: (https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#debian-and-ubuntu-based-linux-distributions).
3. Install nodejs module bower globally: "sudo npm install -g bower".
4. Install/use your favourite webserver solution, we recommend Apache Tomcat, you can find it here: (http://tomcat.apache.org/).
5. Change directory to your "apache tomcat installation directory"/webapps/ROOT
6. Fetch git repository: "git clone https://github.com/NLeSC/eWaterCycle-Demo".
7. Setup with bower: "cd eWaterCycle-Demo ; bower install".
8. Download and install ncWMS, find it here: (http://www.resc.rdg.ac.uk/trac/ncWMS/).
9. Configure ncWMS, make sure to serve at least some netcdf data with your ncWMS setup.
10. Serve the /app directory in the eWaterCycle-Demo directory with your webserver solution (tomcat).
11. Access eWaterCycle-Demo with web browser, running app should be available at url: (http://localhost:8000/bootstrap.html).

Copyrights & Disclaimers
------------------------

eWaterCycle-Demo is copyrighted by the Netherlands eScience Center and 
releases under the Apache License, Version 2.0.

See <http://www.esciencecenter.nl> for more information on the 
Netherlands eScience Center.

See the "LICENSE" file for more information. 
