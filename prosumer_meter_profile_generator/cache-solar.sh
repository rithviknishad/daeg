#!/usr/bin/env bash

# Near Vellore Institute of Technology, Chennai
./profile-manager cache-solar --latitude 12.83 --longitude 80.15 --output-prefix="VITC" --capacities=0.9,1.2,1.5,1.6,3,3.2,5,5.5,7,8,9,10,10.2,11,11.1,11.4

# Near Madras Atomic Power Station
./profile-manager cache-solar --latitude 12.55 --longitude 80.03 --output-prefix="MAPS" --capacities=500,1000,1200

# Near Adani Power Plant
./profile-manager cache-solar --latitude 9.34 --longitude 78.39 --output-prefix="AGEL" --capacities=1500,2000,3000