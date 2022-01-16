import math
import random
import sys
import csv
from time import sleep
from typing import *
import paho.mqtt.client as mqtt

SERVER = "vaidyuti.ddns.net"
EP_ADDR = "dummy-meter"
speed = 1
PROFILE_MAX_SECONDS = 1206000


def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe(f"prosumers/{EP_ADDR}/speed")


def on_message(client, userdata, msg):
    if "speed" in msg.topic:
        print("(TODO-FEATURE) Speed delta rate: ", msg.payload)


def main():

    load_profile_path = sys.argv[1]
    clock_time = 0
    load_profile: Dict[int, float] = {}

    with open(load_profile_path) as csvfile:
        reader = csv.reader(csvfile)
        for row in reader[1:]:
            load_profile[int(row[0].strip())] = float(row[1].strip())

    client = mqtt.Client()

    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(SERVER)

    while True:
        if client.is_connected:
            client.loop()

            current_hour = math.floor((clock_time % PROFILE_MAX_SECONDS) / 3600)

            profile_power = load_profile[current_hour]

            # Allows +/- 10% Randomized Load Variation from Actual Profile
            delta = profile_power * 0.2 * (random.random() - 0.5)

            power = profile_power + delta

            client.publish(f"prosumers/{EP_ADDR}/power", str(power))

        sleep(1 / speed)


if __name__ == "__main__":
    main()
