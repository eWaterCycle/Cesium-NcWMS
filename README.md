eWaterCycle-Demo
================

Cesium (cesiumjs.org) based demo for eWaterCycle project.

Getting started (windows, from scratch)
---------------------------------------
1. Install Git : 	http://git-scm.com/downloads
2. Install Node.js : 	http://nodejs.org/
3. Start Git bash
4. Type: "npm install bower connect serve-static"
5. Close Git bash
6. Add C:\Users\{YOUR USERNAME HERE}\node_modules\bower\bin to your PATH
7. Start Git bash
8. Type: "git clone https://github.com/NLeSC/PattyVis"
9. Type: "cd PattyVis"
10. Type: "bower install"
11. Install Apache Tomcat (http://tomcat.apache.org/)
12. Download and install ncWMS (http://www.resc.rdg.ac.uk/trac/ncWMS/)
13. Serve some netcdf data with ncWMS via the admin interface.
13. Open browser, go to "http://localhost:8080/eWaterCycle-Demo/app/bootstrap.html"

Getting started (Linux, Debian and Ubuntu based)
-------------------------------------------------
### Install git
```
sudo apt-get install git
```
### Install nodejs
Follow instructions at joyents github website:
https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#debian-and-ubuntu-based-linux-distributions

### Install nodejs modules
Install bower globally
```
sudo npm install -g bower
```

### Fetch git repository
```
git clone https://github.com/NLeSC/eWaterCycle-Demo
```

### setup with bower
```
cd eWaterCycle-Demo
bower install
```

### serve with your favourite webserver solution 
We recommend Apache Tomcat, you can find it here: http://tomcat.apache.org/

### Download and install ncWMS
Find it here: http://www.resc.rdg.ac.uk/trac/ncWMS/

### Configure ncWMS
Make sure to serve at least some netcdf data with your ncWMS setup.

### access eWaterCycle-Demo with web browser
Running app should be available at url:
http://localhost:8000/
