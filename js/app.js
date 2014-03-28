
// icons:: https://www.iconfinder.com/search/?q=iconset:jigsoar-icons


(function(exports){

        var canvasList = [];
        var startX,startY,currentTarget,selectedIndex = 0;
        var currentCanvas;
        var context;
        var toolActive = false;
        var wasMove = false;
        var currentColor = "#FFF";
        var selectedTool;


        var pxSz = 40;
        var halfPixel = 0;//pxSz / 2;

        exports.init = function()
        {
            toolBtnColor.style.borderColor = currentColor;

            canvasList.push(drawCanvas);
            currentCanvas = canvasList[0];
            context = currentCanvas.getContext('2d');
            context.width = 480;
            context.height = 640;
            
            clearCanvas(0);

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

            clrPicker.onclick = onColorPicker;
        }

        function clearCanvas(clr) {

            context.clearRect(0,0,480,640);
            context.fillStyle = clr || "#000";
            context.strokeStyle = "#333";
            context.beginPath();
            for(var x =halfPixel; x < 480; x+=pxSz) {
                for(var y = halfPixel;y < 640; y+= pxSz) {
                    context.fillRect(x,y,pxSz,pxSz);
                    context.strokeRect(x,y,pxSz,pxSz);
                }
            }
            context.stroke();
            context.closePath();
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
                    selectedTool = e.target;
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
                case "toolBtnExport" :
                    console.log(currentCanvas.toDataURL("image/png", ""));
                    break;
                case "toolBtnSettings": 
                    break;
                case "toolBtnDraw" : 
                    selectedTool = e.target;
                    break;
                case "toolBtnDelete" : 
                    clearCanvas();
                    break;
                case "toolBtnZoom" :
                    selectedTool = e.target; 
                    break;
                
                
            }

            e.target.active = true;
            e.target.style.backgroundColor = "#884466";
        
        }

        function onColorPicker(evt) {
            toolBtnColor.active = false;
            currentColor = evt.target.style.backgroundColor;
            toolBtnColor.style.borderColor = currentColor;
            showColorPicker(false);

            selectedTool.active = true;
            selectedTool.style.backgroundColor = "#884466";
        }

        function removeSelection() {
            toolBtnColor.style.backgroundColor = "#000";
            setTimeout(function(){
                showColorPicker(false);
            },10);
        }

        function createColorPicker() {
            var pre = [0,128,255];
            var colors = [];
            var stride = pre.length;

            for(var b = 0; b < stride; b++) {
                for(var g = 0; g < stride; g++) {
                    for(var r = 0; r < stride; r++) {
                        colors.push("rgba(" + pre[r] + "," + pre[g] + "," + pre[b] + ",1.0)");
                        //colors.push("rgba(" + pre[r] + "," + pre[g] + "," + pre[b] + ",0.5)");  
                    }
                }
            }
                
            for(var n = 0; n < colors.length; n++) {
                var elem = document.createElement("div");
                elem.style.backgroundColor = colors[n];
                clrPicker.appendChild(elem);
            }
        }
        
        function showColorPicker(bShow)
        {
            if(bShow) {
                document.body.addEventListener("mouseup",removeSelection);
                clrPicker.style.display = "block";
            }
            else {
                document.body.removeEventListener("mouseup",removeSelection);
                clrPicker.style.display = "none";
            }

            if(clrPicker.children.length == 0) {
                createColorPicker();
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

            context.fillStyle = currentColor;
            toolActive = true;
            wasMove = false;
            context.beginPath();
        }

        function onToolClick(e) {
            if(!wasMove) {

                var x = Math.floor(( e.pageX - currentCanvas.offsetLeft ) / pxSz );// - e.currentTarget.offsetLeft;
                var y = Math.floor(( e.pageY - currentCanvas.offsetTop ) / pxSz );// - e.currentTarget.offsetTop;

                context.beginPath();
                context.fillRect(x * pxSz,y*pxSz,pxSz,pxSz);
                context.strokeRect(x * pxSz,y*pxSz,pxSz,pxSz);
                context.stroke();
                context.closePath();
            }
        }

        function onToolMove(e)
        {
            if(toolActive) {

                e.preventDefault();

                var x = Math.floor(( e.pageX - currentCanvas.offsetLeft ) / pxSz );
                var y = Math.floor(( e.pageY - currentCanvas.offsetTop ) / pxSz );

                if(x != startX || y != startY) {
                    context.fillRect(x * pxSz,y*pxSz,pxSz,pxSz);
                	context.strokeRect(x * pxSz,y*pxSz,pxSz,pxSz);
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
