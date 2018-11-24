[![Build Status](https://travis-ci.org/ElectronicCats/pxt-lora.svg?branch=master)](https://travis-ci.org/ElectronicCats/pxt-lora) 

# LoRa

Package adds support LoRa **(Status: Beta)**

WARNING: Current version works with [codal circuit playground](https://github.com/ElectronicCats/codal-circuit-playground/releases/tag/v1.5.4-mixer) v1.5.4-mixer 

## Easy Testing
You can try our makecode version

[http://makercode.electroniccats.com](http://makercode.electroniccats.com)

## Current way of installation for local server beta version

This setup is needed if you plan to make changes in PXT itself. In most cases, it's a bit of an overkill
if you are building a package for the Adafruit editor.

* install [Node.js 8+](https://nodejs.org/en/download/)
* install the PXT command line
```
npm install -g pxt
```

In a common folder,

* clone https://github.com/Microsoft/pxt to ``pxt`` folder
* clone https://github.com/ElectronicCats/pxt-common-packages
* clone https://github.com/ElectronicCats/pxt-maker **branch MKR-with-lora** to ``pxt-maker`` folder
* go to ``pxt`` and run

```
npm install
npm run build
```

* go to ``pxt-common-packages`` and run

```
npm install
npm link ../pxt
```

* go to ``pxt-maker `` and run

```
npm install
npm link ../pxt
npm link ../pxt-common-packages
```

### to run the local server

From root github folder,

```
cd pxt-maker
pxt serve
```
## Intall extension

Go menu -> Advanced -> Extensions and copy the next link

```
https://github.com/ElectronicCats/pxt-lora
```
press enter select packages in menu

## Usage

The package adds support for the **LoRa** of MKR1300.
 
* An library for sending and receiving data using [LoRa](https://www.semtech.com/technology/lora) radios.	

### Pins Used 

The following micro:bit pins are used for BMP180, atmospheric monitoring:  

*  -``PA15``- LORA SPI - MOSI
*  -``PA12``- LORA SPI - MISO
*  -``PA13``- LORA SPI - SCK
*  -``PA14``- LORA SPI - CS
*  -``PB09``- LORA SPI - BOOT
*  -``PA27``- LORA SPI - RST

### TODO
- [ ] Turn on your automated build on https://travis-ci.org
- [ ] Use "pxt bump" to create a tagged release on GitHub
- [ ] Get your package reviewed and approved https://makecode.microbit.org/packages/approval, to use this package, go to https://pxt.microbit.org, click ``Add package`` and search for **Lora**.


## License

MIT

## Supported targets

* for PXT/maker

```package
lora
```

