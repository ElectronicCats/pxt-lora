// Copyright (c) Electronic Cats. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
// Based in the work of Sandeep Mistry, thanks https://github.com/sandeepmistry/arduino-LoRa

#include "pxt.h"
#include "SPI.h"
#include <string>
#include <stdlib.h> 

// registers
#define REG_FIFO                 0x00
#define REG_OP_MODE              0x01
#define REG_FRF_MSB              0x06
#define REG_FRF_MID              0x07
#define REG_FRF_LSB              0x08
#define REG_PA_CONFIG            0x09
#define REG_LNA                  0x0c
#define REG_FIFO_ADDR_PTR        0x0d
#define REG_FIFO_TX_BASE_ADDR    0x0e
#define REG_FIFO_RX_BASE_ADDR    0x0f
#define REG_FIFO_RX_CURRENT_ADDR 0x10
#define REG_IRQ_FLAGS            0x12
#define REG_RX_NB_BYTES          0x13
#define REG_PKT_SNR_VALUE        0x19
#define REG_PKT_RSSI_VALUE       0x1a
#define REG_MODEM_CONFIG_1       0x1d
#define REG_MODEM_CONFIG_2       0x1e
#define REG_PREAMBLE_MSB         0x20
#define REG_PREAMBLE_LSB         0x21
#define REG_PAYLOAD_LENGTH       0x22
#define REG_MODEM_CONFIG_3       0x26
#define REG_FREQ_ERROR_MSB       0x28
#define REG_FREQ_ERROR_MID       0x29
#define REG_FREQ_ERROR_LSB       0x2a
#define REG_RSSI_WIDEBAND        0x2c
#define REG_DETECTION_OPTIMIZE   0x31
#define REG_DETECTION_THRESHOLD  0x37
#define REG_SYNC_WORD            0x39
#define REG_DIO_MAPPING_1        0x40
#define REG_VERSION              0x42

// modes
#define MODE_LONG_RANGE_MODE     0x80
#define MODE_SLEEP               0x00
#define MODE_STDBY               0x01
#define MODE_TX                  0x03
#define MODE_RX_CONTINUOUS       0x05
#define MODE_RX_SINGLE           0x06

// PA config
#define PA_BOOST                 0x80

// IRQ masks
#define IRQ_TX_DONE_MASK           0x08
#define IRQ_PAYLOAD_CRC_ERROR_MASK 0x20
#define IRQ_RX_DONE_MASK           0x40

#define MAX_PKT_LENGTH           255

#define PA_OUTPUT_RFO_PIN          0
#define PA_OUTPUT_PA_BOOST_PIN     1

// Arduino hacks
typedef bool boolean;
typedef uint8_t byte;
#define bitSet(value, bit) ((value) |= (1UL << (bit)))
#define bitClear(value, bit) ((value) &= ~(1UL << (bit)))
#define bitWrite(value, bit, bitvalue) (bitvalue ? bitSet(value, bit) : bitClear(value, bit))

namespace lora {
  long frequency = 915E6;
  int _packetIndex = 0;
  int _implicitHeaderMode =0;
  int implicitHeader = false;
  
  int beginPacket();
  
  int endPacket();

  int readVersion();

  int parsePacket(int size = 0);
  int packetRssi();
  float packetSnr();
  long packetFrequencyError();

  int available();
  int read();
  int peek();
  void flush();
  void idle();
  void sleep();

  void setTxPower(int level);
  void setFrequency(long frequency);
  void setSpreadingFactor(int sf);
  void setSignalBandwidth(long sbw);
  void setCodingRate4(int denominator);
  void setPreambleLength(long length);
  void setSyncWord(int sw);
  void enableCrc();
  void disableCrc();

  byte random();

  void explicitHeaderMode();
  void implicitHeaderMode();

  int getSpreadingFactor();
  long getSignalBandwidth();

  void setLdoFlag();

  void write(int byte);
  void writeRaw(const uint8_t *buffer, int size);
  void send(String a);

