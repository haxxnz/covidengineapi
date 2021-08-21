import ccData from './ccData';

for(let i: number = 0; i < ccData.length; i++) {
    const line = ccData[i]
    // console.log(line)
    const addr = `${line.Payee} ${line.Particulars}`
    console.log(addr)
}

// console.log(ccData)


// Payee: 'LAWSON CONVENIENCE STORE',
// Particulars: 'AUCKLAND',