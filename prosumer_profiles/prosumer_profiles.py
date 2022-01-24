import sys
import csv
import random
from typing import *
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

ProfileRange = List[Tuple[float, float]]
days_name = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]


def get_norm_range_profile(path: str) -> ProfileRange:
    """Reads the normalized range profile from the CSV file."""

    # List to store the normalized load column from the csv dataset.
    normalized_load: List[float] = []

    with open(path) as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            normalized_load.append(float(row[1].strip()))

    # List of Tuples to store the hourly normalized load range.
    result: ProfileRange = []

    # Appends the lower limit and upper limit to the result list.
    for i in range(24):
        lower_limit, upper_limit = normalized_load[i * 2], normalized_load[i * 2 + 1]
        result.append((lower_limit, upper_limit))

    return result


def generate_for_house(range_profile: ProfileRange, days: int, index: int):
    # House base power, decided randomly between 0.8kW and 3kW.
    base_w: Final = random.randint(800, 3000)

    # Hourly per unit load for entire duration (days * hours number of elements in list) of the house
    load_profile: List[float] = []

    for day in range(days):

        base_w_today = float(base_w)

        # Saturday Sunday Bias
        if day % 7 == 0 or day % 7 == 6:
            base_w_today *= 1.2 + random.random() * 0.4

        # What if one sunday they go out for picnic?
        # TODO

        r = random.randint(800, 3000)
        for hour in range(24):
            lower, upper = range_profile[hour]
            delta_pu = upper - lower
            load_pu = random.random() * delta_pu + lower
            load_profile.append(round(load_pu * base_w_today))

    xlabels = range(days * 24)
    timestamps: List[str] = []
    timestamp_now = datetime.now()
    delta_hour = timedelta(hours=1)

    for hour in range(days * 24):
        timestamp_now = timestamp_now + delta_hour
        timestamps.append(timestamp_now.strftime("%Y-%m-%d %H:%M:%S"))

    file_name = f"prosumer{index+1}_base_w_{base_w}"

    with open(f"outputs/{file_name}.csv", "x") as file:
        write = csv.writer(file)
        write.writerow(["Time (Hour)", "Load (W)"])
        write.writerows(zip(timestamps, load_profile))

    plt.plot(xlabels, load_profile)
    plt.xlabel("Time [hour]")
    plt.ylabel("Load [Watt]")
    plt.title("Hourly Load")

    plt.savefig(f"outputs/{file_name}.png")
    plt.close()


def main():

    # No. of houses
    houses = 21

    # No. of days of data to be generated.
    days: Final = 14  # 2 Weeks

    # get range profile from csv
    range_profile: Final = get_norm_range_profile("normalized_house_load_range.csv")

    for i in range(houses):
        sys.stdout.write("\r")
        sys.stdout.write(
            "Generating and saving load profiles... [%-20s] %d%%" % ("=" * i, 5 * i)
        )
        sys.stdout.flush()
        # print(f"Generating load profile for prosumer {i + 1} of {houses}")
        generate_for_house(range_profile, days=days, index=i)


if __name__ == "__main__":
    main()