  uint8_t readRegister(uint8_t address);
  void writeRegister(uint8_t address, uint8_t value);

class WLora{
  public:
  CODAL_SPI lora;

  WLora()
        : lora(*LOOKUP_PIN(MOSI), *LOOKUP_PIN(MISO), *LOOKUP_PIN(SCK))
        {
          auto cs = LOOKUP_PIN(A8); 
          auto boot = LOOKUP_PIN(D15);
          auto rst = LOOKUP_PIN(A7);

          cs->setDigitalValue(0);

          // Hardware reset

          boot->setDigitalValue(0);

          rst->setDigitalValue(1);
          fiber_sleep(200);
          rst->setDigitalValue(0);
          fiber_sleep(200);
          rst->setDigitalValue(1);
          fiber_sleep(50);
          cs->setDigitalValue(1);
          lora.setFrequency(250000);
          lora.setMode(0);

          //Sleep
          cs->setDigitalValue(0);
          lora.write(REG_OP_MODE | 0x80);
          lora.write(MODE_LONG_RANGE_MODE | MODE_SLEEP);
          cs->setDigitalValue(1);
          
          // set frequency

          uint64_t frf = ((uint64_t)frequency << 19) / 32000000;

          //writeRegister(REG_FRF_MSB, (uint8_t)(frf >> 16));
          cs->setDigitalValue(0);
          lora.write(REG_FRF_MSB | 0x80);
          lora.write((uint8_t)(frf >> 16));
          cs->setDigitalValue(1);
          
          //writeRegister(REG_FRF_MID, (uint8_t)(frf >> 8));
          cs->setDigitalValue(0);
          lora.write(REG_FRF_MID | 0x80);
          lora.write((uint8_t)(frf >> 8));
          cs->setDigitalValue(1);
          
          //writeRegister(REG_FRF_LSB, (uint8_t)(frf >> 0));
          cs->setDigitalValue(0);
          lora.write(REG_FRF_LSB | 0x80);
          lora.write((uint8_t)(frf >> 0));
          cs->setDigitalValue(1);

          // set base addresses
          //REG_FIFO_TX_BASE_ADDR
          cs->setDigitalValue(0);
          lora.write(REG_FIFO_TX_BASE_ADDR | 0x80);
          lora.write(0);
          cs->setDigitalValue(1);

          //REG_FIFO_RX_BASE_ADDR
          cs->setDigitalValue(0);
          lora.write(REG_FIFO_RX_BASE_ADDR | 0x80);
          lora.write(0);
          cs->setDigitalValue(1);

          // set LNA boost

          cs->setDigitalValue(0);
          lora.write(REG_LNA & 0x7f);
          uint8_t response = lora.write(0x00);
          cs->setDigitalValue(1);
          
          cs->setDigitalValue(0);
          lora.write(REG_LNA | 0x80);
          lora.write(response| 0x03);
          cs->setDigitalValue(1);


          // set auto AGC
          cs->setDigitalValue(0);
          lora.write(REG_MODEM_CONFIG_3 | 0x80);
          lora.write(0x04);
          cs->setDigitalValue(1);

          // set output power to 17 dBm
          cs->setDigitalValue(0);
          lora.write(REG_PA_CONFIG | 0x80);
          lora.write(0x70 | 17);
          cs->setDigitalValue(1);

          // put in standby mode
          cs->setDigitalValue(0);
          lora.write(REG_OP_MODE | 0x80);
          lora.write(MODE_LONG_RANGE_MODE | MODE_STDBY);
          cs->setDigitalValue(1);
          
        }
};
  
SINGLETON(WLora);

// Write Register of SX. 
void writeRegister(uint8_t address, uint8_t value)
{
  
  auto p = LOOKUP_PIN(A8);
  p->setDigitalValue(0);
  
  getWLora()->lora.write(address | 0x80);
  getWLora()->lora.write(value);
  
  p->setDigitalValue(1);

}

// Read register of SX 
uint8_t readRegister(uint8_t address)
{
  uint8_t response;
  auto s = getWLora();
  auto p = LOOKUP_PIN(A8);
  p->setDigitalValue(0);
  
  s->lora.write(address & 0x7f);
  response = s->lora.write(0x00);
  
  p->setDigitalValue(1);

  return response;
}

void explicitHeaderMode()
{
  _implicitHeaderMode = 0;
  writeRegister(REG_MODEM_CONFIG_1, readRegister(REG_MODEM_CONFIG_1) & 0xfe);
}

void implicitHeaderMode()
{
  _implicitHeaderMode = 1;

  writeRegister(REG_MODEM_CONFIG_1, readRegister(REG_MODEM_CONFIG_1) | 0x01);
}

// Begin Packet to send
int beginPacket()
{
  // put in standby mode
  idle();

  if (implicitHeader) {
    implicitHeaderMode();
  } else {
    explicitHeaderMode();
  }

  // reset FIFO address and paload length
  writeRegister(REG_FIFO_ADDR_PTR, 0);
  writeRegister(REG_PAYLOAD_LENGTH, 0);

  return 1;
}

//% 
int readVersion()
{
  return readRegister(0x42);
}

int endPacket()
{
  // put in TX mode
  writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_TX);

