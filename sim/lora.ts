namespace pxsim.lora {
    /**
    * Read Version
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="readVersion" block="readVersion" shim=lora::readVersion
    export function readVersion(): number {  
        return 0      
    }
    /**
    * Parse Packet to send
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="parsePacket" block="parsePacket" shim=lora::parsePacket
    export function parsePacket(): number {  
        return 0      
    }
    /**
    * Packet RSSI
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="packetRssi" block="packetRssi" shim=lora::packetRssi
    export function packetRssi(): number {
        return 0
    }
    
    /**
     * Write Packet to send
     **/
    //% blockId="Send" block="Send %string"
    //% weight=45 blockGap=8 
    //% name.fieldEditor="gridpicker"
    //% name.fieldOptions.width=220
    //% name.fieldOptions.columns=4 shim=lora::send
    export function send(): void { 

    }
    /**
    * Available Packet
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="available" block="available" shim=lora::available
    export function available(): number {  
        return 0      
    }
    /**
    * Read Packet
    **/
    //% parts="lora"
    //% weight=45 blockGap=8 blockId="read" block="read" shim=lora::read
    export function read(): number {  
        return 0      
    }
}