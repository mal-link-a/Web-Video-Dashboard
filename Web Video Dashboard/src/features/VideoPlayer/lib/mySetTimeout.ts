function  createSetTimeout ( ) { 
    let timerId = 0 ; 
    let timerMap = {}; 
  
    function  mySetTimeout ( cb, time, ...args ) { 
      var id = timerId++; 
      timerMap[id] = true ; 
      let start = Date.now ( ) ; 
  
      function  triggerCallback ( ) { 
        if (!timerMap[id]) return ; 
        if ( Date.now ( ) > start + time) { 
          cb.apply ( this , args);       } else { requestIdleCallback (triggerCallback);       }     } requestIdleCallback (triggerCallback); return id;   } function myClearTimeout ( id ) { delete timerMap[id];   } return { mySetTimeout     ,     myClearTimeout   } } const {   mySetTimeout,   myClearTimeout } = createSetTimeout (); пусть таймер = mySetTimeout ( ( ...args ) = > { console.log ( "это setTimeout....." ,...args); } , 1000 , "сатиш" , "шривас" );
        
  