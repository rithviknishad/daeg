import math
import random
import sys
import pandas
from time import sleep
from typing import *
import paho.mqtt.client as mqtt

SERVER = "localhost"
EP_ADDR = "dummy-meter"
speed = 360
PROFILE_MAX_SECONDS = 1206000


def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe(f"prosumers/{EP_ADDR}/speed")


def on_message(client, userdata, msg):
    if "speed" in msg.topic:
        print("(TODO-FEATURE) Speed delta rate: ", msg.payload)


def main():

    load = pandas.read_csv(sys.argv[1] if len(sys.argv) > 1 else "profile.csv")["Load"]

    clock_time = 0

    client = mqtt.Client()

    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(SERVER)

    while True:
        if client.is_connected:
            client.loop()

            current_hour = math.floor((clock_time % PROFILE_MAX_SECONDS) / 3600)

            profile_power = load[current_hour]

            # Allows +/- 10% Randomized Load Variation from Actual Profile
            delta = profile_power * 0.2 * (random.random() - 0.5)

            power = profile_power + delta

            client.publish(f"prosumers/{EP_ADDR}/power", str(power))

        sleep(1 / speed)


if __name__ == "__main__":
    main()
