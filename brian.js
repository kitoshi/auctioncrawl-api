
const test = async() => {
    console.log('beforetest')
    await new Promise(r => {
        setTimeout(r, 10000)
        console.log('insidepromise1')
    });
    console.log('promise1')
    await new Promise(r => {
        setTimeout(r, 10000)
        console.log('insidepromise2')
    })
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
    await test2()
}


testAll()

console.log('aftertest')
