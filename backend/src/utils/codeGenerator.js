const  generateGroupBookingId = () => {
    const chars= "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    const generateBlock = () => {
        let block="";
        for (let i=0 ; i<= 4 ; i++){
            block += chars[Math.floor(Math.random() * chars.length)]
        }
        return block
    }

    return `SRI-${generateBlock()}-${generateBlock()}`
}

export {generateGroupBookingId}