  // wait for TX done
  while ((readRegister(REG_IRQ_FLAGS) & IRQ_TX_DONE_MASK) == 0) {
    //TO DO: yield();
    fiber_sleep(10);
  }

  // clear IRQ's
  writeRegister(REG_IRQ_FLAGS, IRQ_TX_DONE_MASK);

  return 1;
}

//%
int parsePacket(int size)
{
  int packetLength = 0;
  int irqFlags = readRegister(REG_IRQ_FLAGS);

  if (size > 0) {
    implicitHeaderMode();

    writeRegister(REG_PAYLOAD_LENGTH, size & 0xff);
  } else {
    explicitHeaderMode();
  }

  // clear IRQ's
  writeRegister(REG_IRQ_FLAGS, irqFlags);

  if ((irqFlags & IRQ_RX_DONE_MASK) && (irqFlags & IRQ_PAYLOAD_CRC_ERROR_MASK) == 0) {
    // received a packet
    _packetIndex = 0;

    // read packet length
    if (_implicitHeaderMode) {
      packetLength = readRegister(REG_PAYLOAD_LENGTH);
    } else {
      packetLength = readRegister(REG_RX_NB_BYTES);
    }

    // set FIFO address to current RX address
    writeRegister(REG_FIFO_ADDR_PTR, readRegister(REG_FIFO_RX_CURRENT_ADDR));

    // put in standby mode
    idle();
  } else if (readRegister(REG_OP_MODE) != (MODE_LONG_RANGE_MODE | MODE_RX_SINGLE)) {
    // not currently in RX mode

    // reset FIFO address
    writeRegister(REG_FIFO_ADDR_PTR, 0);

    // put in single RX mode
    writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_RX_SINGLE);
  }

  return packetLength;
}

//%
int packetRssi()
{
  return (readRegister(REG_PKT_RSSI_VALUE) - (frequency < 868E6 ? 164 : 157));
}

// Packet SNR
float packetSnr()
{
  return ((int8_t)readRegister(REG_PKT_SNR_VALUE)) * 0.25;
}

// Begin Packet Frecuency Error
long packetFrequencyError()
{
  int32_t freqError = 0;
  freqError = static_cast<int32_t>(readRegister(REG_FREQ_ERROR_MSB) & 0xb111); //TODO Covert B111 to c++
  freqError <<= 8L;
  freqError += static_cast<int32_t>(readRegister(REG_FREQ_ERROR_MID));
  freqError <<= 8L;
  freqError += static_cast<int32_t>(readRegister(REG_FREQ_ERROR_LSB));

  if (readRegister(REG_FREQ_ERROR_MSB) & 0xb1000) { // Sign bit is on //TODO Covert B1000 to c++
     freqError -= 524288; // B1000'0000'0000'0000'0000
  }

  const float fXtal = 32E6; // FXOSC: crystal oscillator (XTAL) frequency (2.5. Chip Specification, p. 14)
  const float fError = ((static_cast<float>(freqError) * (1L << 24)) / fXtal) * (getSignalBandwidth() / 500000.0f); // p. 37

  return static_cast<long>(fError);
}


