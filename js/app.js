
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

        var pixelData;
        var pxSz = 40;

        var undoStack = [];

        exports.init = function()
        {
            toolBtnColor.style.borderColor = currentColor;

            initCanvas();
            
            var btns = document.querySelectorAll("#toolBar div");
            for(var n = 0; n<btns.length; n++) {
                btns[n].addEventListener('click',onToolBtn);
            }
            
            onToolBtn({target:btns[0]});
            clrPicker.onclick = onColorPicker;
        }

        function initCanvas() {

            canvasList.push(drawCanvas);
            currentCanvas = canvasList[0];
            context = currentCanvas.getContext('2d');
            context.width = 480;
            context.height = 640;
            
            clearCanvas();

            canvasHolder.addEventListener("pointerdown",onToolStart);
            canvasHolder.addEventListener("pointermove", onToolMove);
            canvasHolder.addEventListener("pointerup",  onToolEnd);
            canvasHolder.addEventListener("click",  onToolClick);
            
        }

        function clearCanvas(clr) {

            context.clearRect(0,0,480,640);
            context.fillStyle = clr || "#000";
            context.strokeStyle = "#333";
            context.beginPath();
            pixelData = [];

            var pX = Math.ceil(480 / pxSz);
            var pY = Math.ceil(640 / pxSz);

            for (var x = 0; x < pX; x++) {
                pixelData[x] = [];
                for (var y = 0; y < pY; y++) {
                    pixelData[x][y] = 0;//context.fillStyle;
                    context.fillRect(x * pxSz, y * pxSz, pxSz, pxSz);
                    context.strokeRect(x * pxSz, y * pxSz, pxSz, pxSz);
                }
            }
            context.stroke();
            context.closePath();
        }

        function exportImage() {

            var mux = 20;

            var tempCanvas = document.createElement("canvas");
            tempCanvas.width = pixelData.length * mux;
            tempCanvas.height = pixelData[0].length * mux;
// Not required to export data, but a HUD might be nice ...
/*
            tempCanvas.style.position = "absolute";
            tempCanvas.style.right = "0px";
            tempCanvas.style.top = "0px";
            document.body.appendChild(tempCanvas);
*/
            var ctx = tempCanvas.getContext('2d');

            // if we want a background color, it should go here ...
            //ctx.clearRect(0, 0, pixelData.length * mux, pixelData[0].length * mux);

            ctx.lineCap = "square";
            ctx.lineJoin = "miter";
            ctx.beginPath();
            for (var x = 0; x < pixelData.length; x++) {
                for (var y = 0; y < pixelData[x].length; y++) {
                    
                    if (pixelData[x][y] != 0) {
                        ctx.fillStyle = pixelData[x][y];
                        ctx.fillRect(x * mux, y * mux, mux, mux);
                    }
                }
            }

            ctx.closePath();

            window.open(tempCanvas.toDataURL("image/png", ""));
     

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
                    doUndoable();
                    break;
                case "toolBtnColor" : 
                    if(e.target.active) {
                        e.target.active = false;
                        showColorPicker(false);
                        return;
                    }
                    showColorPicker(true);
                    break;
                case "toolBtnExport":
                    exportImage();
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

        function setPixelColor(x,y,clr,noUndo) {

            if (!noUndo) {
                undoStack.push({ x: x, y: y, clr: pixelData[x][y] });
            }
            pixelData[x][y] = clr;
        }

        function doUndoable() {
            var obj = undoStack.pop();
            if (obj) {

                setPixelColor(obj.x, obj.y, obj.clr, true);
                // store current context.color
                var currentColor = context.fillStyle;
                context.fillStyle = obj.clr || "#000";

                context.beginPath();
                context.fillRect(obj.x * pxSz, obj.y * pxSz, pxSz, pxSz);
                context.strokeRect(obj.x * pxSz, obj.y * pxSz, pxSz, pxSz);
                context.stroke();
                context.closePath();
                // restore current context.color
                context.fillStyle = currentColor;

                if (undoStack.length < 1) {
                       // TODO: disable undo btn
                }
            }

        }

        function onToolClick(e) {
            if(!wasMove) {

                var x = Math.floor(( e.pageX - currentCanvas.offsetLeft ) / pxSz );
                var y = Math.floor(( e.pageY - currentCanvas.offsetTop ) / pxSz );

                context.beginPath();
                context.fillRect(x * pxSz, y * pxSz, pxSz, pxSz);
                context.strokeRect(x * pxSz, y * pxSz, pxSz, pxSz);
                setPixelColor(x, y, context.fillStyle);
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
                    context.strokeRect(x * pxSz, y * pxSz, pxSz, pxSz);
                    setPixelColor(x, y, context.fillStyle);
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
