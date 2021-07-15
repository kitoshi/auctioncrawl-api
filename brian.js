
const test = async() => {
    console.log('beforetest')
    await new Promise(r => {
        setTimeout(r, 1000)
        console.log('insidepromise1')
    });
    console.log('promise1')
    
        for(let i=0; i<5; i++){
            await new Promise(r => {
                setTimeout(r, 1000)
        console.log([i])
    })
        }
    
    console.log('promise2')
}

const test2 = async() => {
    console.log('beforetest2')
    await new Promise(r => {
        setTimeout(r, 10000)
        console.log('insidepromise21')
    });
    console.log('promise21')
    await new Promise(r => {
        setTimeout(r, 10000)
        console.log('insidepromise22')
    })
    console.log('promise22')
}


const testAll = async() => {
    await test(),
    await test2(),
    console.log('aftertest')
}


testAll()
