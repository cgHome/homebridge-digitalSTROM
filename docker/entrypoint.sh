#!/bin/bash

echo "npm (re)load modules" 
npm install --no-bin-links
echo "done ....."

echo "Start avahi (bonjour)"
sed -i "s/rlimit-nproc=3/#rlimit-nproc=3/" /etc/avahi/avahi-daemon.conf
sed -i "/^use-ipv6=/s/=.*/=no/" /etc/avahi/avahi-daemon.conf
dbus-daemon --system
avahi-daemon -D
echo "done ....."

echo "========================================================="
echo "Start container in >> ${NODE_ENV} << mode"
echo "- Command:     $@"
echo "- Home:        $HOME"
echo "========================================================="
echo ""

eval $@
