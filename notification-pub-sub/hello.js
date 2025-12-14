// Debouncing & throttling

// let dTimer ;

// function deBounce(fn , fn2,  timer){
//     clearTimeout(dTimer) // remove 10 previous timer
    
//     dTimer = setTimeout(fn , timer)
//     //  10 -> fn , 1000  --> Removed
//     // 11 -> fn , 1000  --> 
// }

// function deBouncTest(){
//     console.log("Hello ")
// }

// function deBouncTest2(){
//     console.log("Hello 2")
// }

// setInterval(()=>{
//     deBounce(deBouncTest ,deBouncTest2 , 1000)
// }, 2000)


// Throttling

let flag = true ;

function throttleTest(){
    console.log("Hello ")
}

function throttle(fn , timer){
    if(flag){
        flag = false ;
        fn() // execture the function

        setTimeout(()=>{
            flag = true ;
        }, timer)
    }
}

setInterval(()=>{
    throttle(throttleTest , 1000);
} , 200)


