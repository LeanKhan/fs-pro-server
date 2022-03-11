#!/bin/bash

# Basic for loop
modules='clubs players awards calendar competitions days fixtures managers game seasons user places'
for module in $modules
do
nest g resource modules/$module
done
echo All done