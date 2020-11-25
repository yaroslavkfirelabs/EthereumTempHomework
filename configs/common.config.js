module.exports = {
    publicKeys: process.env.PUBLIC_KEYS.split(", "),
    privateKeys: process.env.PRIVATE_KEYS.split(", ").map(x => 
        x.startsWith('0x') ? x.substring(2) : x
    )
}