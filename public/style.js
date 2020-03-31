
if(screen.width <= 576){
    document.querySelector(".contact").addEventListener("click" ,()=>{
        
        document.getElementById("leftPanel").style.width = 0;
        document.getElementById("leftPanel").style.display = "none";
        document.getElementById("rightPanel").style.width = "100%";
        document.getElementById("rightPanel").style.display = "block";

     });

     document.querySelector(".back").addEventListener("click", ()=>{
         document.getElementById("rightPanel").style.width = 0;
        document.getElementById("rightPanel").style.display = "none";
        document.getElementById("leftPanel").style.width = "100%";
        document.getElementById("leftPanel").style.display = "block";
     })
}

