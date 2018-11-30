[![Build Status](https://travis-ci.org/ElectronicCats/pxt-lora.svg?branch=master)](https://travis-ci.org/ElectronicCats/pxt-lora) 

# LoRa

Package adds support LoRa

## Install extension

Go menu -> Advanced -> Extensions and copy the next link

```
https://github.com/ElectronicCats/pxt-lora
```
press enter select packages in menu

## Usage

The package adds support **LoRa** for [Arduino MKR1300](https://store.arduino.cc/usa/mkr-wan-1300).
 
An library for sending and receiving data using [LoRa](https://www.semtech.com/technology/lora) radios.

## API


- `function send():` Write Packet to send. Each packet can contain up to 255 bytes.

- `function readVersion():` Read Version of chip.

- `function available():` Returns number of bytes available for reading.

- `function read():` Read the next byte from the packet.

- `function packetRssi():` Returns the RSSI of the received packet. 

- `function parsePacket:` Check if a packet has been received.  

### Pins Used 

The following pins are used for LoRa:  

*  -``PA15``- LORA SPI - MOSI
*  -``PA12``- LORA SPI - MISO
*  -``PA13``- LORA SPI - SCK
*  -``PA14``- LORA SPI - CS
*  -``PB09``- LORA SPI - BOOT
*  -``PA27``- LORA SPI - RST

## License

MIT

## Supported targets

* for PXT/maker

```
package  lora
```