// Write Packet to send
void write(uint8_t byte)
{
  writeRaw(&byte, sizeof(byte));
}

//%
void send(String a)
{ 
  uint8_t intSend = 0;
  // put in standby mode
  idle();

  if (implicitHeader) {
    implicitHeaderMode();
  } else {
    explicitHeaderMode();
  }

  // reset FIFO address and paload length
  writeRegister(REG_FIFO_ADDR_PTR, 0);
  writeRegister(REG_PAYLOAD_LENGTH, 0);

  if( a->charCodeAt(0) ==  0)return;
  for(int i=0; i<254 ;i++){
    intSend =  a->getUTF8Data()[i];
    if(intSend  ==  0 && i == 0)return;
    if(intSend  ==  0)break;
    writeRaw(&intSend,1);
  }
    // put in TX mode
  writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_TX);

  // wait for TX done
  while ((readRegister(REG_IRQ_FLAGS) & IRQ_TX_DONE_MASK) == 0) {
    //TO DO: yield();
    fiber_sleep(10);
  }

  // clear IRQ's
  writeRegister(REG_IRQ_FLAGS, IRQ_TX_DONE_MASK);
  return;
}

void writeRaw(const uint8_t *buffer, int size)
{
  int currentLength = readRegister(REG_PAYLOAD_LENGTH);

  // check size
  if ((currentLength + size) > MAX_PKT_LENGTH) {
    size = MAX_PKT_LENGTH - currentLength;
  }

  // write data
  for (int i = 0; i < size; i++) {
    writeRegister(REG_FIFO, buffer[i]);
  }

  // update length
  writeRegister(REG_PAYLOAD_LENGTH, currentLength + size);
}

//%
int available()
{
  return (readRegister(REG_RX_NB_BYTES) - _packetIndex);
}

//%
int read()
{
  if (!available()) {
    return -1;
  }

  _packetIndex++;

  return readRegister(REG_FIFO);
}

/**
* Peek Packet to send
**/
int peek()
{
  if (!available()) {
    return -1;
  }

  // store current FIFO address
  int currentAddress = readRegister(REG_FIFO_ADDR_PTR);

  // read
  uint8_t b = readRegister(REG_FIFO);

  // restore FIFO address
  writeRegister(REG_FIFO_ADDR_PTR, currentAddress);

  return b;
}

void flush()
{
  //TODO
}

void idle()
{
  writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_STDBY);
}

/**
* Sleep Mode
**/
void sleep()
{
  writeRegister(REG_OP_MODE, MODE_LONG_RANGE_MODE | MODE_SLEEP);
}

/**
* Set Tx Power
**/
void setTxPower(int level)
{
  int outputPin = PA_OUTPUT_PA_BOOST_PIN;

  if (PA_OUTPUT_RFO_PIN == outputPin) {
    // RFO
    if (level < 0) {
      level = 0;
    } else if (level > 14) {
      level = 14;
    }

    writeRegister(REG_PA_CONFIG, 0x70 | level);
  } else {
    // PA BOOST
    if (level < 2) {
      level = 2;
    } else if (level > 17) {
      level = 17;
    }

    writeRegister(REG_PA_CONFIG, PA_BOOST | (level - 2));
  }
}

/**
* Set Frecuency of LoRa
**/
void setFrequency(long frequency)
{

  uint64_t frf = ((uint64_t)frequency << 19) / 32000000;

  writeRegister(REG_FRF_MSB, (uint8_t)(frf >> 16));
  writeRegister(REG_FRF_MID, (uint8_t)(frf >> 8));
  writeRegister(REG_FRF_LSB, (uint8_t)(frf >> 0));
}

