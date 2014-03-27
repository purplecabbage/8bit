

(function(exports){

        var canvasList = [];
        var startX,startY,currentTarget,selectedIndex = 0;
        var currentCanvas;
        var context;
        var toolActive = false;
        var wasMove = false;
        
        var selectedTool = "draw";

        var pixelSize = 40;
        var halfPixel = 0;//pixelSize / 2;

        exports.init = function()
        {
            canvasList.push(document.getElementById("c1"));
            currentCanvas = canvasList[0];
            context = currentCanvas.getContext('2d');
            context.width = 500;
            context.height = 500;
            context.clearRect(0,0,500,500);
            context.strokeStyle = "#000";
            context.beginPath();
            for(var x =halfPixel; x< 500; x+=pixelSize) {
                for(var y = halfPixel;y < 500; y+= pixelSize) {
                    context.fillRect(x,y,pixelSize,pixelSize);
                    context.strokeRect(x,y,pixelSize,pixelSize);
                }
            }
            context.stroke();
            context.closePath();
            canvasHolder.addEventListener("pointerdown",onToolStart);
            canvasHolder.addEventListener("pointermove", onToolMove);
            canvasHolder.addEventListener("pointerup",  onToolEnd);
            canvasHolder.addEventListener("click",  onToolClick);
            
            var btns = document.querySelectorAll("#toolBar div");
            for(var n = 0; n<btns.length; n++)
            {
                btns[n].addEventListener('click',onToolBtn);
            }
            
            onToolBtn({target:btns[0]});
        }
        
        function onToolBtn(e)
        {

            var btns = document.querySelectorAll("#toolBar div");
            for(var n = 0; n<btns.length; n++)
            {
                btns[n].style.backgroundColor = "Black";
            }

            switch(e.target.id) 
            {
                case "toolBtnMove" : 
                    break;
                case "toolBtnUndo" : 
                    
                    break;
                case "toolBtnColor" : 
                    if(e.target.active) {
                        e.target.active = false;
                        showColorPicker(false);
                        return;
                    }
                    showColorPicker(true);
                    break;
                case "toolBtnDraw" : 
                    
                    break;
                
                
            }

            e.target.active = true;
            e.target.style.backgroundColor = "#884466";
        
        }
        
        function showColorPicker(bShow)
        {

            var elemWrap = document.querySelector("#clrPicker");

            if(!bShow) { // hide it
                elemWrap.innerHTML = "";
                return;
            }
            
            var pre = ["00","66","AA","FF"];
            var colors = [];
            
            for(var red = 0; red < 256; red+=64) {
                for(var green = 0; green < 256; green+=64) {
                    for(var blue = 0; blue < 256; blue += 64) {
                        colors.push("rgb("+ red + "," + green + "," + blue + ")");
                     }
                }
            }
            
            for(var n = 0; n < colors.length; n++)
            {
                var elem = document.createElement("span");
                elem.style.backgroundColor = colors[n];
                console.log("color = " + colors[n]);
                elem.style.width = "12px";
                elem.style.height = "12px";
                elemWrap.appendChild(elem);
            }
            
        }

        function updateDebugText(x,y)
        {
            //toolBar.innerText = startX + "," + startY + "," + x + "," + y;
        }

        function onToolStart(e)
        {
            // if(toolActive)
            //     return;

            e.preventDefault();
            context.save();

            var clr = Math.floor( Math.random() * 256 * 256 * 256 );
            var r = ( clr >> 16 )  % 256 ;
            var g = ( clr >> 8 ) % 256;
            var b = clr % 256;

            var cssColor = "rgba(" + r + "," + g + "," + b + " ,0.5)";

            context.fillStyle = cssColor;
            toolActive = true;
            wasMove = false;
            context.beginPath();
        }

        function onToolClick(e) {
            if(!wasMove) {

                var x = Math.floor(( e.pageX - currentCanvas.offsetLeft ) / pixelSize );// - e.currentTarget.offsetLeft;
                var y = Math.floor(( e.pageY - currentCanvas.offsetTop ) / pixelSize );// - e.currentTarget.offsetTop;

                context.beginPath();
                context.fillRect(x * pixelSize,y*pixelSize,pixelSize,pixelSize);
                context.strokeRect(x * pixelSize,y*pixelSize,pixelSize,pixelSize);
                context.stroke();
                context.closePath();
            }
        }

        function onToolMove(e)
        {
            if(toolActive) {

                e.preventDefault();

                var x = Math.floor(( e.pageX - currentCanvas.offsetLeft ) / pixelSize );
                var y = Math.floor(( e.pageY - currentCanvas.offsetTop ) / pixelSize );

                if(x != startX || y != startY) {
                    context.fillRect(x * pixelSize,y*pixelSize,pixelSize,pixelSize);
                	context.strokeRect(x * pixelSize,y*pixelSize,pixelSize,pixelSize);
                    wasMove = true;
                }

                context.stroke();
                startX = x;
                startY = y;

                updateDebugText(x,y);
            }
        }

        function onToolEnd(e)
        {
            e.preventDefault();
            context.closePath();
            toolActive = false;
            startX = -1;
            startY = -1;

        }

})(window);
