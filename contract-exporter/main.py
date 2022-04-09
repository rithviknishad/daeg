#!/usr/bin/env python

from abc import ABC
from dataclasses import dataclass
from datetime import datetime
import json
import sys
from typing import Final


@dataclass
class Transaction(ABC):
    """Abstract class Transaction provides a common base for Atomic and Aggregated Transaction."""

    id: str
    """The unique key used to identify an atomic transaction in MGEMS database."""

    opened_at: datetime
    """The date and time at which energy exchange has started."""

    closed_at: datetime
    """The date and time at which energy exchange has stopped."""


@dataclass
class AtomicTransaction(Transaction):
    producer_address: str
    """The Vaidyuti Protocol Address of the producer who has attempted to provide energy to a consumer."""

    consumer_address: str
    """The Vaidyuti Protocol Address of the consumer who has received energy from a producer."""

    energy_consumed: float
    """The amount of energy consumed by the consumer in kWh. Transmission and distribution lossess are not accounted in this attribute."""

    transmission_lossess: float
    """The estimated amount of energy lost in transmission and distribution in kWh."""

    consumption_unit_price: float
    """The per unit price thats levied on the amount of energy directly consumed by the consumer."""

    lossess_unit_price: float
    """The per unit price thats levied on the estimated amount of energy lost in transmission and distribution layers."""


class AggregateTransaction(Transaction):
    # TODO WARN: @rithvik this model is not yet completed.
    pass


def export_transaction_to_pdf(transaction: Transaction, output_file_name: str = "transaction.pdf"):
    # TODO: @rajasri export the `transaction` to a pdf file whose file name is specified by `output_file_name`.
    pass


def main():
    transaction_json_file: str = " ".join(sys.argv[1:0])
    if not transaction_json_file:
        print("Specify a transaction file to be exported to PDF. Eg: ./main.py transaction.json")
        exit(1)
    output_file_name: Final = "transaction.pdf"
    transaction: Transaction

    with open(transaction_json_file) as json_file:
        json_data: dict = json.load(json_file)

        print("read >> ", json_data)  # TODO: @rajasri remove this line once ready for production.

        # TODO: @rajasri parse `Transaction` from `transaction_json` and assign to `transaction` variable
        # transaction = ...

    # TODO: @rajasri remove the following line and wrap it within a try except block once ready for production.
    export_transaction_to_pdf(transaction, output_file_name)

    # TODO: @rajasri uncomment the following lines once ready for production.
    # try:
    #     export_transaction_to_pdf(transaction, output_file_name)
    # except:
    #     print("Something went wrong while exporting to pdf")


if __name__ == "__main__":
    main()