/**
* Get Spreading Factor of LoRa
**/
int getSpreadingFactor()
{
  return readRegister(REG_MODEM_CONFIG_2) >> 4;
}

void setSpreadingFactor(int sf)
{
  if (sf < 6) {
    sf = 6;
  } else if (sf > 12) {
    sf = 12;
  }

  if (sf == 6) {
    writeRegister(REG_DETECTION_OPTIMIZE, 0xc5);
    writeRegister(REG_DETECTION_THRESHOLD, 0x0c);
  } else {
    writeRegister(REG_DETECTION_OPTIMIZE, 0xc3);
    writeRegister(REG_DETECTION_THRESHOLD, 0x0a);
  }

  writeRegister(REG_MODEM_CONFIG_2, (readRegister(REG_MODEM_CONFIG_2) & 0x0f) | ((sf << 4) & 0xf0));
  setLdoFlag();
}

/**
* Get Signal Bandwidth of LoRa
**/
long getSignalBandwidth()
{
  byte bw = (readRegister(REG_MODEM_CONFIG_1) >> 4);
  switch (bw) {
    case 0: return 7.8E3;
    case 1: return 10.4E3;
    case 2: return 15.6E3;
    case 3: return 20.8E3;
    case 4: return 31.25E3;
    case 5: return 41.7E3;
    case 6: return 62.5E3;
    case 7: return 125E3;
    case 8: return 250E3;
    case 9: return 500E3;
  }
}

/**
* Set Signal Bandwidth of LoRa
**/
void setSignalBandwidth(long sbw)
{
  int bw;

  if (sbw <= 7.8E3) {
    bw = 0;
  } else if (sbw <= 10.4E3) {
    bw = 1;
  } else if (sbw <= 15.6E3) {
    bw = 2;
  } else if (sbw <= 20.8E3) {
    bw = 3;
  } else if (sbw <= 31.25E3) {
    bw = 4;
  } else if (sbw <= 41.7E3) {
    bw = 5;
  } else if (sbw <= 62.5E3) {
    bw = 6;
  } else if (sbw <= 125E3) {
    bw = 7;
  } else if (sbw <= 250E3) {
    bw = 8;
  } else /*if (sbw <= 250E3)*/ {
    bw = 9;
  }

  writeRegister(REG_MODEM_CONFIG_1, (readRegister(REG_MODEM_CONFIG_1) & 0x0f) | (bw << 4));
  setLdoFlag();
}

void setLdoFlag()
{
  // Section 4.1.1.5
  long symbolDuration = 1000 / ( getSignalBandwidth() / (1L << getSpreadingFactor()) ) ;
    
  // Section 4.1.1.6
  boolean ldoOn = symbolDuration > 16;
    
  uint8_t config3 = readRegister(REG_MODEM_CONFIG_3);
  bitWrite(config3, 3, ldoOn);
  writeRegister(REG_MODEM_CONFIG_3, config3);
}

void setCodingRate4(int denominator)
{
  if (denominator < 5) {
    denominator = 5;
  } else if (denominator > 8) {
    denominator = 8;
  }

  int cr = denominator - 4;

  writeRegister(REG_MODEM_CONFIG_1, (readRegister(REG_MODEM_CONFIG_1) & 0xf1) | (cr << 1));
}

void setPreambleLength(long length)
{
  writeRegister(REG_PREAMBLE_MSB, (uint8_t)(length >> 8));
  writeRegister(REG_PREAMBLE_LSB, (uint8_t)(length >> 0));
}

void setSyncWord(int sw)
{
  writeRegister(REG_SYNC_WORD, sw);
}

void enableCrc()
{
  writeRegister(REG_MODEM_CONFIG_2, readRegister(REG_MODEM_CONFIG_2) | 0x04);
}

void disableCrc()
{
  writeRegister(REG_MODEM_CONFIG_2, readRegister(REG_MODEM_CONFIG_2) & 0xfb);
}

byte random()
{
  return readRegister(REG_RSSI_WIDEBAND);
}

}
